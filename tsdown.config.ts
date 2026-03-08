import { defineConfig } from 'tsdown';

export default defineConfig([
  // ── Library bundle ────────────────────────────────────────────────────────
  // Pure-ESM + CJS dual build for the adapter selection API.
  // Marked platform-neutral so bundlers can tree-shake it for any runtime.
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    outDir: 'dist',
    platform: 'neutral',
    treeshake: true,
    rolldownOptions: {
      checks: {
        pluginTimings: false,
      },
    },
    outputOptions: {
      exports: 'named',
    },
  },

  // ── CLI bundle ────────────────────────────────────────────────────────────
  // Node-specific ESM bundle for the `astro-auto-adapter` binary.
  // We skip CJS because Node 22+ supports ESM natively for binaries.
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: true,
    outDir: 'dist',
    platform: 'node',
    treeshake: true,
    rolldownOptions: {
      checks: {
        pluginTimings: false,
      },
    },
    // The shebang in src/cli.ts is preserved automatically by tsdown.
  },
]);
