import type { VercelServerlessConfig as VercelAdapterOptions } from "@astrojs/vercel";
import type createNetlifyIntegration from "@astrojs/netlify";
import type createCloudflareWorkersIntegration from "@astrojs/cloudflare";
import type createDenoIntegration from "@deno/astro-adapter";
import type createNodeIntegration from "@astrojs/node";
import type createSSTIntegration from "astro-sst";
import type { AstroIntegration, AstroConfig } from "astro";

export type CloudflareAdapterOptions = Parameters<typeof createCloudflareWorkersIntegration>[0];
export type NetlifyAdapterOptions = Parameters<typeof createNetlifyIntegration>[0];
export type NodeAdapterOptions = Parameters<typeof createNodeIntegration>[0];
export type DenoAdapterOptions = Parameters<typeof createDenoIntegration>[0];
export type SSTAdapterOptions = Parameters<typeof createSSTIntegration>[0];
export type { VercelAdapterOptions };

/**
 * Comprehensive interface defining all supported adapter options.
 * 
 * Each property corresponds to a specific deployment platform adapter.
 * Only specify options for adapters you actually plan to use.
 * 
 * @example
 * ```ts
 * const options: IAdapterOptions = {
 *   vercel: { webAnalytics: { enabled: true } },
 *   netlify: { builders: true }
 * };
 * ```
 */
export interface IAdapterOptions {
  /** Cloudflare Workers/Pages adapter options */
  cloudflare?: CloudflareAdapterOptions;
  /** Deno Deploy adapter options */
  deno?: DenoAdapterOptions;
  /** Netlify Functions/Edge adapter options */
  netlify?: NetlifyAdapterOptions;
  /** SST (Serverless Stack) AWS adapter options */
  "sst"?: SSTAdapterOptions;
  /**
   * @deprecated Netlify Static functions have been deprecated as a separate adapter.
   * Use `netlify` with output mode "static" instead.
   */
  "netlify-static"?: never;
  /**
   * @deprecated Netlify Edge functions have been deprecated as a separate adapter.
   * Use `netlify` with appropriate edge configuration instead.
   */
  "netlify-edge"?: never;
  /** Vercel Serverless/Edge adapter options */
  vercel?: VercelAdapterOptions;
  /**
   * @deprecated Vercel Static functions have been deprecated as a separate adapter.
   * Use `vercel` with output mode "static" instead.
   */
  "vercel-static"?: VercelAdapterOptions;
  /**
   * @deprecated Vercel Edge functions have been deprecated as a separate adapter.
   * See: https://github.com/withastro/astro/blob/main/packages/integrations/vercel/CHANGELOG.md#400
   */
  "vercel-edge"?: never;
  /** Node.js adapter options */
  node?: NodeAdapterOptions;
  /** Extensibility for custom adapters */
  [type: string]: any
}

/**
 * Environment variable name for manually specifying the adapter type.
 * 
 * When set, this overrides automatic environment detection.
 * 
 * @example
 * ```bash
 * export ASTRO_ADAPTER_MODE="vercel"
 * ```
 */
export const AUTO_ASTRO_ADAPTER_ENV_VAR = "ASTRO_ADAPTER_MODE";

/**
 * Environment variable name for manually specifying the output mode.
 * 
 * When set, this overrides the default output mode selection.
 * 
 * @example
 * ```bash
 * export ASTRO_OUTPUT_MODE="server"
 * ```
 */
export const AUTO_ASTRO_OUTPUT_MODE_ENV_VAR = "ASTRO_OUTPUT_MODE";

/**
 * Extended globalThis interface to handle runtime-specific environment access.
 * 
 * Different runtimes expose environment variables through different APIs:
 * - Deno: globalThis.Deno.env
 * - Netlify: globalThis.Netlify.env  
 * - Node.js: process.env
 */
interface CustomGlobalThis {
  Deno?: { env?: Map<string, string> };
  Netlify?: { env?: Map<string, string> };
}

/**
 * Combined type that includes both standard globalThis and custom runtime properties
 */
type ExtendedGlobalThis = typeof globalThis & CustomGlobalThis;

/**
 * Cross-runtime environment variable getter.
 * 
 * Handles the different ways various JavaScript runtimes expose environment variables:
 * - Deno uses a Map-based API (globalThis.Deno.env)
 * - Netlify has custom environment access (globalThis.Netlify.env)
 * - Node.js uses the standard process.env object
 * 
 * @param name - The environment variable name to retrieve
 * @returns The environment variable value, or undefined if not found
 * 
 * @example
 * ```ts
 * const deploymentUrl = getEnv("VERCEL_URL");
 * const isProduction = getEnv("NODE_ENV") === "production";
 * ```
 */
