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
> * [SST Docs](https://sst.dev/docs/start/aws/astro/)

> **Important**: 
> - Only install the adapters you actually use to avoid a large list of adapters you don't use
> - This package uses peer dependencies, so adapter versions are managed by your project
> - Future adapter updates don't require updating `astro-auto-adapter`

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

#### Error Handling

If you try to use an adapter that isn't installed, you'll get a helpful error message:

```bash
Error: Package "@astrojs/vercel" is not installed. Please install it with:
pnpm add @astrojs/vercel
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

#### Custom/Third-Party Adapters

You can register custom adapters for platforms not included by default:

```ts
import { adapter } from "astro-auto-adapter";

const astroAdapter = await adapter("railway", {
  // Configuration for your custom adapter
  railway: { 
    region: "us-west",
    environmentId: "prod" 
  },
  
  // Register the custom adapter factory
  register: {
    railway: async (opts) => {
      const { default: railwayAdapter } = await import("@railway/astro-adapter");
      return railwayAdapter(opts);
    },
    
    // You can register multiple custom adapters
    "custom-platform": (opts) => {
      return {
        name: "custom-platform-adapter",
        hooks: {
          "astro:config:setup": ({ updateConfig }) => {
            updateConfig({ 
              output: "server",
              // Your custom configuration
            });
          }
        }
      };
    }
  }
});
```

#### Type-Safe Custom Adapters

For full TypeScript support with custom adapters:

```ts
import { adapter, createTypedAdapter } from "astro-auto-adapter";
import type { AdapterFactory } from "astro-auto-adapter";

// 1. Define your adapter options interface
interface RailwayOptions {
  region: 'us-west' | 'us-east' | 'eu-west';
  healthCheckPath?: string;
  environmentId?: string;
}

interface CustomPlatformOptions {
  apiKey: string;
  endpoint: string;
  timeout?: number;
}

// 2. Create type-safe adapter factories
const railwayAdapter = createTypedAdapter<RailwayOptions>(async (options) => {
  // Full type safety here! IntelliSense knows about all properties
  const { default: railway } = await import("@railway/astro-adapter");
  return railway({
    region: options.region, // ✅ Autocomplete: 'us-west' | 'us-east' | 'eu-west'
    healthCheckPath: options.healthCheckPath ?? '/health', // ✅ Optional property
    environmentId: options.environmentId
  });
});

const customAdapter = createTypedAdapter<CustomPlatformOptions>((options) => ({
  name: "custom-platform-adapter",
  hooks: {
    "astro:config:setup": ({ updateConfig }) => {
      updateConfig({
        output: "server",
        vite: {
          define: {
            'process.env.API_KEY': JSON.stringify(options.apiKey), // ✅ Type-safe
            'process.env.ENDPOINT': JSON.stringify(options.endpoint)
          }
        }
      });
    }
  }
}));

// 3. Define your custom adapter types interface
interface CustomAdapters {
  railway: RailwayOptions;
  'custom-platform': CustomPlatformOptions;
}

// 4. Use with full type safety!
const astroAdapter = await adapter<CustomAdapters>("railway", {
  railway: {
    region: "us-west", // ✅ IntelliSense + validation
    healthCheckPath: "/api/health", // ✅ Optional property
    // environmentId: "missing" // ✅ Would show autocomplete
  },
  register: {
    railway: railwayAdapter,
    'custom-platform': customAdapter
  }
});

// TypeScript will catch errors:
// ❌ This would show a type error:
// railway: { region: "invalid-region" } // Type error!
```

#### Alternative: Direct Type Declaration

You can also use module augmentation for global type safety:

```ts
// types/astro-auto-adapter.d.ts
declare module "astro-auto-adapter" {
  interface IAdapterOptions {
    railway?: {
      region: 'us-west' | 'us-east' | 'eu-west';
      healthCheckPath?: string;
      environmentId?: string;
    };
    'custom-platform'?: {
      apiKey: string;
      endpoint: string;
      timeout?: number;
    };
  }
}

// Now you get type safety everywhere without generics:
const astroAdapter = await adapter("railway", {
  railway: {
    region: "us-west", // ✅ Fully typed!
    healthCheckPath: "/health"
  }
});
```

**Benefits of Type-Safe Custom Adapters:**
- ✅ **Full IntelliSense** - Autocomplete for all adapter options
- ✅ **Compile-time validation** - Catch configuration errors early  
- ✅ **Refactoring safety** - Rename properties with confidence
- ✅ **Documentation integration** - JSDoc comments in autocomplete
- ✅ **Zero runtime overhead** - Types are compile-time only

### **Type Safety Best Practices:**

#### 1. **Define Strict Option Types**
```ts
// ✅ Good: Use union types for strict validation
interface AdapterOptions {
  region: 'us-west' | 'us-east' | 'eu-west'; // Limited to valid values
  memory: 512 | 1024 | 2048 | 4096; // Specific memory sizes
  ssl?: boolean; // Optional with clear intent
}

// ❌ Avoid: Too generic
interface AdapterOptions {
  region: string; // Any string accepted
  memory: number; // Any number accepted
}
```

#### 2. **Use JSDoc for Better Developer Experience**
```ts
interface RailwayOptions {
  /** 
   * Deployment region for your Railway service
   * @default "us-west"
   */
  region: 'us-west' | 'us-east' | 'eu-west';
  
  /** 
   * Custom health check endpoint path
   * @example "/api/health"
   * @default "/health"
   */
  healthCheckPath?: string;
}
```

#### 3. **Organize Types in Separate Files**
```ts
// types/railway.ts
export interface RailwayOptions { /* ... */ }

// types/digitalocean.ts  
export interface DigitalOceanOptions { /* ... */ }

// types/adapters.ts - Aggregate all custom adapters
export interface CustomAdapters {
  railway: RailwayOptions;
  digitalocean: DigitalOceanOptions;
}
```

#### 4. **Provide Default Values in Factories**
```ts
const railwayAdapter = createTypedAdapter<RailwayOptions>(async (options) => {
  // Provide sensible defaults
  const config = {
    region: 'us-west',
    healthCheckPath: '/health',
    memory: 1024,
    ...options // User options override defaults
  };
  
  const { default: railway } = await import('@railway/astro-adapter');
  return railway(config);
});
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

**4. Hybrid Mode (Astro v4 & v5 Compatible):**

```ts
// Astro v4: Uses hybrid mode natively
// Astro v5: Automatically converts to server mode with warning
const outputMode = output('vercel', 'hybrid');

// Modern approach (works in both versions):
const outputMode = output('vercel', 'server');
// Then use selective prerendering in individual pages:
// export const prerender = true; // Static page
// export const prerender = false; // Server-rendered page
```

**5. Selective Rendering (Astro v5 Preferred):**

```ts
// Use server mode with selective prerendering
const outputMode = output('vercel', 'server');

// Then in individual pages:
// src/pages/static-page.astro
export const prerender = true; // This page will be static

// src/pages/dynamic-page.astro  
export const prerender = false; // This page will be server-rendered
```

**6. Default Usage (No Specific Adapter):**

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
- Custom adapters via `register` option

#### Version Compatibility:
- **Astro v4**: Full support including `hybrid` mode
- **Astro v5+**: Full support with automatic `hybrid` → `server` conversion
- **Backward Compatible**: Works seamlessly across version upgrades

> **Note**: Ensure that the necessary environment variables are set appropriately for the `output` function to work correctly.

## ⚠️ Deprecated Features

The following adapter types have been deprecated and consolidated into their main adapters:

- `netlify-static` → Use `netlify` with output mode `static`
- `netlify-edge` → Use `netlify` with appropriate configuration
- `vercel-static` → Use `vercel` with output mode `static`  
- `vercel-edge` → Use `vercel` with appropriate configuration

**Astro Version Compatibility:**
- `hybrid` output mode → **Astro v4**: Supported natively, **Astro v5+**: Auto-converts to `server` mode with selective prerendering

**Migration Examples:**
```ts
// ❌ Old (deprecated)
const adapter = await adapter("vercel-static", { "vercel-static": options });

// ✅ New (recommended)
const adapter = await adapter("vercel", { vercel: options });
const outputMode = output("vercel", "static");

// ✅ Hybrid mode compatibility (works in both v4 and v5)
const outputMode = output("vercel", "hybrid"); // Auto-converts to "server" in v5

// ✅ Modern selective rendering (Astro v5 preferred)
const outputMode = output("vercel", "server");
// Then use export const prerender = true; on static pages
```

## Showcase

A couple sites/projects that use `astro-auto-adapter`:

- Your site/project here...

### **Real-World Type-Safe Custom Adapter Example:**

```ts
// types/adapters.ts - Define your custom adapter types
export interface RailwayOptions {
  region: 'us-west' | 'us-east' | 'eu-west';
  healthCheckPath?: string;
  environmentId?: string;
  memory?: 512 | 1024 | 2048 | 4096;
}

export interface DigitalOceanOptions {
  dropletSize: 's-1vcpu-1gb' | 's-2vcpu-2gb' | 's-4vcpu-8gb';
  region: 'nyc1' | 'sfo3' | 'fra1';
  enableBackups?: boolean;
}

// Define the custom adapters interface
export interface CustomAdapters {
  railway: RailwayOptions;
  digitalocean: DigitalOceanOptions;
}
```

```ts
// astro.config.mjs - Use with full type safety
import { defineConfig } from 'astro/config';
import { adapter, output, createTypedAdapter } from 'astro-auto-adapter';
import type { CustomAdapters, RailwayOptions, DigitalOceanOptions } from './types/adapters';

// Create type-safe adapter factories
const railwayAdapter = createTypedAdapter<RailwayOptions>(async (options) => {
  const { default: railway } = await import('@railway/astro-adapter');
  return railway({
    region: options.region,
    healthCheckPath: options.healthCheckPath ?? '/health',
    environmentId: options.environmentId,
    memory: options.memory ?? 1024
  });
});

const digitalOceanAdapter = createTypedAdapter<DigitalOceanOptions>(async (options) => {
  const { default: digitalOcean } = await import('@digitalocean/astro-adapter');
  return digitalOcean({
    dropletSize: options.dropletSize,
    region: options.region,
    enableBackups: options.enableBackups ?? true
  });
});

export default defineConfig({
  output: output('railway', 'server'),
  adapter: await adapter<CustomAdapters>('railway', {
    railway: {
      region: 'us-west', // ✅ IntelliSense autocomplete!
      healthCheckPath: '/api/health',
      environmentId: process.env.RAILWAY_ENVIRONMENT_ID,
      memory: 2048 // ✅ Type validation: only 512|1024|2048|4096 allowed
    },
    register: {
      railway: railwayAdapter,
      digitalocean: digitalOceanAdapter
    }
  })
});
```

```ts
// Alternative: Environment-based selection with type safety
import type { CustomAdapters } from './types/adapters';
import { getEnv } from "astro-auto-adapter";

const adapterType = getEnv("DEPLOYMENT_TARGET") || 'railway';

export default defineConfig({
  output: output(adapterType, 'server'),
  adapter: await adapter<CustomAdapters>(adapterType as keyof CustomAdapters, {
    railway: {
      region: 'us-west', // ✅ Fully typed
      memory: 1024
    },
    digitalocean: {
      dropletSize: 's-2vcpu-2gb', // ✅ Autocomplete + validation
      region: 'nyc1'
    },
    register: {
      railway: railwayAdapter,
      digitalocean: digitalOceanAdapter
    }
  })
});
```
  
## Contributing

This project uses [pnpm](https://pnpm.io/) as the package manager.

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

### Architecture Notes

This package uses **peer dependencies** for adapters rather than bundling them directly. This approach:
- ✅ Reduces bundle size (users only install adapters they use)
- ✅ Allows automatic updates to latest adapter versions  
- ✅ Prevents version conflicts with user projects
- ✅ Eliminates need for constant package updates

> **Note**: _This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard for commits, so, please format your commits using the rules it sets out._

## Licence

See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).