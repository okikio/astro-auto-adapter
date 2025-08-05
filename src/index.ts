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
 * Type definition for custom adapter factory functions.
 * 
 * Custom adapters can be either synchronous or asynchronous functions
 * that return an Astro integration. This allows for maximum flexibility
 * in adapter implementation.
 * 
 * @template TOptions - The type of options this adapter accepts
 * @param options - Configuration options specific to the custom adapter
 * @returns Either an AstroIntegration directly or a Promise resolving to one
 * 
 * @example
 * ```ts
 * interface RailwayOptions {
 *   region: string;
 *   healthCheckPath?: string;
 * }
 * 
 * const railwayAdapter: AdapterFactory<RailwayOptions> = async (options) => {
 *   // options is fully typed as RailwayOptions!
 *   const { default: railway } = await import("@railway/astro-adapter");
 *   return railway({
 *     region: options.region, // ✅ Type-checked
 *     healthCheckPath: options.healthCheckPath || "/health"
 *   });
 * };
 * ```
 */
export type AdapterFactory<TOptions = any> = (options?: TOptions) => Promise<AstroIntegration> | AstroIntegration;

/**
 * Registry mapping custom adapter names to their factory functions.
 * 
 * This allows users to register custom adapters that can be used
 * alongside the built-in adapters. The registry supports full type safety
 * when using TypeScript with proper option types.
 * 
 * @example
 * ```ts
 * interface RailwayOptions {
 *   region: string;
 *   environmentId?: string;
 * }
 * 
 * interface CustomOptions {
 *   apiKey: string;
 *   endpoint: string;
 * }
 * 
 * const registry: AdapterRegistry = {
 *   railway: createTypedAdapter<RailwayOptions>(async (opts) => {
 *     const { default: railway } = await import("@railway/astro-adapter");
 *     return railway(opts); // opts is RailwayOptions
 *   }),
 *   custom: createTypedAdapter<CustomOptions>((opts) => ({
 *     name: "custom-adapter",
 *     hooks: {
 *       "astro:config:setup": ({ updateConfig }) => {
 *         updateConfig({ 
 *           output: "server",
 *           vite: {
 *             define: {
 *               'process.env.API_KEY': JSON.stringify(opts.apiKey)
 *             }
 *           }
 *         });
 *       }
 *     }
 *   }))
 * };
 * ```
 */
export type AdapterRegistry = {
  [adapterName: string]: AdapterFactory<any>;
};

/**
 * Creates a type-safe adapter factory function.
 * 
 * This utility function provides full TypeScript support for custom adapters
 * while maintaining compatibility with the adapter registry system.
 * 
 * @template TOptions - The type of options this adapter accepts
 * @param factory - The adapter factory function with typed options
 * @returns A typed adapter factory that can be used in the registry
 * 
 * @example
 * ```ts
 * interface RailwayOptions {
 *   region: 'us-west' | 'us-east' | 'eu-west';
 *   healthCheckPath?: string;
 *   environmentId?: string;
 * }
 * 
 * const railwayAdapter = createTypedAdapter<RailwayOptions>(async (options) => {
 *   // Full type safety here!
 *   const region = options.region; // Type: 'us-west' | 'us-east' | 'eu-west'
 *   const healthPath = options.healthCheckPath ?? '/health';
 *   
 *   const { default: railway } = await import("@railway/astro-adapter");
 *   return railway({
 *     region,
 *     healthCheckPath: healthPath,
 *     environmentId: options.environmentId
 *   });
 * });
 * 
 * // Usage with full type checking:
 * const astroAdapter = await adapter("railway", {
 *   railway: {
 *     region: "us-west", // ✅ Autocomplete + validation
 *     healthCheckPath: "/api/health" // ✅ Optional property
 *   },
 *   register: {
 *     railway: railwayAdapter
 *   }
 * });
 * ```
 */
export function createTypedAdapter<TOptions = any>(
  factory: AdapterFactory<TOptions>
): AdapterFactory<TOptions> {
  return factory;
}

/**
 * Comprehensive interface defining all supported adapter options.
 * 
 * Each property corresponds to a specific deployment platform adapter.
 * Only specify options for adapters you actually plan to use.
 * 
 * @template TCustomAdapters - Custom adapter types for type safety
 * 
 * @example
 * ```ts
 * // Basic usage
 * const options: IAdapterOptions = {
 *   vercel: { webAnalytics: { enabled: true } },
 *   netlify: { builders: true }
 * };
 * 
 * // With custom adapters (type-safe)
 * interface CustomAdapters {
 *   railway: RailwayOptions;
 *   custom: CustomOptions;
 * }
 * 
 * const typedOptions: IAdapterOptions<CustomAdapters> = {
 *   vercel: { webAnalytics: { enabled: true } },
 *   railway: { region: "us-west" }, // ✅ Fully typed!
 *   register: {
 *     railway: createTypedAdapter<RailwayOptions>(...),
 *     custom: createTypedAdapter<CustomOptions>(...)
 *   }
 * };
 * ```
 */
