import { defineConfig } from 'tsup';

export default defineConfig({
  target: ["es2024", "node24"],
  entry: ['src/index.ts'],
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  dts: true,
  outDir: "dist",
})