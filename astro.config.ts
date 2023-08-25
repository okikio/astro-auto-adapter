import { defineConfig } from 'astro/config';
import { adapter } from "./src/index";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: await adapter(),
  srcDir: "./example"
});