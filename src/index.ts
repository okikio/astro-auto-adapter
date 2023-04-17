import type { VercelServerlessConfig as VercelAdapterOptions } from "@astrojs/vercel/serverless";
import type { VercelEdgeConfig as VercelEdgeAdapterOptions } from "@astrojs/vercel/edge";
import type { UserOptions as NodeAdapterOptions } from "@astrojs/node/dist/types";
import type { AstroIntegration } from "astro";

export type { VercelAdapterOptions, VercelEdgeAdapterOptions, NodeAdapterOptions };

const netlify = await import("@astrojs/netlify").then((m) => m.default).catch(() => null);
const vercel = await import("@astrojs/vercel/serverless").then((m) => m.default).catch(() => null);
const vercelEdge = await import("@astrojs/vercel/edge").then((m) => m.default).catch(() => null);
const cloudflare = await import("@astrojs/cloudflare").then((m) => m.default).catch(() => null);
const deno = await import("@astrojs/deno").then((m) => m.default).catch(() => null);
const node = await import("@astrojs/node").then((m) => m.default).catch(() => null);

export type CloudflareAdapterOptions = {
  mode: "directory" | "advanced";
};

export interface DenoAdapterOptions {
  port?: number;
  hostname?: string;
}

export interface NetlifyAdapterOptions {
  dist?: URL;
  builders?: boolean;
  binaryMediaTypes?: string[];
}

export interface NetlifyEdgeAdapterOptions {
  dist?: URL;
}

export interface IAdapterOptions {
  cloudflare?: CloudflareAdapterOptions;
  deno?: DenoAdapterOptions;
  netlify?: NetlifyAdapterOptions;
  "netlify-edge"?: NetlifyEdgeAdapterOptions;
  vercel?: VercelAdapterOptions;
  "vercel-edge"?: VercelEdgeAdapterOptions;
  node?: NodeAdapterOptions;
  [key: string]: unknown;
}

export const AUTO_ASTRO_ADAPTER_ENV_VAR = "ASTRO_ADAPTER_MODE";

/**
 * Automatically chooses the correct adapter to use for the target environment
 * > NOTE!: You may need to setup some options for some of the target environments supported
 *
 * @param type which adapter to use
 * @param opts setting the correct adapter options, e.g. on Netlify which `dist` folder shoukld be used, etc...
 * @returns Astro Integration
 */
export function adapter(
  type: keyof IAdapterOptions | ("string" & {}) = process.env[AUTO_ASTRO_ADAPTER_ENV_VAR] ?? "node",
  opts: IAdapterOptions = {}
): AstroIntegration {
  switch (type) {
    case "cloudflare":
      return cloudflare(opts[type]);
    case "deno":
      return deno(opts[type]);
    case "netlify":
      return netlify.netlifyFunctions(opts[type]);
    case "netlify-edge":
      return netlify.netlifyEdgeFunctions(opts[type]);
    case "vercel":
      return vercel(opts[type]);
    case "vercel-edge":
      return vercelEdge(opts[type]);
    case "node":
    default:
      const nodeOpts = (opts[type] ?? {}) as NodeAdapterOptions;
      return node({
        mode: "standalone",
        ...nodeOpts
      });
  }
}

export default adapter;
