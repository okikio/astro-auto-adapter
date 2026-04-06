#!/usr/bin/env node
/**
 * @fileoverview astro-auto-adapter CLI
 *
 * Interactive command-line tool for managing Astro adapter installations.
 * Allows users to:
 *  - Run the initial setup wizard (`init`) to choose which deployment platforms
 *    to support and install the required adapter packages.
 *  - Add adapters to an existing project (`add`).
 *  - Remove adapters that are no longer needed (`remove`).
 *  - List all available adapters and their installation status (`list`).
 *
 * Follows the CLI best-practice guidelines published at https://clig.dev/:
 *  - Exits 0 on success, 1 on error, 2 on misuse (bad args).
 *  - Works gracefully in CI / non-TTY environments.
 *  - Always honours `--help` / `-h` and `--version` / `-v`.
 *  - Provides clear, actionable error messages.
 *  - Never writes to stdout for errors (uses stderr).
 *  - Uses spinners only when the terminal supports them (TTY check).
 *
 * @module cli
 */

import process from "node:process";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";
import {
  intro,
  outro,
  cancel,
  isCancel,
  multiselect,
  confirm,
  spinner,
  note,
  log,
} from "@clack/prompts";

const styles = {
  banner: (value: string) => styleText(["bgCyan", "black"], value),
  bold: (value: string) => styleText("bold", value),
  cyan: (value: string) => styleText("cyan", value),
  dim: (value: string) => styleText("dim", value),
  green: (value: string) => styleText("green", value),
  red: (value: string) => styleText("red", value),
  underline: (value: string) => styleText("underline", value),
  yellow: (value: string) => styleText("yellow", value),
} as const;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Fallback package version when `package.json` cannot be read. */
const VERSION_FALLBACK = "0.0.0";

/** Resolves the CLI version from the nearest package manifest. */
export async function getCliVersion(
  packageJsonUrl = new URL("../package.json", import.meta.url)
): Promise<string> {
  try {
    const raw = await readFile(packageJsonUrl, "utf8");
    const pkg = JSON.parse(raw) as { version?: unknown };
    if (typeof pkg.version === "string" && pkg.version.length > 0) {
      return pkg.version;
    }
  } catch {
    // Fall back to a placeholder when running without a package manifest.
  }

  return VERSION_FALLBACK;
}

/**
 * Metadata for every built-in adapter supported by astro-auto-adapter.
 *
 * Each entry describes:
 *  - `label`   – human-readable platform name shown in prompts.
 *  - `value`   – the adapter key used in `ASTRO_ADAPTER_MODE`.
 *  - `pkg`     – the npm package to install.
 *  - `hint`    – short description shown next to the option.
 *  - `envVars` – environment variables this platform sets automatically
 *                (used for auto-detection inside the library).
 */
type AdapterMetadata = {
  label: string;
  value: "node" | "vercel" | "netlify" | "cloudflare" | "deno" | "sst";
  pkg: string;
  hint: string;
  envVars: readonly string[];
  compatibilityNote?: string;
};

export const ADAPTERS: readonly AdapterMetadata[] = [
  {
    label: "Node.js",
    value: "node",
    pkg: "@astrojs/node",
    hint: "VPS, Docker, bare-metal servers",
    envVars: [],
  },
  {
    label: "Vercel",
    value: "vercel",
    pkg: "@astrojs/vercel",
    hint: "Vercel serverless & edge functions",
    envVars: ["VERCEL"],
  },
  {
    label: "Netlify",
    value: "netlify",
    pkg: "@astrojs/netlify",
    hint: "Netlify functions & edge",
    envVars: ["NETLIFY"],
  },
  {
    label: "Cloudflare",
    value: "cloudflare",
    pkg: "@astrojs/cloudflare",
    hint: "Cloudflare Workers & Pages",
    envVars: [],
  },
  {
    label: "Deno",
    value: "deno",
    pkg: "@deno/astro-adapter",
    hint: "Deno Deploy and Deno-based hosts",
    envVars: [],
  },
  {
    label: "SST (AWS)",
    value: "sst",
    pkg: "astro-sst",
    hint: "AWS via SST / OpenNext",
    envVars: [],
    compatibilityNote: "Astro 6 currently supports static output only for SST.",
  },
] as const;

/** Union of valid built-in adapter values. */
export type AdapterValue = (typeof ADAPTERS)[number]["value"];

