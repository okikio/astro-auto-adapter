import type { IAdapterOptions } from '../src/index.ts';

import { test } from 'vitest';
import { $ } from 'zx';

// Extract the keys to get the modes
const modes = Object.keys({
  cloudflare: {},
  deno: {},
  netlify: {},
  vercel: {},
  'netlify-static': undefined,
  'vercel-static': {},
  node: {},
} as IAdapterOptions);

// Run the test
test.for(modes)('Astro build for multiple adapter modes: %s', {
  timeout: 15_000
}, async (mode) => {
  // Set the environment variable
  process.env.ASTRO_ADAPTER_MODE = mode;

  // Run the build command
  try {
    const e = await $`astro build`;
    console.error('stdout:', e.stdout);
    console.log(`Build for ${mode} was successful.`);
  } catch (error: any) {  // Added 'any' type to error
    console.error(`Build for ${mode} failed.`);
    console.error('Error message:', error.message);
    console.error('stdout:', error.stdout);
    console.error('stderr:', error.stderr);
    throw error;
  }

  // Unset the environment variable
  delete process.env.ASTRO_ADAPTER_MODE;
});
