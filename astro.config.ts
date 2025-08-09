import { defineConfig } from 'astro/config';
import { adapter, output } from "./src/index.ts";

// https://astro.build/config
export default defineConfig({
  output: output(),
  adapter: await adapter(),
  srcDir: "./example",
  outDir: "./test-astro-dist"
});