// ---------------------------------------------------------------------------
// Package-manager detection
// ---------------------------------------------------------------------------

/**
 * Union of all package manager names recognised by this CLI.
 *
 * Covers every manager tracked by the
 * {@link https://benchmarks.vlt.sh/#/package-managers/clean vlt benchmarks}
 * plus Deno's built-in package management:
 *
 * | Manager | Lockfile          | User-agent prefix |
 * |---------|-------------------|-------------------|
 * | npm     | package-lock.json | `npm/`            |
 * | pnpm    | pnpm-lock.yaml    | `pnpm/`           |
 * | yarn    | yarn.lock         | `yarn/`           |
 * | bun     | bun.lock(b)       | `bun/`            |
 * | vlt     | vlt-lock.json     | `vlt/`            |
 * | deno    | deno.lock         | `deno/`           |
 */
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "vlt" | "deno";

/** All recognised package manager names (used for runtime validation). */
const PACKAGE_MANAGERS: readonly PackageManager[] = [
  "npm",
  "pnpm",
  "yarn",
  "bun",
  "vlt",
  "deno",
] as const;

/**
 * Attempts to detect the package manager in use by inspecting lockfiles in
 * the current working directory, and by checking for well-known environment
 * variables set by package manager environments.
 *
 * Detection order:
 *  1. `PACKAGE_MANAGER` env var (explicit override).
 *  2. `npm_config_user_agent` — set by npm, pnpm, yarn, bun, vlt, deno when running scripts.
 *  3. Lockfile presence: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn,
 *     `bun.lockb` / `bun.lock` → bun, `deno.lock` → deno,
 *     `vlt-lock.json` → vlt, `package-lock.json` → npm.
 *  4. Falls back to `npm`.
 *
 * @returns The name of the detected package manager.
 */
export function detectPackageManager(): PackageManager {
  // 1. Explicit override
  const override = process.env.PACKAGE_MANAGER;
  if (override && (PACKAGE_MANAGERS as readonly string[]).includes(override)) {
    return override as PackageManager;
  }

  // 2. User agent set during script execution
  const userAgent = process.env.npm_config_user_agent ?? "";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bun";
  if (userAgent.startsWith("vlt")) return "vlt";
  if (userAgent.startsWith("deno")) return "deno";
  if (userAgent.startsWith("npm")) return "npm";

  // 3. Lockfile detection
  const cwd = process.cwd();
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock")))
    return "bun";
  if (existsSync(join(cwd, "deno.lock"))) return "deno";
  if (existsSync(join(cwd, "vlt-lock.json"))) return "vlt";
  if (existsSync(join(cwd, "package-lock.json"))) return "npm";

  return "npm";
}

/**
 * Per-manager install and remove sub-command configuration.
 *
 * | Manager | install sub-cmd | dev flag      | remove sub-cmd |
 * |---------|-----------------|---------------|----------------|
 * | npm     | install         | --save-dev    | uninstall      |
 * | pnpm    | add             | -D            | remove         |
 * | yarn    | add             | --dev         | remove         |
 * | bun     | add             | -D            | remove         |
 * | vlt     | install         | -D            | uninstall      |
 * | deno    | add             | --dev         | remove         |
 */
const PM_CONFIG: Record<PackageManager, { installCmd: string; devFlag: string; removeCmd: string }> = {
  npm:  { installCmd: "install", devFlag: "--save-dev", removeCmd: "uninstall" },
  pnpm: { installCmd: "add",     devFlag: "-D",         removeCmd: "remove" },
  yarn: { installCmd: "add",     devFlag: "--dev",      removeCmd: "remove" },
  bun:  { installCmd: "add",     devFlag: "-D",         removeCmd: "remove" },
  vlt:  { installCmd: "install", devFlag: "-D",         removeCmd: "uninstall" },
  deno: { installCmd: "add",     devFlag: "--dev",      removeCmd: "remove" },
};

/**
 * Builds the shell command that installs the given packages as dev dependencies
 * using the detected (or supplied) package manager.
 *
 * @param packages  - Array of package names to install.
 * @param pm        - Package manager to use.
 * @param asDev     - Whether to install as devDependencies (default: `true`).
 * @returns         The install command string.
 *
 * @example
 * buildInstallCommand(["@astrojs/vercel"], "pnpm")
 * // → "pnpm add -D @astrojs/vercel"
 *
 * @example
 * buildInstallCommand(["@astrojs/vercel"], "vlt")
 * // → "vlt install -D @astrojs/vercel"
 *
 * @example
 * buildInstallCommand(["@astrojs/vercel"], "deno")
 * // → "deno add --dev @astrojs/vercel"
 */
