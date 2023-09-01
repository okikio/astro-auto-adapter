# astro-auto-adapter

[![Open Bundle](https://bundlejs.com/badge-light.svg)](https://bundlejs.com/?q=astro-auto-adapter&bundle "Check the total bundle size of astro-auto-adapter")

[NPM](https://www.npmjs.com/package/astro-auto-adapter) <span style="padding-inline: 1rem">|</span> [GitHub](https://github.com/okikio/astro-auto-adapter#readme) <span style="padding-inline: 1rem">|</span> [Licence](./LICENSE)

Let's you choose Astro Adapters based off of the `ASTRO_ADAPTER_MODE` environment variable. 

Supported Adapters:
* [node](https://docs.astro.build/en/guides/integrations-guide/node/)
* [deno](https://docs.astro.build/en/guides/integrations-guide/deno/)
* [cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
* [vercel (static, and serverless)](https://docs.astro.build/en/guides/deploy/vercel/)
* [netlify (static, and edge)](https://docs.astro.build/en/guides/deploy/netlify/)


> **What's New? 🚀**
> 
> `astro-auto-adapter` is now even smarter! Previously, you had to manually set the `ASTRO_ADAPTER_MODE` environment variable to choose the right Astro adapter for your project. 
> Now, we've added some magic to automatically detect the deployment environment you're using. 
> 
> For example, if you're deploying on `Vercel Serverless`, the `VERCEL` environment variable is set to `1`, and we'll automatically choose the `Vercel serverless` adapter for you. Neat, right?
> 
> Dive into the docs to see the magic behind each adapter platform:
> * [Vercel Serverless Docs](https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables)
> * [Vercel Edge Function Docs](https://vercel.com/docs/functions/edge-functions/edge-runtime#check-if-you're-running-on-the-edge-runtime)
> * [Netlify Serverless Docs](https://docs.netlify.com/configure-builds/environment-variables/#build-metadata)
> * [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent)
> * [Deno Docs](https://deno.land/api@v1.36.3?s=Deno)


> **Heads Up**: Some adapters require additional configuration. Don't worry; we've got detailed examples below to guide you through it.

<!-- > You can also read the [blog post](https://blog.okikio.dev/astro-auto-adapter), created for it's launch. -->

## Installation

```bash
npm install astro-auto-adapter
```

<details>
    <summary>Others</summary>

```bash
yarn add astro-auto-adapter
```

or

```bash
pnpm install astro-auto-adapter
```

</details>


## Usage

First, import the necessary types and the `adapter` function from the package:

```ts
import { adapter, type IAdapterOptions } from "astro-auto-adapter";
```

Next, call the `adapter()` function with the desired adapter type and options:

```ts
const astroAdapter = await adapter("netlify", {
  netlify: {
    dist: new URL("path/to/dist", import.meta.url),
  },
});
```

### Adapter Options

Here is an overview of the available adapter options:

#### `VercelAdapterOptions`

Configuration options for the Vercel serverless adapter.

```ts
import type { VercelAdapterOptions } from "astro-auto-adapter";
```

#### `VercelStaticAdapterOptions`

Configuration options for the Vercel static adapter.

```ts
import type { VercelStaticAdapterOptions } from "astro-auto-adapter";
```

#### `NodeAdapterOptions`

Configuration options for the Node adapter.

```ts
import type { NodeAdapterOptions } from "astro-auto-adapter";
```

#### `CloudflareAdapterOptions`

Configuration options for the Cloudflare adapter.

```ts
import type { CloudflareAdapterOptions } from "astro-auto-adapter";
```

#### `DenoAdapterOptions`

Configuration options for the Deno adapter.

```ts
import type { DenoAdapterOptions } from "astro-auto-adapter";
```

#### `NetlifyAdapterOptions`

Configuration options for the Netlify adapter.

```ts
import type { NetlifyAdapterOptions } from "astro-auto-adapter";
```

#### `NetlifyFunctionsAdapterOptions`

Configuration options for the Netlify functions adapter.

```ts
import type { NetlifyFunctionsAdapterOptions } from "astro-auto-adapter";
```

#### `NetlifyStaticAdapterOptions`

Configuration options for the Netlify static adapter.

```ts
import type { NetlifyStaticAdapterOptions } from "astro-auto-adapter";
```

### Environment Variable

You can use the `ASTRO_ADAPTER_MODE` environment variable to set the adapter type instead of providing it directly to the `adapter()` function. If the environment variable is not set, the function defaults to the "node" adapter.

```sh
export ASTRO_ADAPTER_MODE="netlify"
```

### Default Export

The package also includes a default export that can be used as a shorthand for calling the `adapter()` function.

```ts
import adapter from "astro-auto-adapter";

const astroAdapter = await adapter("netlify", {
  netlify: {
    dist: new URL("path/to/dist", import.meta.url),
  },
});
```

## Examples

Here are some examples of how to use the package with various adapter types and configurations:

### Cloudflare

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').CloudflareAdapterOptions} */
const options = {
  mode: "directory",
};

const astroAdapter = await adapter("cloudflare", { cloudflare: options });
```

### Deno

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').DenoAdapterOptions} */
const options = {
  port: 3000,
  hostname: "localhost",
};

const astroAdapter = await adapter("deno", { deno: options });
```

### Netlify

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').NetlifyFunctionsAdapterOptions} */
const options = {
  dist: new URL("path/to/dist", import.meta.url),
  builders: true,
  binaryMediaTypes: ["application/octet-stream"],
};

const astroAdapter = await adapter("netlify", { netlify: options });
```

### Netlify Static

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').NetlifyStaticAdapterOptions} */
const options = {
  dist: new URL("path/to/dist", import.meta.url),
};

const astroAdapter = await adapter("netlify-static", { "netlify-static": options });
```

### Vercel

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').VercelAdapterOptions} */
const options = {
  // Configuration options go here
};

const astroAdapter = await adapter("vercel", { vercel: options });
```

### Vercel Static

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').VercelStaticAdapterOptions} */
const options = {
  // Configuration options go here
};

const astroAdapter = await adapter("vercel-static", { "vercel-static": options });
```

### Node

```ts
import { adapter } from "astro-auto-adapter";

/** @type {import('astro-auto-adapter').NodeAdapterOptions} */
const options = {
  // Configuration options go here
};

const astroAdapter = await adapter("node", { node: options });
```


## Showcase

A couple sites/projects that use `astro-auto-adapter`:

<!-- - [bundlejs](https://bundlejs.com) -->
- Your site/project here...
  

## Contributing

I encourage you to use [pnpm](https://pnpm.io/configuring) to contribute to this repo, but you can also use [yarn](https://classic.yarnpkg.com/lang/en/) or [npm](https://npmjs.com) if you prefer.

Install all necessary packages

```bash
npm install
```

Then run tests

```bash
npm test
```

Build project

```bash
npm run build
```

> **Note**: _This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard for commits, so, please format your commits using the rules it sets out._

## Licence

See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).
