// tests/cli.test.ts
// Unit tests for the astro-auto-adapter CLI helper functions.
// These tests exercise pure-logic functions that do not require a TTY or
// interactive prompts, so they run safely in CI environments.

import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import process from "node:process";

import {
  ADAPTERS,
  detectPackageManager,
  buildInstallCommand,
  buildRemoveCommand,
  getInstalledAdapters,
  runCommand,
} from "../src/cli.ts";

// ============================================================
// Shared test helpers
// ============================================================

/**
 * Creates a unique temporary directory path for test isolation.
 * Each call generates a directory with a unique name based on
 * the current timestamp and a random suffix.
 */
async function makeTmpDir(): Promise<string> {
  const dir = join(
    tmpdir(),
    `aaa-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  await mkdir(dir, { recursive: true });
  return dir;
}

// ============================================================
// ADAPTERS constant
// ============================================================

describe("ADAPTERS constant", () => {
  test("contains all six built-in adapters", () => {
    const values = ADAPTERS.map((a) => a.value);
    expect(values).toContain("node");
    expect(values).toContain("vercel");
    expect(values).toContain("netlify");
    expect(values).toContain("cloudflare");
    expect(values).toContain("deno");
    expect(values).toContain("sst");
  });

  test("every adapter has required fields", () => {
    for (const adapter of ADAPTERS) {
      expect(adapter.label).toBeTruthy();
      expect(adapter.value).toBeTruthy();
      expect(adapter.pkg).toBeTruthy();
      expect(adapter.hint).toBeTruthy();
      expect(Array.isArray(adapter.envVars)).toBe(true);
    }
  });

  test("adapter packages match known npm packages", () => {
    const pkgMap: Record<string, string> = {
      node: "@astrojs/node",
      vercel: "@astrojs/vercel",
      netlify: "@astrojs/netlify",
      cloudflare: "@astrojs/cloudflare",
      deno: "@deno/astro-adapter",
      sst: "astro-sst",
    };
    for (const adapter of ADAPTERS) {
      expect(adapter.pkg).toBe(pkgMap[adapter.value]);
    }
  });
});

// ============================================================
// detectPackageManager
// ============================================================

describe("detectPackageManager", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore env
    process.env = originalEnv;
  });

  test("respects PACKAGE_MANAGER env override", () => {
    process.env.PACKAGE_MANAGER = "yarn";
    delete process.env.npm_config_user_agent;
    expect(detectPackageManager()).toBe("yarn");
  });

  test("detects pnpm from user agent", () => {
    delete process.env.PACKAGE_MANAGER;
    process.env.npm_config_user_agent = "pnpm/8.0.0 npm/? node/v20.0.0 linux x64";
    expect(detectPackageManager()).toBe("pnpm");
  });

  test("detects yarn from user agent", () => {
    delete process.env.PACKAGE_MANAGER;
    process.env.npm_config_user_agent = "yarn/1.22.0 npm/? node/v20.0.0";
    expect(detectPackageManager()).toBe("yarn");
  });

  test("detects npm from user agent", () => {
    delete process.env.PACKAGE_MANAGER;
    process.env.npm_config_user_agent = "npm/10.0.0 node/v20.0.0 linux x64";
    expect(detectPackageManager()).toBe("npm");
  });

  test("detects bun from user agent", () => {
    delete process.env.PACKAGE_MANAGER;
    process.env.npm_config_user_agent = "bun/1.0.0 npm/? node/v20.0.0";
    expect(detectPackageManager()).toBe("bun");
  });

  test("ignores invalid PACKAGE_MANAGER values", () => {
    process.env.PACKAGE_MANAGER = "pip";
    delete process.env.npm_config_user_agent;
    // Should not return "pip"; falls through to lockfile or default
    const result = detectPackageManager();
    expect(["npm", "pnpm", "yarn", "bun"]).toContain(result);
  });
});

// ============================================================
// buildInstallCommand
// ============================================================

describe("buildInstallCommand", () => {
  test("builds correct pnpm install command", () => {
    expect(buildInstallCommand(["@astrojs/vercel"], "pnpm")).toBe(
      "pnpm add -D @astrojs/vercel"
    );
  });

  test("builds correct npm install command", () => {
    expect(buildInstallCommand(["@astrojs/vercel"], "npm")).toBe(
      "npm install --save-dev @astrojs/vercel"
    );
  });

  test("builds correct yarn install command", () => {
    expect(buildInstallCommand(["@astrojs/vercel"], "yarn")).toBe(
      "yarn add --dev @astrojs/vercel"
    );
  });

  test("builds correct bun install command", () => {
    expect(buildInstallCommand(["@astrojs/vercel"], "bun")).toBe(
      "bun add -D @astrojs/vercel"
    );
  });

  test("installs multiple packages in one command", () => {
    expect(
      buildInstallCommand(["@astrojs/vercel", "@astrojs/netlify"], "pnpm")
    ).toBe("pnpm add -D @astrojs/vercel @astrojs/netlify");
  });

  test("respects asDev=false for production dependencies", () => {
    expect(buildInstallCommand(["@astrojs/node"], "npm", false)).toBe(
      "npm install @astrojs/node"
    );
  });
});

// ============================================================
// buildRemoveCommand
// ============================================================

describe("buildRemoveCommand", () => {
  test("builds correct pnpm remove command", () => {
    expect(buildRemoveCommand(["@astrojs/vercel"], "pnpm")).toBe(
      "pnpm remove @astrojs/vercel"
    );
  });

  test("builds correct npm uninstall command", () => {
    expect(buildRemoveCommand(["@astrojs/vercel"], "npm")).toBe(
      "npm uninstall @astrojs/vercel"
    );
  });

  test("builds correct yarn remove command", () => {
    expect(buildRemoveCommand(["@astrojs/vercel"], "yarn")).toBe(
      "yarn remove @astrojs/vercel"
    );
  });

  test("builds correct bun remove command", () => {
    expect(buildRemoveCommand(["@astrojs/vercel"], "bun")).toBe(
      "bun remove @astrojs/vercel"
    );
  });

  test("removes multiple packages in one command", () => {
    expect(
      buildRemoveCommand(["@astrojs/vercel", "@astrojs/netlify"], "pnpm")
    ).toBe("pnpm remove @astrojs/vercel @astrojs/netlify");
  });
});

// ============================================================
// getInstalledAdapters
// ============================================================

describe("getInstalledAdapters", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await makeTmpDir();
  });

  test("returns empty set when no package.json exists", async () => {
    const result = await getInstalledAdapters(tmpDir);
    expect(result.size).toBe(0);
  });

  test("detects adapters in dependencies", async () => {
    await writeFile(
      join(tmpDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "@astrojs/vercel": "^8.0.0",
          "@astrojs/node": "^9.0.0",
        },
      })
    );
    const result = await getInstalledAdapters(tmpDir);
    expect(result.has("vercel")).toBe(true);
    expect(result.has("node")).toBe(true);
    expect(result.has("netlify")).toBe(false);
  });

  test("detects adapters in devDependencies", async () => {
    await writeFile(
      join(tmpDir, "package.json"),
      JSON.stringify({
        devDependencies: {
          "@astrojs/netlify": "^6.0.0",
          "astro-sst": "^3.0.0",
        },
      })
    );
    const result = await getInstalledAdapters(tmpDir);
    expect(result.has("netlify")).toBe(true);
    expect(result.has("sst")).toBe(true);
    expect(result.has("cloudflare")).toBe(false);
  });

  test("merges dependencies and devDependencies", async () => {
    await writeFile(
      join(tmpDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "@astrojs/vercel": "^8.0.0",
        },
        devDependencies: {
          "@astrojs/node": "^9.0.0",
        },
      })
    );
    const result = await getInstalledAdapters(tmpDir);
    expect(result.has("vercel")).toBe(true);
    expect(result.has("node")).toBe(true);
  });

  test("returns empty set for malformed package.json", async () => {
    await writeFile(join(tmpDir, "package.json"), "{ invalid json }");
    const result = await getInstalledAdapters(tmpDir);
    expect(result.size).toBe(0);
  });

  test("detects all six adapters when all installed", async () => {
    await writeFile(
      join(tmpDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "@astrojs/node": "^9.0.0",
          "@astrojs/vercel": "^8.0.0",
          "@astrojs/netlify": "^6.0.0",
          "@astrojs/cloudflare": "^12.0.0",
          "@deno/astro-adapter": "^0.3.0",
          "astro-sst": "^3.0.0",
        },
      })
    );
    const result = await getInstalledAdapters(tmpDir);
    expect(result.size).toBe(6);
  });
});

// ============================================================
// runCommand
// ============================================================

describe("runCommand", () => {
  test("returns true for a successful command", () => {
    expect(runCommand("node --version", true)).toBe(true);
  });

  test("returns false for a failing command", () => {
    expect(runCommand("node -e 'process.exit(1)'", true)).toBe(false);
  });

  test("returns false for a nonexistent command", () => {
    expect(runCommand("this-command-does-not-exist-xyz", true)).toBe(false);
  });
});