export function getEnv<T extends string>(name: T): string | undefined {
  const extendedGlobalThis: ExtendedGlobalThis = globalThis;
  if ("Deno" in extendedGlobalThis) {
    return extendedGlobalThis?.Deno?.env?.get?.(name);
  }

  if ("Netlify" in extendedGlobalThis) {
    return extendedGlobalThis?.Netlify?.env?.get?.(name);
  }

  const env = (extendedGlobalThis as typeof globalThis)?.process?.env ?? {};
  return env?.[name];
}

/**
 * Automatically detects the deployment platform using built-in environment variables.
 * 
 * Each major hosting platform sets specific environment variables that can be used
 * for reliable platform detection. This function checks these platform-specific
 * indicators in order of specificity.
 * 
 * Detection Logic:
 * 1. Vercel: Checks for VERCEL="1" 
 * 2. Netlify: Checks for NETLIFY="true"
 * 3. Cloudflare Workers: Checks navigator.userAgent
 * 4. Deno Deploy: Checks for Deno global object
 * 5. Default: Falls back to Node.js
 * 
 * @returns The detected adapter type, or "node" as fallback
 * 
 * @example
 * ```ts
 * const platform = getAutoAdapterType();
 * console.log(`Detected platform: ${platform}`);
 * // Output: "vercel" when deployed on Vercel
 * ```
 * 
 * @see {@link https://vercel.com/docs/projects/environment-variables/system-environment-variables Vercel Environment Variables}
 * @see {@link https://docs.netlify.com/configure-builds/environment-variables/#build-metadata Netlify Environment Variables}
 * @see {@link https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent Cloudflare Workers Detection}
 */
export function getAutoAdapterType(): keyof IAdapterOptions {
  /**
   * Vercel Detection:
   * Vercel automatically sets VERCEL=1 in all deployment environments
   * This is the most reliable way to detect Vercel deployments
   */
  if (getEnv("VERCEL") === "1")
    return "vercel";

  /**
   * Netlify Detection:
   * Netlify sets NETLIFY=true during builds and in the runtime environment
   * This covers both Netlify Functions and Edge Functions
   */
  if (getEnv("NETLIFY") === "true")
    return "netlify";

  /**
   * Cloudflare Workers Detection:
   * Cloudflare Workers set a specific user agent string that can be detected
   * This is reliable for both Workers and Pages Functions
   */
  if (globalThis?.navigator?.userAgent === 'Cloudflare-Workers')
    return "cloudflare";

  /**
   * Deno Detection:
   * Deno exposes a global Deno object that's not available in other runtimes
   * This covers Deno Deploy and other Deno-based hosting platforms
   */
  if ("Deno" in globalThis)
    return "deno";

  /**
   * Default Fallback:
   * When no specific platform is detected, assume Node.js environment
   * This covers most VPS deployments, Docker containers, and local development
   */
  return "node";
}


/**
 * Safely imports an adapter package with helpful error messages.
 * 
 * When using peer dependencies, packages might not be installed. This function
 * transforms cryptic module resolution errors into actionable user guidance.
 * 
 * @param packageName - The package name to import (e.g., "@astrojs/vercel")
 * @returns Promise resolving to the imported module
 * @throws Error with installation instructions if package is missing
 * 
 * @example
 * ```ts
 * try {
 *   const vercel = await safeImport("@astrojs/vercel");
 * } catch (error) {
 *   // Error: Package "@astrojs/vercel" is not installed. Please install it with:
 *   // pnpm add @astrojs/vercel
 * }
 * ```
 */
export async function safeImport(packageName: string) {
  try {
    return await import(packageName);
  } catch (error) {
    throw new Error(
      `Package "${packageName}" is not installed. Please install it with:\n` +
      `pnpm add ${packageName}`,
      { cause: error }
    );
  }
}

/**
 * Automatically selects and configures the appropriate Astro adapter for the target environment.
 * 
 * This function serves as the main entry point for the astro-auto-adapter package.
 * It can either auto-detect the deployment platform or use an explicitly specified adapter type.
 * 
 * **Auto-Detection Behavior:**
 * - Checks platform-specific environment variables
 * - Falls back to Node.js if no platform is detected
 * - Can be overridden with ASTRO_ADAPTER_MODE environment variable
 * 
 * **Adapter Configuration:**
 * - Each adapter has sensible defaults but can be customized via options
 * - Deprecated adapters (static/edge variants) are handled with compatibility warnings
 * - Missing packages result in helpful installation instructions
 * 
 * @param type - The adapter type to use. If not provided, auto-detects based on environment
 * @param opts - Configuration options for each adapter type
 * @returns Promise resolving to a configured Astro integration
 * 
 * @throws Error if the specified adapter package is not installed
 * 
 * @example
 * ```ts
 * // Auto-detect environment
 * const autoAdapter = await adapter();
 * 
 * // Explicitly specify Vercel with options
 * const vercelAdapter = await adapter("vercel", {
 *   vercel: { 
 *     webAnalytics: { enabled: true },
 *     speedInsights: { enabled: true }
 *   }
 * });
 * 
 * // Use environment variable override
 * process.env.ASTRO_ADAPTER_MODE = "netlify";
 * const netlifyAdapter = await adapter(); // Uses Netlify despite auto-detection
 * ```
 * 
 * @see {@link getAutoAdapterType} for auto-detection logic
 * @see {@link IAdapterOptions} for configuration options
 */
