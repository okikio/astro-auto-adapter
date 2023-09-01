import { type AstroUserConfig, defineConfig } from 'astro/config';
import { adapter } from "./src/index";

// https://astro.build/config
export default defineConfig({
  output: process?.env?.ASTRO_OUTPUT as AstroUserConfig['output'] || "server",
  adapter: await adapter(),
  srcDir: "./example"
});