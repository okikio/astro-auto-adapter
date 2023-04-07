import { defineConfig } from "vite";
import { umd as name } from "./package.json";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts()
  ],
  build: {
    outDir: "lib",
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      name,
      formats: ["es", "cjs", "umd"],
      fileName(format) {
        switch (format) {
          case "es":
            return "index.mjs";
          case "cjs":
            return "index.cjs";
          default:
            return "index.js";
        }
      },
    }, 
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        "@astrojs/cloudflare",
        "@astrojs/deno",
        "@astrojs/netlify",
        "@astrojs/node",
        "@astrojs/vercel/serverless",
        "@astrojs/vercel/edge",
        "astro"
      ],
    },
  },
});