export type IAdapterOptions<TCustomAdapters extends Record<string, any> = {}> = {
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

  /**
   * Registry of custom adapter factory functions.
   * 
   * Allows registration of custom adapters that can be used alongside built-in ones.
   * Each key becomes a usable adapter type, and the value is a factory function
   * that creates the adapter integration.
   * 
   * @example
   * ```ts
   * register: {
   *   "railway": createTypedAdapter<RailwayOptions>(async (opts) => {
   *     const railway = await import("@railway/astro-adapter");
   *     return railway.default(opts);
   *   }),
   *   "custom": createTypedAdapter<CustomOptions>((opts) => createCustomAdapter(opts))
   * }
   * ```
   */
  register?: AdapterRegistry;

  /** Extensibility for custom adapters via direct property access */
  [type: string]: any;
} & TCustomAdapters; // Merge custom adapter types for full type safety

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
    return await import(/* @vite-ignore */ packageName);
  } catch (error) {
    throw new Error(
      `Package "${packageName}" is not installed. Please install it with:\n` +
      `pnpm add ${packageName}`,
      { cause: error }
    );
  }
}

/**
 * Function overload for basic adapter usage without custom types.
 * Provides backward compatibility and simple usage for built-in adapters.
 */
export function adapter(
  type?: keyof IAdapterOptions | ("string" & {}),
  opts?: IAdapterOptions
): Promise<AstroIntegration>;

/**
 * Function overload for type-safe custom adapter usage.
 * Provides full TypeScript support when using custom adapter types.
 * 
 * @template TCustomAdapters - Custom adapter types interface
 */
export function adapter<TCustomAdapters extends Record<string, any>>(
  type: keyof (IAdapterOptions<TCustomAdapters>) | ("string" & {}),
  opts: IAdapterOptions<TCustomAdapters>
): Promise<AstroIntegration>;

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
 * **Adapter Resolution Priority:**
 * 1. Custom registered adapters (via opts.register)
 * 2. Built-in adapters (vercel, netlify, etc.)
 * 3. Node.js fallback for unknown types
 * 
 * **Type Safety for Custom Adapters:**
 * - Use `createTypedAdapter<TOptions>()` for full type checking
 * - Define custom adapter interfaces for IntelliSense support
 * - Automatic type validation and autocomplete
 * 
 * **Adapter Configuration:**
 * - Each adapter has sensible defaults but can be customized via options
 * - Deprecated adapters (static/edge variants) are handled with compatibility warnings
 * - Missing packages result in helpful installation instructions
 * 
 * @param type - The adapter type to use. If not provided, auto-detects based on environment
 * @param opts - Configuration options for each adapter type, including custom registrations
 * @returns Promise resolving to a configured Astro integration
 * 
 * @throws Error if the specified adapter package is not installed
 * 
 * @example
 * ```ts
 * // Auto-detect environment (basic usage)
 * const autoAdapter = await adapter();
 * 
 * // Built-in adapter with options
 * const vercelAdapter = await adapter("vercel", {
 *   vercel: { webAnalytics: { enabled: true } }
 * });
 * 
 * // Type-safe custom adapter usage
 * interface RailwayOptions {
 *   region: 'us-west' | 'us-east' | 'eu-west';
 *   healthCheckPath?: string;
 * }
 * 
 * interface CustomAdapters {
 *   railway: RailwayOptions;
 * }
 * 
 * const customAdapter = await adapter<CustomAdapters>("railway", {
 *   railway: {
 *     region: "us-west", // ✅ Autocomplete + type checking!
 *     healthCheckPath: "/health"
 *   },
 *   register: {
 *     railway: createTypedAdapter<RailwayOptions>(async (opts) => {
 *       const { default: railway } = await import("@railway/astro-adapter");
 *       return railway(opts);
 *     })
 *   }
 * });
 * 
 * // Environment variable override
 * process.env.ASTRO_ADAPTER_MODE = "netlify";
 * const netlifyAdapter = await adapter(); // Uses Netlify despite auto-detection
 * ```
 * 
 * @see {@link getAutoAdapterType} for auto-detection logic
 * @see {@link IAdapterOptions} for configuration options
 * @see {@link AdapterRegistry} for custom adapter registration
 * @see {@link createTypedAdapter} for type-safe custom adapters
 */
