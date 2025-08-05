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

export interface IAdapterOptions {
  cloudflare?: CloudflareAdapterOptions;
  deno?: DenoAdapterOptions;
  netlify?: NetlifyAdapterOptions;
  "sst"?: SSTAdapterOptions;
  /**
   * @deprecated Netlify Static functions have been deprecated as a separate adapter
   */
  "netlify-static"?: never;
  /**
   * @deprecated Netlify Edge functions have been deprecated as a separate adapter
   */
  "netlify-edge"?: never;
  vercel?: VercelAdapterOptions;
  /**
   * @deprecated Vercel Static functions have been deprecated as a separate adapter
   */
  "vercel-static"?: VercelAdapterOptions;
  /**
   * @deprecated Vercel Edge functions have now been deprecated as a seperate adapter https://github.com/withastro/astro/blob/main/packages/integrations/vercel/CHANGELOG.md#400
   */
  "vercel-edge"?: never;
  node?: NodeAdapterOptions;
  [type: string]: any
}

export const AUTO_ASTRO_ADAPTER_ENV_VAR = "ASTRO_ADAPTER_MODE";
export const AUTO_ASTRO_OUTPUT_MODE_ENV_VAR = "ASTRO_OUTPUT_MODE";

// Augmenting the globalThis interface
interface CustomGlobalThis {
  Deno?: { env?: Map<string, string> };
  Netlify?: { env?: Map<string, string> };
}

// Create a type that combines globalThis with the custom properties
type ExtendedGlobalThis = typeof globalThis & CustomGlobalThis;

/**
 * Get environment variable value
 * @param name environment variable name
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
 * Use the built-in system env vars to determine the adapter to use
 * e.g. Vercel exposes the "VERCEL" env var which indicates that Astro is being deployed on Vercel
 */
export function getAutoAdapterType(): keyof IAdapterOptions {
  /**
   * Vercel Serverless Docs: https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables
   */
  if (getEnv("VERCEL") === "1") 
    return "vercel";

  /**
   * Netlify Docs: https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
   */
  if (getEnv("NETLIFY") === "true") 
    return "netlify";

  /**
   * Cloudflare Workers Docs: https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
   */
  if (globalThis?.navigator?.userAgent === 'Cloudflare-Workers')
    return "cloudflare";

  /**
   * Deno Docs: https://deno.land/api@v1.36.3?s=Deno
   */
  if ("Deno" in globalThis) 
    return "deno";
  
  return "node";
}

/**
 * Automatically chooses the correct adapter to use for the target environment
 * > NOTE!: You may need to setup some options for some of the target environments supported
 *
 * @param type which adapter to use
 * @param opts setting the correct adapter options, e.g. on Netlify which `dist` folder should be used, etc...
 * @returns Astro Integration
 */
export async function adapter(
  type: keyof IAdapterOptions | ("string" & {}) = getEnv(AUTO_ASTRO_ADAPTER_ENV_VAR) as keyof IAdapterOptions ?? getAutoAdapterType(),
  opts: IAdapterOptions = {}
): Promise<AstroIntegration> {
  switch (type) {
    case "cloudflare": {
      const cloudflare = (await import("@astrojs/cloudflare")).default;
      return cloudflare(opts[type]);
    }
    case "deno": {
      const deno = (await import("@deno/astro-adapter")).default;
      const denoOpts = (opts[type] ?? {}) as DenoAdapterOptions;
      return deno({
        port: 4321,
        ...denoOpts
      });
    }
    case "netlify":
    case "netlify-edge": 
    case "netlify-static": {
      const netlify = (await import("@astrojs/netlify")).default;
      return netlify(opts[type]);
    }
    case "sst": {
      const sst = (await import("astro-sst")).default;
      return sst(opts[type])
    }
    case "vercel":
    case "vercel-edge": 
    case "vercel-static": {
      const vercel = (await import("@astrojs/vercel")).default;
      const vercelOpts = opts[type] ?? {};
      return vercel(vercelOpts);
    }
    case "node":
    default: {
      const node = (await import("@astrojs/node")).default;
      const nodeOpts = (opts[type] ?? {});
      return node({
        mode: "standalone",
        ...nodeOpts
      });
    }
  }
}

/**
 * Automatically chooses the correct astro output mode to use for the target environment
 * > NOTE!: You may need to setup some options for some of the target environments supported
 *
 * @param type which adapter to use
 * @param mode what output mode should be used; when unset uses the `ASTRO_OUPUT_MODE` env var
 * @returns Astro output mode, "static", "server" (default "static")
 */
export function output(
  type: keyof IAdapterOptions | ("string" & {}) = getEnv(AUTO_ASTRO_ADAPTER_ENV_VAR) as keyof IAdapterOptions ?? getAutoAdapterType(),
  mode = (getEnv(AUTO_ASTRO_OUTPUT_MODE_ENV_VAR) || "static") as AstroConfig['output']
) {
  switch (type) {
    case "vercel-static":
    case "netlify-static": {
      return "static";
    }
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

export default adapter;
