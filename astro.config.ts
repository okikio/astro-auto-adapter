import { defineConfig } from 'astro/config';
import { adapter } from "./src/index.js";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: adapter(),
  srcDir: "./example"
});