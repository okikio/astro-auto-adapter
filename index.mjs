
// import { adapter, type NodeAdapterOptions } from "astro-auto-adapter";

/** @type {import('./src/index.js').NodeAdapterOptions} */
const options = {
  // Configuration options go here
};

const astroAdapter = adapter("node", { node: options });