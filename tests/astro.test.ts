import { test } from 'vitest';
import { execa } from 'execa';  // Removed the curly braces around execa
import type { IAdapterOptions } from '../src';

// Extract the keys to get the modes
const modes = Object.keys({
  cloudflare: {},
  deno: {},
  netlify: {},
  'netlify-static': {},
  vercel: {},
  'vercel-static': {},
  node: {},
}) as (keyof IAdapterOptions)[];

// Run the test
test.each(modes)('Astro build for multiple adapter modes: %s', async (mode) => {
  // Set the environment variable
  process.env.ASTRO_ADAPTER_MODE = mode;
  process.env.ASTRO_OUTPUT = /static/.test(mode) ? "static" : "server";

  // Run the build command
  try {
    const e = await execa('astro', ['build']);
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
  delete process.env.ASTRO_OUTPUT;
}, {
  timeout: 9000
});