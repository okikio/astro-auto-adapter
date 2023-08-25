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