export function buildInstallCommand(
  packages: string[],
  pm: PackageManager,
  asDev = true
): string {
  const { installCmd, devFlag } = PM_CONFIG[pm];
  return `${pm} ${installCmd} ${asDev ? devFlag + " " : ""}${packages.join(" ")}`;
}

/**
 * Builds the shell command that removes packages using the given package manager.
 *
 * @param packages - Array of package names to remove.
 * @param pm       - Package manager to use.
 * @returns        The removal command string.
 */
export function buildRemoveCommand(
  packages: string[],
  pm: PackageManager
): string {
  const { removeCmd } = PM_CONFIG[pm];
  return `${pm} ${removeCmd} ${packages.join(" ")}`;
}

// ---------------------------------------------------------------------------
// Project introspection
// ---------------------------------------------------------------------------

/**
 * Reads the `package.json` in `cwd` and returns which adapter packages from
 * {@link ADAPTERS} are already present in either `dependencies` or
 * `devDependencies`.
 *
 * @param cwd - Directory to search. Defaults to `process.cwd()`.
 * @returns   Set of adapter `value` strings that are installed.
 */
export async function getInstalledAdapters(
  cwd = process.cwd()
): Promise<Set<AdapterValue>> {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return new Set();

  try {
    const raw = await readFile(pkgPath, "utf8");
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    const installed = new Set<AdapterValue>();
    for (const adapter of ADAPTERS) {
      if (allDeps[adapter.pkg] !== undefined) {
        installed.add(adapter.value);
      }
    }
    return installed;
  } catch {
    return new Set();
  }
}

// ---------------------------------------------------------------------------
// Execution helpers
// ---------------------------------------------------------------------------

/**
 * Runs a shell command synchronously, inheriting stdio (so the package
 * manager output is streamed directly to the terminal).
 *
 * @param cmd    - The command string to execute.
 * @param silent - When `true`, output is captured instead of streamed.
 * @returns `true` on exit code 0, `false` otherwise.
 */