export async function adapter(
  type: keyof IAdapterOptions | ("string" & {}) = getEnv(AUTO_ASTRO_ADAPTER_ENV_VAR) as keyof IAdapterOptions ?? getAutoAdapterType(),
  opts: IAdapterOptions = {}
): Promise<AstroIntegration> {
  switch (type) {
    case "cloudflare": {
      const cloudflare = (await safeImport("@astrojs/cloudflare")).default;
      return cloudflare(opts[type]);
    }
    case "deno": {
      const deno = (await safeImport("@deno/astro-adapter")).default;
      const denoOpts = (opts[type] ?? {}) as DenoAdapterOptions;
      return deno({
        port: 4321,
        ...denoOpts
      });
    }

    /**
     * Netlify Adapter Handling:
     * Supports both current netlify adapter and legacy static/edge variants
     * Legacy variants are deprecated but maintained for backward compatibility
     */
    case "netlify":
    case "netlify-edge": 
    case "netlify-static": {
      const netlify = (await safeImport("@astrojs/netlify")).default;
      return netlify(opts[type]);
    }
    case "sst": {
      const sst = (await safeImport("astro-sst")).default;
      return sst(opts[type])
    }

    /**
     * Vercel Adapter Handling:
     * Supports both current vercel adapter and legacy static/edge variants
     * Legacy variants are deprecated but maintained for backward compatibility
     */
    case "vercel":
    case "vercel-edge": 
    case "vercel-static": {
      const vercel = (await safeImport("@astrojs/vercel")).default;
      const vercelOpts = opts[type] ?? {};
      return vercel(vercelOpts);
    }

    /**
     * Node.js Adapter (Default):
     * Handles both explicit "node" selection and unknown adapter types
     * Defaults to standalone mode for easier deployment
     */
    case "node":
    default: {
      const node = (await safeImport("@astrojs/node")).default;
      const nodeOpts = (opts[type] ?? {});

      // Default to standalone mode for simpler deployment
      // Users can override by providing mode: "middleware" in options
      return node({
        mode: "standalone",
        ...nodeOpts
      });
    }
  }
}


/**
 * Automatically selects the appropriate Astro output mode for the target environment.
 * 
 * Output modes determine how Astro renders pages:
 * - "static": Pre-renders all pages at build time (fastest, most compatible)
 * - "server": Renders pages on-demand at request time (enables SSR features)
 * 
 * **Important Notes:**
 * - As of Astro v5, "hybrid" mode is deprecated
 * - Both "server" and "static" modes support selective rendering via `export const prerender = true|false;`
 * - This function primarily handles legacy adapter configurations
 * 
 * @param type - The adapter type being used (affects default mode selection)
 * @param mode - Explicit output mode, or falls back to ASTRO_OUTPUT_MODE env var, then "static"
 * @returns The selected Astro output mode
 * 
 * @example
 * ```ts
 * // Auto-detect based on adapter
 * const mode = output("vercel"); // Returns "static" by default
 * 
 * // Explicit server mode for SSR
 * const serverMode = output("netlify", "server");
 * 
 * // Environment variable override
 * process.env.ASTRO_OUTPUT_MODE = "server";
 * const envMode = output("vercel"); // Returns "server"
 * ```
 * 
 * @deprecated This function is primarily for legacy compatibility.
 * Modern Astro projects should set output mode directly in astro.config.mjs
 */
export function output(
  type: keyof IAdapterOptions | ("string" & {}) = getEnv(AUTO_ASTRO_ADAPTER_ENV_VAR) as keyof IAdapterOptions ?? getAutoAdapterType(),
  
  // I added the `{}` this is to ensure for older versions of Astro you won't see a type-error when entering hybrid
  mode = (getEnv(AUTO_ASTRO_OUTPUT_MODE_ENV_VAR) || "static") as (AstroConfig['output'] & {}) 
) {
  switch (type) {
    /**
     * Legacy Static Adapters:
     * These deprecated adapters always used static output mode
     * Force static mode regardless of user input for compatibility
     */
    case "vercel-static":
    case "netlify-static": {
      return "static";
    }

    /**
     * Modern Adapters:
     * All current adapters support both static and server modes
     * Return the user-specified mode or environment variable override
     */
    case "node":
    case "cloudflare":
    case "deno":
    case "netlify":
    case "sst":
    case "vercel":
    case "netlify-edge":
    case "vercel-edge":
    default: {
      return mode;
    }
  }
}

/**
 * Default export provides the adapter function for convenience
 * 
 * @example
 * ```ts
 * import adapter from "astro-auto-adapter";
 * 
 * export default defineConfig({
 *   adapter: await adapter()
 * });
 * ```
 */
export default adapter;
