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
