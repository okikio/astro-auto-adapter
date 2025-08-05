// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable global test APIs (describe, test, expect, etc.)
    globals: true,
    
    // Test environment
    environment: 'node',
    
    // Test timeout for integration tests
    testTimeout: 30_000,
    
    // Include patterns
    include: ['tests/**/*.test.ts', 'tests/**/*.test.js'],
    
    // Exclude patterns
    exclude: ['node_modules', 'dist', 'build'],
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    },
    
    // Reporter options
    reporters: ['verbose', 'json'],
    
    // Retry failed tests
    retry: 1,
    
    // Run tests sequentially for integration tests
    // (since they modify environment variables)
    pool: 'forks',
    maxConcurrency: 1
  }
});
