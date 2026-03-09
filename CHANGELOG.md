# [2.5.0](https://github.com/okikio/astro-auto-adapter/compare/v2.4.1...v2.5.0) (2026-03-09)


### Bug Fixes

* add registry-url to setup-node and update all actions to latest versions ([08dd6c9](https://github.com/okikio/astro-auto-adapter/commit/08dd6c98f3d7be6a5a2bdf822eeb8527179e7c91))
* address remaining cli review feedback ([e56649a](https://github.com/okikio/astro-auto-adapter/commit/e56649a68531930347be010f92bdb8267c2098c9))
* **cli:** address review feedback - JSDoc deno, unused import, wrapImport example ([335c2a8](https://github.com/okikio/astro-auto-adapter/commit/335c2a86c5d74161a9b4ca3e8fc3c2fc834e10fb))
* gate OCI attestation to published builds ([f8a3a1f](https://github.com/okikio/astro-auto-adapter/commit/f8a3a1f0190345c6748a91da4e35289599638290))
* **package.json:** add explicit types inside import/require export conditions ([ee5a330](https://github.com/okikio/astro-auto-adapter/commit/ee5a33004bc9860a9b5f5c77474ed90ab55f79ae))
* repair broken docker.yml step + update Node to v24 ([20dda54](https://github.com/okikio/astro-auto-adapter/commit/20dda546335094f2179f7ae0f64d164a2ecf73bd))
* repair docker build secret mount syntax ([ac5dc0a](https://github.com/okikio/astro-auto-adapter/commit/ac5dc0a25e70271c6365710165efeedb4e788de2))
* restore dual package output and explicit cli imports ([ce1f2dc](https://github.com/okikio/astro-auto-adapter/commit/ce1f2dcaf9c2631119304395de51b0e8e3033f7c))
* stabilize docker ci and switch package to esm ([17ad5d3](https://github.com/okikio/astro-auto-adapter/commit/17ad5d35f127af0cf71827e1fc847cfc753c8efd))
* use npm Trusted Publishers (OIDC) in release workflow instead of NPM_TOKEN ([a127bda](https://github.com/okikio/astro-auto-adapter/commit/a127bda49101ed44c0a75e810b744d153d7bacf6))
* validate OCI image builds on pull requests ([ce616b2](https://github.com/okikio/astro-auto-adapter/commit/ce616b2405c680be919c6c6a941ae47ebb4a5e9d))


### Features

* add interactive CLI using @clack/prompts (init/add/remove/list) ([e438d8d](https://github.com/okikio/astro-auto-adapter/commit/e438d8da2592c9d549bbedff684336ddfc513927))
* **cli:** extend package manager support to vlt and deno ([f946119](https://github.com/okikio/astro-auto-adapter/commit/f946119cc5c588f7fc486d48cd5a80aac0882f88))

## [2.4.1](https://github.com/okikio/astro-auto-adapter/compare/v2.4.0...v2.4.1) (2025-08-09)


### Bug Fixes

* publish the lib js files ([c3a03fb](https://github.com/okikio/astro-auto-adapter/commit/c3a03fbdbfdcc2aabccefca01b2ffea3dfdf8c99))

# [2.4.0](https://github.com/okikio/astro-auto-adapter/compare/v2.3.0...v2.4.0) (2025-08-05)


### Features

* add ability to register custom adapters ([ddb8af7](https://github.com/okikio/astro-auto-adapter/commit/ddb8af74651a1af675c50f085b2fdf17b8c75176))
* better types & better tests ([9a59be7](https://github.com/okikio/astro-auto-adapter/commit/9a59be7db19ffa776779c1bdd8152201c152f3c6))

# [2.3.0](https://github.com/okikio/astro-auto-adapter/compare/v2.2.0...v2.3.0) (2025-04-30)


### Features

* update deps for astro v5 ([f5c75b6](https://github.com/okikio/astro-auto-adapter/commit/f5c75b6d205f3713a4b9d12610f597f9304012db))

# [2.2.0](https://github.com/okikio/astro-auto-adapter/compare/v2.1.0...v2.2.0) (2024-06-25)


### Features

* switch to @deno/astro-adapter ([9f885b8](https://github.com/okikio/astro-auto-adapter/commit/9f885b8bdd2de2a4a2e9f482e270e8b172f6155b))

# [2.1.0](https://github.com/okikio/astro-auto-adapter/compare/v2.0.4...v2.1.0) (2024-01-26)


### Features

* support automatically selecting output mode ([faae4a2](https://github.com/okikio/astro-auto-adapter/commit/faae4a2515646ca6dd50cb3e773a3d5fed36241d))
* update deps... ([4c28f78](https://github.com/okikio/astro-auto-adapter/commit/4c28f786c5797e11cb5365d90c0a4adfedf937bc))

## [2.0.4](https://github.com/okikio/astro-auto-adapter/compare/v2.0.3...v2.0.4) (2023-10-09)


### Bug Fixes

* use Deno.env & Netlify.env for env ([34ee794](https://github.com/okikio/astro-auto-adapter/commit/34ee7940a8de66bae8a02f42fdd06293fb17cab5))

## [2.0.3](https://github.com/okikio/astro-auto-adapter/compare/v2.0.2...v2.0.3) (2023-10-09)


### Bug Fixes

* rename lib/index.mjs to lib/index.js ([e62d19a](https://github.com/okikio/astro-auto-adapter/commit/e62d19ae77aa6eb57b571d57aa074a81d70509d6))

## [2.0.2](https://github.com/okikio/astro-auto-adapter/compare/v2.0.1...v2.0.2) (2023-09-04)


### Bug Fixes

* deno using incorrect port ([8b4193a](https://github.com/okikio/astro-auto-adapter/commit/8b4193aaa859ae948e381c1a4e9110ab7eb8ef91))

## [2.0.1](https://github.com/okikio/astro-auto-adapter/compare/v2.0.0...v2.0.1) (2023-09-01)


### Bug Fixes

* update the peerDeps ([fcc3e88](https://github.com/okikio/astro-auto-adapter/commit/fcc3e88f4de55a7d132ccf071262f765d20b41e0))

# [2.0.0](https://github.com/okikio/astro-auto-adapter/compare/v1.0.0...v2.0.0) (2023-09-01)


* fix!: upgrade deps & deprecate netlify/vercel-edge ([3474669](https://github.com/okikio/astro-auto-adapter/commit/3474669535879b5bfd397e756dd659e3d394958b))


### BREAKING CHANGES

* deprecate vercel-edge & netlify-edge
> **Note**: You need to manually set the adapter if you want static for vercel & netlify

# 1.0.0 (2023-08-25)


### Bug Fixes

* fix jsdoc comment ([1bbf16b](https://github.com/okikio/astro-auto-adapter/commit/1bbf16b8c333d91cd4bdfde0b5701e3fa0a1e782))
* fix type issues w/ astro-auto-adapter ([eb36825](https://github.com/okikio/astro-auto-adapter/commit/eb368253e66dbb6a1f7a78574c89351ea2c90423))


* feat!: use adapter system env vars ([a84fb02](https://github.com/okikio/astro-auto-adapter/commit/a84fb0218188c3c071c22235b93049ff9d20a157))


### Features

* add cloudflare, node, deno, netlify vercel ([2197dbe](https://github.com/okikio/astro-auto-adapter/commit/2197dbe76f3b9e4bdd2a0c5627e67648ca394026))
* optional dependencies import ([2765372](https://github.com/okikio/astro-auto-adapter/commit/2765372707dde5fd0775f9a3652fef973bb9bc86))


### BREAKING CHANGES

* `astro-auto-adapter` now returns a promise which then returns the `AstroIntegration` e.g.

```ts
export default defineConfig({
  output: "server",
-  adapter: adapter(),
+  adapter: await adapter(),
  srcDir: "./example"
});
```