export async function adapter<TCustomAdapters extends Record<string, any> = {}>(
  type: keyof (IAdapterOptions<TCustomAdapters>) | ("string" & {}) = getEnv(AUTO_ASTRO_ADAPTER_ENV_VAR) as keyof IAdapterOptions<TCustomAdapters> ?? getAutoAdapterType(),
  opts: IAdapterOptions = {}
): Promise<AstroIntegration> {
  // First, check if this is a custom registered adapter
  const registry = opts.register || {};
  if (type in registry) {
    const customAdapterFactory = registry[type as keyof typeof registry];
    try {
      // Get the configuration for this custom adapter
      const customAdapterOptions = opts[type as string];

      // Call the factory function (handle both sync and async)
      const result = customAdapterFactory(customAdapterOptions);

      // Return the integration (await if it's a Promise)
      return await Promise.resolve(result);
    } catch (error) {
      throw new Error(
        `Failed to create custom adapter "${type as string}": ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        `Check your adapter factory function for errors.`,
        { cause: error }
      );
    }
  }

  switch (type) {
    case "cloudflare": {
      const cloudflare = (await safeImport("@astrojs/cloudflare")).default;
      return cloudflare(opts[type as "cloudflare"]);
    }
    case "deno": {
      const deno = (await safeImport("@deno/astro-adapter")).default;
      const denoOpts = (opts[type as "deno"] ?? {}) as DenoAdapterOptions;
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
      return netlify(opts[type as "netlify"]);
    }

    case "sst": {
      const sst = (await safeImport("astro-sst")).default;
      return sst(opts[type as "sst"])
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
      const vercelOpts = opts[type as "vercel"] ?? {};
      return vercel(vercelOpts);
    }

    /**
     * Node.js Adapter (Default):
     * Handles both explicit "node" selection and unknown adapter types
     * Defaults to standalone mode for easier deployment
     */
    case "node":
    default: {
      // If it's an unknown type (not "node"), provide helpful guidance
      if (type !== "node") {
        console.warn(
          `Unknown adapter type "${type as string}". Falling back to Node.js adapter.\n` +
          `To use custom adapters, register them via the 'register' option:\n` +
          `  register: { "${type as string}": (opts) => yourAdapterFactory(opts) }`
        );
      }

      const node = (await safeImport("@astrojs/node")).default;
      const nodeOpts = (opts[type as "node"] ?? {});

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
 * Function overload for basic adapter usage without custom types.
 * Provides backward compatibility and simple usage for built-in adapters.
 */
export function output(
  type?: keyof IAdapterOptions | ("string" & {}),
  mode?: (AstroConfig['output'] & {})
): AstroConfig['output'];

/**
 * Function overload for type-safe custom adapter usage.
 * Provides full TypeScript support when using custom adapter types.
 * 
 * @template TCustomAdapters - Custom adapter types interface
 */
export function output<TCustomAdapters extends Record<string, any>>(
  type: keyof (IAdapterOptions<TCustomAdapters>) | ("string" & {}),
  mode: (AstroConfig['output'] & {})
): AstroConfig['output'];

/**
 * Automatically selects the appropriate Astro output mode for the target environment.
 * 
 * Output modes determine how Astro renders pages:
 * - "static": Pre-renders all pages at build time (fastest, most compatible)
 * - "server": Renders pages on-demand at request time (enables SSR features)
 * - "hybrid": (Astro v4 only) Mix of static and server rendering per page
 * 
 * **Version Compatibility:**
 * - Astro v4: Supports "static", "server", and "hybrid" modes
 * - Astro v5+: "hybrid" deprecated, use "server"/"static" with selective prerendering
 * - Both versions support selective rendering via `export const prerender = true|false;`
 * 
 * **Important Notes:**
 * - This function primarily handles legacy adapter configurations
 * - Modern Astro projects should set output mode directly in astro.config.mjs
 * - Function gracefully handles hybrid mode for backward compatibility
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
 * // Hybrid mode (Astro v4) - gracefully handled in v5
 * const hybridMode = output("vercel", "hybrid"); // Works in v4, falls back to "server" in v5
 * 
 * // Environment variable override
 * process.env.ASTRO_OUTPUT_MODE = "server";
 * const envMode = output("vercel"); // Returns "server"
 * ```
 * 
 * @see {@link https://docs.astro.build/en/guides/on-demand-rendering/ Astro Rendering Modes}
 */
export function output<TCustomAdapters extends Record<string, any> = {}>(
  type: keyof IAdapterOptions<TCustomAdapters> | ("string" & {}) = getEnv(AUTO_ASTRO_ADAPTER_ENV_VAR) ?? getAutoAdapterType(),
  
  // I added the `{}` this is to ensure for older versions of Astro you won't see a type-error when entering hybrid
  mode = (getEnv(AUTO_ASTRO_OUTPUT_MODE_ENV_VAR) || "static") as (AstroConfig['output'] & {}) 
): AstroConfig['output'] {
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
     * 
     * Note: hybrid mode is handled above and converted if necessary
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
