import { defineConfig } from 'astro/config';
import { adapter, output } from "./src/index";

// https://astro.build/config
export default defineConfig({
  output: output(),
  adapter: await adapter(),
  srcDir: "./example"
});