export function runCommand(cmd: string, silent = false): boolean {
  const result = spawnSync(cmd, {
    shell: true,
    stdio: silent ? "pipe" : "inherit",
    cwd: process.cwd(),
    env: process.env,
  });
  return result.status === 0;
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

/**
 * Returns the formatted help string for `--help` output.
 */
function helpText(): string {
  return `
${styles.bold("astro-auto-adapter")} – manage Astro adapter installations

${styles.bold("Usage:")}
  astro-auto-adapter [command] [options]

${styles.bold("Commands:")}
  ${styles.cyan("init")}      Interactive setup wizard – choose platforms & install adapters
  ${styles.cyan("add")}       Add one or more adapter packages interactively
  ${styles.cyan("remove")}    Remove adapter packages interactively
  ${styles.cyan("list")}      Show available adapters and which are installed

${styles.bold("Options:")}
  ${styles.cyan("-h, --help")}       Show this help message and exit
  ${styles.cyan("-v, --version")}    Print the current version and exit

${styles.bold("Examples:")}
  ${styles.dim("# Run the first-time setup wizard")}
  $ astro-auto-adapter init

  ${styles.dim("# Add the Vercel adapter")}
  $ astro-auto-adapter add vercel

  ${styles.dim("# Remove the Netlify adapter")}
  $ astro-auto-adapter remove netlify

  ${styles.dim("# List all adapters")}
  $ astro-auto-adapter list

${styles.bold("Environment variables:")}
  ${styles.cyan("ASTRO_ADAPTER_MODE")}    Adapter to use at build / runtime
  ${styles.cyan("ASTRO_OUTPUT_MODE")}     Output mode: "static" | "server"
  ${styles.cyan("PACKAGE_MANAGER")}       Override detected package manager (npm, pnpm, yarn, bun, vlt, deno)

${styles.bold("Learn more:")}
  ${styles.underline("https://github.com/okikio/astro-auto-adapter")}
`.trimStart();
}

// ---------------------------------------------------------------------------
// Graceful cancellation helper
// ---------------------------------------------------------------------------

/**
 * Checks if the value returned by a clack prompt is a cancellation signal.
 * If so, prints a friendly message and exits with code 1.
 *
 * @param value   - The value returned from a clack prompt.
 * @param message - Optional cancel message to display.
 */
function exitIfCancelled(value: unknown, message = "Operation cancelled."): asserts value is NonNullable<typeof value> {
  if (isCancel(value)) {
    cancel(message);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// `list` command
// ---------------------------------------------------------------------------

/**
 * Lists all available adapters along with their installation status and the
 * associated npm package name.
 *
 * Reads `package.json` from the current working directory to determine which
 * adapters are already installed.
 *
 * @returns A promise that resolves when the list has been printed.
 */
export async function listAdapters(): Promise<void> {
  const installed = await getInstalledAdapters();

  const lines = ADAPTERS.map((a) => {
    const status = installed.has(a.value)
      ? styles.green("✓ installed")
      : styles.dim("  not installed");
    return `  ${styles.bold(a.label.padEnd(14))}  ${a.pkg.padEnd(26)}  ${status}`;
  });

  note(
    `${lines.join("\n")}`,
    "Available Adapters"
  );

  const caveats = ADAPTERS.filter((adapter) => adapter.compatibilityNote)
    .map((adapter) => `${styles.bold(adapter.label)}: ${adapter.compatibilityNote}`);

  if (caveats.length > 0) {
    note(caveats.join("\n"), "Compatibility Notes");
  }
}

// ---------------------------------------------------------------------------
// `init` command
// ---------------------------------------------------------------------------

/**
 * Runs the interactive first-time setup wizard.
 *
 * Steps:
 *  1. Shows a branded intro banner.
 *  2. Prompts for which deployment platforms to support (multiselect).
 *  3. Detects the package manager.
 *  4. Confirms the install command.
 *  5. Installs the selected adapter packages.
 *  6. Prints a summary with next steps.
 *
 * In CI environments (no TTY) the wizard exits early with a helpful message
 * directing users to run the package manager commands manually.
 *
 * @returns A promise that resolves when setup is complete.
 */
export async function runInit(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    process.stdout.write(
      "astro-auto-adapter init requires an interactive terminal.\n" +
      "Run `astro-auto-adapter add <adapter>` or install adapter packages manually instead.\n" +
      `Available adapters: ${ADAPTERS.map((adapter) => adapter.value).join(", ")}\n`
    );
    return;
  }

  intro(styles.banner(" astro-auto-adapter "));

  log.info(
    `Welcome! This wizard will help you pick the deployment platforms\n` +
    `your Astro project should support and install the required adapters.\n` +
    `\n` +
    `${styles.dim("Tip: You can always add or remove adapters later with")} ${styles.cyan("astro-auto-adapter add/remove")}`
  );

  // Check for existing installations
  const installed = await getInstalledAdapters();
  if (installed.size > 0) {
    const installedNames = ADAPTERS.filter((a) => installed.has(a.value))
      .map((a) => styles.cyan(a.label))
      .join(", ");
    log.warn(
      `You already have the following adapters installed: ${installedNames}\n` +
      `They will ${styles.bold("not")} be reinstalled unless you select them again.`
    );
  }

  // Platform multiselect
  const selected = await multiselect<AdapterValue>({
    message: "Which deployment platforms do you want to support?",
    options: ADAPTERS.map((a) => ({
      value: a.value,
      label: a.label,
      hint: a.hint,
      // Pre-select already installed adapters
      ...(installed.has(a.value) ? { hint: `${a.hint} (already installed)` } : {}),
    })),
    initialValues: [...installed],
    required: false,
  });

  exitIfCancelled(selected);

  const toInstall = (selected as AdapterValue[]).filter(
    (v) => !installed.has(v)
  );

  const compatibilityNotes = (selected as AdapterValue[])
    .map((value) => ADAPTERS.find((adapter) => adapter.value === value))
    .filter((adapter) => adapter?.compatibilityNote)
    .map((adapter) => `${styles.bold(adapter!.label)}: ${adapter!.compatibilityNote}`);

  if (compatibilityNotes.length > 0) {
    note(compatibilityNotes.join("\n"), "Compatibility Notes");
  }

  if (toInstall.length === 0) {
    outro(
      styles.green(
        "Nothing new to install – your adapters are already set up! 🎉\n\n" +
        `Remember to configure your ${styles.cyan("astro.config.ts")} to use astro-auto-adapter.`
      )
    );
    return;
  }

  const pm = detectPackageManager();
  const packages = toInstall.map(
    (v) => ADAPTERS.find((a) => a.value === v)!.pkg
  );
  const installCmd = buildInstallCommand(packages, pm);

  // Confirm before installing
  const ok = await confirm({
    message: `Install ${styles.cyan(packages.join(", "))} using ${styles.bold(pm)}?\n  ${styles.dim(installCmd)}`,
    initialValue: true,
  });

  exitIfCancelled(ok);

  if (!ok) {
    note(
      `Run the following command manually when you're ready:\n\n  ${styles.cyan(installCmd)}`,
      "Skipped install"
    );
    outro(styles.yellow("Setup skipped. Run the command above to complete setup."));
    return;
  }

  // Install with a spinner
  const s = spinner();
  s.start(`Installing ${packages.join(", ")}…`);

  const success = runCommand(installCmd, true);

  if (success) {
    s.stop(styles.green(`Installed ${packages.join(", ")} successfully!`));
  } else {
    s.error(styles.red(`Installation failed. Try running manually:\n  ${installCmd}`));
    process.exitCode = 1;
    return;
  }

  // Next steps note
  const adapterModes = (selected as AdapterValue[]).map((v) => v).join(" | ");
  note(
    [
      `Add astro-auto-adapter to your ${styles.cyan("astro.config.ts")}:`,
      ``,
      styles.dim(`  import { adapter, output } from "astro-auto-adapter";`),
      styles.dim(`  `),
      styles.dim(`  export default defineConfig({`),
      styles.dim(`    output: output(),`),
      styles.dim(`    adapter: await adapter(),`),
      styles.dim(`  });`),
      ``,
      `Set the ${styles.cyan("ASTRO_ADAPTER_MODE")} environment variable at build / runtime:`,
      ``,
      styles.dim(`  ASTRO_ADAPTER_MODE=${styles.bold(adapterModes)}`),
      ``,
      `${styles.dim("Or let astro-auto-adapter auto-detect the platform from environment variables.")}`,
    ].join("\n"),
    "Next steps"
  );

  outro(
    styles.green("All done! 🚀 Your adapters are ready to use.")
  );
}

// ---------------------------------------------------------------------------
// `add` command
// ---------------------------------------------------------------------------

/**
 * Interactively adds one or more adapter packages to the project.
 *
 * If `adapterArgs` are provided they are used directly; otherwise a multiselect
 * prompt is shown with all adapters that are not yet installed.
 *
 * @param adapterArgs - Optional list of adapter values passed on the command line.
 * @returns A promise that resolves when the adapters have been installed.
 */
export async function runAdd(adapterArgs: string[]): Promise<void> {
  intro(styles.banner(" astro-auto-adapter add "));

  const installed = await getInstalledAdapters();
  const available = ADAPTERS.filter((a) => !installed.has(a.value));

  if (available.length === 0) {
    outro(styles.green("All available adapters are already installed! 🎉"));
    return;
  }

  let toInstall: AdapterValue[];

  if (adapterArgs.length > 0) {
    // Validate supplied adapter names
    const invalid = adapterArgs.filter(
      (a) => !ADAPTERS.some((x) => x.value === a)
    );
    if (invalid.length > 0) {
      log.error(
        `Unknown adapter(s): ${styles.red(invalid.join(", "))}\n` +
        `Valid adapters: ${ADAPTERS.map((a) => styles.cyan(a.value)).join(", ")}`
      );
      process.exit(2);
    }
    toInstall = adapterArgs as AdapterValue[];
  } else {
    // Interactive prompt
    const selected = await multiselect<AdapterValue>({
      message: "Which adapters would you like to add?",
      options: available.map((a) => ({
        value: a.value,
        label: a.label,
        hint: a.hint,
      })),
      required: true,
    });
    exitIfCancelled(selected);
    toInstall = selected as AdapterValue[];
  }

  const pm = detectPackageManager();
  const packages = toInstall.map(
    (v) => ADAPTERS.find((a) => a.value === v)!.pkg
  );
  const installCmd = buildInstallCommand(packages, pm);

  const compatibilityNotes = toInstall
    .map((value) => ADAPTERS.find((adapter) => adapter.value === value))
    .filter((adapter) => adapter?.compatibilityNote)
    .map((adapter) => `${styles.bold(adapter!.label)}: ${adapter!.compatibilityNote}`);

  if (compatibilityNotes.length > 0) {
    note(compatibilityNotes.join("\n"), "Compatibility Notes");
  }

  const s = spinner();
  s.start(`Adding ${packages.join(", ")}…`);

  const success = runCommand(installCmd, true);

  if (success) {
    s.stop(styles.green(`Added ${packages.join(", ")} successfully!`));
    outro(styles.green("Done! 🎉"));
  } else {
    s.error(styles.red(`Installation failed. Try running manually:\n  ${installCmd}`));
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// `remove` command
// ---------------------------------------------------------------------------

/**
 * Interactively removes one or more adapter packages from the project.
 *
 * If `adapterArgs` are provided they are used directly; otherwise a multiselect
 * prompt is shown with all currently installed adapters.
 *
 * @param adapterArgs - Optional list of adapter values passed on the command line.
 * @returns A promise that resolves when the adapters have been removed.
 */
export async function runRemove(adapterArgs: string[]): Promise<void> {
  intro(styles.banner(" astro-auto-adapter remove "));

  const installed = await getInstalledAdapters();

  if (installed.size === 0) {
    outro(styles.yellow("No astro-auto-adapter managed adapters are installed."));
    return;
  }

  let toRemove: AdapterValue[];

  if (adapterArgs.length > 0) {
    const invalid = adapterArgs.filter(
      (a) => !ADAPTERS.some((x) => x.value === a)
    );
    if (invalid.length > 0) {
      log.error(
        `Unknown adapter(s): ${styles.red(invalid.join(", "))}\n` +
        `Valid adapters: ${ADAPTERS.map((a) => styles.cyan(a.value)).join(", ")}`
      );
      process.exit(2);
    }
    toRemove = adapterArgs as AdapterValue[];
  } else {
    const installedList = ADAPTERS.filter((a) => installed.has(a.value));
    const selected = await multiselect<AdapterValue>({
      message: "Which adapters would you like to remove?",
      options: installedList.map((a) => ({
        value: a.value,
        label: a.label,
        hint: a.pkg,
      })),
      required: true,
    });
    exitIfCancelled(selected);
    toRemove = selected as AdapterValue[];
  }

  const pm = detectPackageManager();
  const packages = toRemove.map(
    (v) => ADAPTERS.find((a) => a.value === v)!.pkg
  );
  const removeCmd = buildRemoveCommand(packages, pm);

  // Confirm destructive action
  const ok = await confirm({
    message: `Remove ${styles.red(packages.join(", "))}?\n  ${styles.dim(removeCmd)}`,
    initialValue: false,
  });

  exitIfCancelled(ok);

  if (!ok) {
    outro(styles.yellow("Nothing was removed."));
    return;
  }

  const s = spinner();
  s.start(`Removing ${packages.join(", ")}…`);

  const success = runCommand(removeCmd, true);

  if (success) {
    s.stop(styles.green(`Removed ${packages.join(", ")} successfully.`));
    outro(styles.green("Done."));
  } else {
    s.error(styles.red(`Removal failed. Try running manually:\n  ${removeCmd}`));
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Main CLI entry-point.
 *
 * Parses `process.argv`, dispatches to the appropriate command, and handles
 * top-level error reporting.
 *
 * @param argv - Argument vector (defaults to `process.argv.slice(2)`).
 */
export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  // -- flags -----------------------------------------------------------------
  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`astro-auto-adapter v${await getCliVersion()}\n`);
    return;
  }

  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(helpText());
    return;
  }

  // -- commands --------------------------------------------------------------
  const [command, ...rest] = argv;

  // Default to `init` when invoked with no arguments
  switch (command ?? "init") {
    case "init":
      await runInit();
      break;

    case "add":
      await runAdd(rest);
      break;

    case "remove":
    case "rm":
      await runRemove(rest);
      break;

    case "list":
    case "ls":
      await listAdapters();
      break;

    default:
      process.stderr.write(
        `${styles.red("error")} Unknown command: ${styles.bold(command)}\n\n` +
        `Run ${styles.cyan("astro-auto-adapter --help")} for usage information.\n`
      );
      process.exit(2);
  }
}

// Invoke when this file is the entry-point (not imported as a module).
// `import.meta.url` check provides ESM-compatible guard.
// We normalise both paths to forward slashes so this works on Windows too.
function normaliseSlashes(p: string): string {
  return p.replace(/\\/g, "/");
}

const isMain =
  process.argv[1] != null &&
  normaliseSlashes(process.argv[1]) ===
    normaliseSlashes(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`${styles.red("error")} ${message}\n`);
    process.exit(1);
  });
}
