import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  platform: 'neutral',
  treeshake: true,
  outputOptions: {
    exports: 'named',
  },
});
