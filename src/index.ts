import type { VercelServerlessConfig as VercelAdapterOptions } from "@astrojs/vercel/serverless";
import type { VercelEdgeConfig as VercelEdgeAdapterOptions } from "@astrojs/vercel/edge";
import type { VercelStaticConfig as VercelStaticAdapterOptions } from "@astrojs/vercel/static";
import type { netlifyEdgeFunctions, netlifyFunctions, netlifyStatic } from "@astrojs/netlify";
import type createCloudflareWorkersIntegration from "@astrojs/cloudflare";
import type createDenoIntegration from "@astrojs/deno";
import type createNodeIntegration from "@astrojs/node";
import type { AstroIntegration } from "astro";

export type CloudflareAdapterOptions = Parameters<typeof createCloudflareWorkersIntegration>[0];
export type NetlifyEdgeFunctionsAdapterOptions = Parameters<typeof netlifyEdgeFunctions>[0];
export type NetlifyFunctionsAdapterOptions = Parameters<typeof netlifyFunctions>[0];
export type NetlifyStaticAdapterOptions = Parameters<typeof netlifyStatic> extends never ? undefined | {} : Parameters<typeof netlifyStatic>[number];
export type NodeAdapterOptions = Parameters<typeof createNodeIntegration>[0];
export type DenoAdapterOptions = Parameters<typeof createDenoIntegration>[0];
export type { VercelAdapterOptions, VercelEdgeAdapterOptions, VercelStaticAdapterOptions };

export interface IAdapterOptions {
  cloudflare?: CloudflareAdapterOptions;
  deno?: DenoAdapterOptions;
  netlify?: NetlifyFunctionsAdapterOptions;
  "netlify-static"?: NetlifyStaticAdapterOptions;
  "netlify-edge"?: NetlifyEdgeFunctionsAdapterOptions;
  vercel?: VercelAdapterOptions;
  "vercel-static"?: VercelStaticAdapterOptions;
  "vercel-edge"?: VercelEdgeAdapterOptions;
  node?: NodeAdapterOptions;
}

export const AUTO_ASTRO_ADAPTER_ENV_VAR = "ASTRO_ADAPTER_MODE";

/**
 * Get environment variable value
 * @param name environment variable name
 */
export function getEnv<T extends string>(name: T): string | undefined {
  if ("Deno" in globalThis) {
    return globalThis?.Deno?.get?.(name);
  }

  if ("Netlify" in globalThis) {
    return globalThis?.Netlify?.get?.(name);
  }

  const env = globalThis?.process?.env ?? {};
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
   * Vercel Edge Function Docs: https://vercel.com/docs/functions/edge-functions/edge-runtime#check-if-you're-running-on-the-edge-runtime 
   */
  if ("EdgeRuntime" in globalThis) 
    return "vercel-edge";

  /** 
   * Netlify Edge Function Docs: https://docs.netlify.com/edge-functions/api/#netlify-specific-context-object
   */
  if ("Netlify" in globalThis) 
    return "netlify-edge";

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
      return cloudflare(opts[type as "cloudflare"]);
    }
    case "deno": {
      const deno = (await import("@astrojs/deno")).default;
      return deno(opts[type]);
    }
    case "netlify": {
      const netlify = await import("@astrojs/netlify");
      return netlify.netlifyFunctions(opts[type]);
    }
    case "netlify-static": {
      const netlify = await import("@astrojs/netlify");
      return netlify.netlifyStatic();
    }
    case "netlify-edge": {
      const netlify = await import("@astrojs/netlify");
      return netlify.netlifyEdgeFunctions(opts[type]);
    }
    case "vercel": {
      const vercel = (await import("@astrojs/vercel/serverless")).default;
      return vercel(opts[type]);
    }
    case "vercel-static": {
      const vercelStatic = (await import("@astrojs/vercel/static")).default;
      return vercelStatic(opts[type]);
    }
    case "vercel-edge": {
      const vercelEdge = (await import("@astrojs/vercel/edge")).default;
      return vercelEdge(opts[type]);
    }
    case "node":
    default: {
      const node = (await import("@astrojs/node")).default;
      const nodeOpts = (opts[type] ?? {}) as NodeAdapterOptions;
      return node({
        mode: "standalone",
        ...nodeOpts
      });
    }
  }
}

export default adapter;
