# astro-auto-adapter

[![Open Bundle](https://bundlejs.com/badge-light.svg)](https://bundlejs.com/?q=astro-auto-adapter&bundle "Check the total bundle size of astro-auto-adapter")

[NPM](https://www.npmjs.com/package/astro-auto-adapter) <span style="padding-inline: 1rem">|</span> [GitHub](https://github.com/okikio/astro-auto-adapter#readme) <span style="padding-inline: 1rem">|</span> [Licence](./LICENSE)

Let's you choose Astro Adapters based off of the `ASTRO_ADAPTER_MODE` environment variable. 

## Supported Adapters:
* [node](https://docs.astro.build/en/guides/integrations-guide/node/)
* [deno](https://docs.astro.build/en/guides/integrations-guide/deno/)
* [cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
* [vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/)
* [netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)
* [sst](https://sst.dev/docs/component/aws/astro/)

> **What's New? 🚀**
> 
> `astro-auto-adapter` is now even smarter! Previously, you had to manually set the `ASTRO_ADAPTER_MODE` environment variable to choose the right Astro adapter for your project. 
> Now, we've added some magic to automatically detect the deployment environment you're using. 
> 
> For example, if you're deploying on `Vercel`, the `VERCEL` environment variable is set to `1`, and we'll automatically choose the `Vercel` adapter for you. Neat, right?
> 
> **Recent Updates:**
> - Added SST (Serverless Stack) adapter support for AWS deployments
> - Deprecated separate static/edge adapters (now handled by main adapters)
> - Improved auto-detection for deployment environments
> 
> Dive into the docs to see the magic behind each adapter platform:
> * [Vercel Docs](https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables)
> * [Netlify Docs](https://docs.netlify.com/configure-builds/environment-variables/#build-metadata)
> * [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent)
> * [Deno Docs](https://deno.land/api@v1.36.3?s=Deno)
> * [SST Docs]([https://](https://sst.dev/docs/start/aws/astro/))

> **Important**: Some adapters require additional configuration. Don't worry; we've got detailed examples below to guide you through it.

## Installation

**Quick Install:**

```bash
pnpm astro add astro-auto-adapter
```

**Custom Install:**

```bash
pnpm install astro-auto-adapter
```

**Then install the specific adapters you need:**

```bash
# For Vercel
pnpm add @astrojs/vercel

# For Netlify  
pnpm add @astrojs/netlify

# For Cloudflare
pnpm add @astrojs/cloudflare

# For Node.js
pnpm add @astrojs/node

# For Deno
pnpm add @deno/astro-adapter

# For SST
pnpm add astro-sst
```

<details>
    <summary>Other package managers</summary>

```bash
# npm
npm install astro-auto-adapter @astrojs/vercel

# yarn
yarn add astro-auto-adapter @astrojs/vercel
```

</details>

## Usage

### `adapter` Function

First, import the necessary types and the `adapter` function from the package:

```ts
import { adapter, type IAdapterOptions } from "astro-auto-adapter";
```

Next, call the `adapter()` function with the desired adapter type and options:

```ts
const astroAdapter = await adapter("netlify", {
  netlify: {
    builders: true,
  },
});
```

#### Adapter Options

Here is an overview of the available adapter options:

##### `VercelAdapterOptions`

Configuration options for the Vercel adapter.

```ts
import type { VercelAdapterOptions } from "astro-auto-adapter";
```

##### `NodeAdapterOptions`

Configuration options for the Node adapter.

```ts
import type { NodeAdapterOptions } from "astro-auto-adapter";
```

##### `CloudflareAdapterOptions`

Configuration options for the Cloudflare adapter.

```ts
import type { CloudflareAdapterOptions } from "astro-auto-adapter";
```

##### `DenoAdapterOptions`

Configuration options for the Deno adapter.

```ts
import type { DenoAdapterOptions } from "astro-auto-adapter";
```

##### `NetlifyAdapterOptions`

Configuration options for the Netlify adapter.

```ts
import type { NetlifyAdapterOptions } from "astro-auto-adapter";
```

##### `SSTAdapterOptions`

Configuration options for the SST (Serverless Stack) adapter.

```ts
import type { SSTAdapterOptions } from "astro-auto-adapter";
```

#### Environment Variable

You can use the `ASTRO_ADAPTER_MODE` environment variable to set the adapter type instead of providing it directly to the `adapter()` function. If the environment variable is not set, the function automatically detects the environment or defaults to the "node" adapter.

```sh
export ASTRO_ADAPTER_MODE="netlify"
```

#### Default Export

The package also includes a default export that can be used as a shorthand for calling the `adapter()` function.

```ts
import adapter from "astro-auto-adapter";

const astroAdapter = await adapter("netlify", {
  netlify: {
    builders: true,
  },
});
```

### Examples

Here are some examples of how to use the package with various adapter types and configurations:

#### Cloudflare

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').CloudflareAdapterOptions} */
const options = {
  imageService: "cloudflare",
  runtime: { mode: "local" }
};

const astroAdapter = await adapter("cloudflare", { cloudflare: options });
```

#### Deno

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').DenoAdapterOptions} */
const options = {
  port: 3000,
  hostname: "localhost",
};

const astroAdapter = await adapter("deno", { deno: options });
```

#### Netlify

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').NetlifyAdapterOptions} */
const options = {
  builders: true,
  edgeMiddleware: true,
  binaryMediaTypes: ["application/octet-stream"],
};

const astroAdapter = await adapter("netlify", { netlify: options });
```

#### SST (Serverless Stack)

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').SSTAdapterOptions} */
const options = {
  responseMode: "stream", // or "buffer"
};

const astroAdapter = await adapter("sst", { sst: options });
```

#### Vercel

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').VercelAdapterOptions} */
const options = {
  webAnalytics: { enabled: true },
  speedInsights: { enabled: true },
};

const astroAdapter = await adapter("vercel", { vercel: options });
```

#### Node

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').NodeAdapterOptions} */
const options = {
  mode: "standalone",
  host: "0.0.0.0",
  port: 3000,
};

const astroAdapter = await adapter("node", { node: options });
```

### `output` Function

The `output` function in `astro-auto-adapter` is a smart utility designed to automatically select the appropriate [Astro output mode](https://docs.astro.build/en/guides/on-demand-rendering/) based on the target deployment environment. This function is especially useful when working with different hosting platforms, as it simplifies the process of configuring the correct output mode for Astro projects.

#### Key Features:
- **Automatic Mode Selection:** Chooses the correct Astro output mode (static or server) based on the environment.
- **Environment Variable Support:** Uses `ASTRO_OUTPUT_MODE` to determine the preferred mode if set.
- **Fallback to Default Mode:** If the environment variable isn't set, the function falls back to "static" by default.

#### Usage in Astro Projects:

To use the `output` function, you need to import it into your Astro project and then call it with appropriate parameters. Here's a general structure of how to use it:

```ts
import { output } from 'astro-auto-adapter';

// Usage
const astroOutputMode = output('deno', 'server');
```

#### Parameters:
- `type` (optional): Type of adapter you're using (e.g., 'vercel', 'netlify', 'sst'). Defaults to the value from the `ASTRO_ADAPTER_MODE` environment variable.
- `mode` (optional): Sets Astro output mode ('static' or 'server'). Defaults to 'static', if the `ASTRO_OUTPUT_MODE` environment variable isn't set.

> **Note**: As of Astro v5, `hybrid` mode has been deprecated. Both `server` and `static` modes now support selective rendering using `export const prerender = true | false;` on individual pages.

#### Examples:

**1. Using with Vercel:**

```ts
// Automatically choose output mode for Vercel deployment, defaults to "static"
const outputMode = output('vercel');
```

**2. Using with Netlify:**

```ts
// Use the server output for netlify
const outputMode = output('netlify', 'server');
```

**3. Using with SST:**

```ts
// Use the server output for SST
const outputMode = output('sst', 'server');
```

**4. Selective Rendering (Replaces Hybrid Mode):**

```ts
// Use server mode with selective prerendering
const outputMode = output('vercel', 'server');

// Then in individual pages:
// src/pages/static-page.astro
export const prerender = true; // This page will be static

// src/pages/dynamic-page.astro  
export const prerender = false; // This page will be server-rendered
```

**5. Default Usage (No Specific Adapter):**

```ts
// Use the default output mode "static" or the one defined in `ASTRO_OUTPUT_MODE`
const outputMode = output();
```

#### Supported Adapters:
- Vercel
- Netlify
- Cloudflare
- Deno
- Node.js
- SST (Serverless Stack)

> **Note**: Ensure that the necessary environment variables are set appropriately for the `output` function to work correctly.

## ⚠️ Deprecated Features

The following adapter types have been deprecated and consolidated into their main adapters:

- `netlify-static` → Use `netlify` with output mode `static`
- `netlify-edge` → Use `netlify` with appropriate configuration
- `vercel-static` → Use `vercel` with output mode `static`  
- `vercel-edge` → Use `vercel` with appropriate configuration

**Astro v5 Changes:**
- `hybrid` output mode → Use `server` or `static` with `export const prerender = true | false;` on individual pages

**Migration Examples:**
```ts
// ❌ Old (deprecated)
const adapter = await adapter("vercel-static", { "vercel-static": options });

// ✅ New (recommended)
const adapter = await adapter("vercel", { vercel: options });
const outputMode = output("vercel", "static");

// ❌ Old hybrid mode (Astro v4)
const outputMode = output("vercel", "hybrid");

// ✅ New selective rendering (Astro v5)
const outputMode = output("vercel", "server");
// Then use export const prerender = true; on static pages
```

## Showcase

A couple sites/projects that use `astro-auto-adapter`:

- Your site/project here...
  
## Contributing

I encourage you to use [pnpm](https://pnpm.io/configuring) to contribute to this repo, but you can also use [yarn](https://classic.yarnpkg.com/lang/en/) or [npm](https://npmjs.com) if you prefer.

Install all necessary packages

```bash
pnpm install
```

Then run tests

```bash
pnpm test
```

Build project

```bash
pnpm run build
```

> **Note**: _This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard for commits, so, please format your commits using the rules it sets out._

## Licence

See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).