// tests/setup.ts - Test setup file
import { beforeAll, afterAll } from 'vitest';
import process from 'node:process';

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting astro-auto-adapter test suite...');

  // Ensure we're in test environment
  process.env.NODE_ENV = 'test';

  // Set test-specific configurations
  process.env.CI = 'true'; // Disable interactive prompts
});

afterAll(() => {
  console.log('✅ Test suite completed');

  // Clean up any remaining environment variables
  const testEnvVars = [
    'ASTRO_ADAPTER_MODE',
    'ASTRO_OUTPUT_MODE',
    'VERCEL',
    'NETLIFY',
    'NODE_ENV'
  ];

  testEnvVars.forEach(key => {
    if (process.env[key] === 'test' || key.startsWith('ASTRO_')) {
      delete process.env[key];
    }
  });
});
