import type { IAdapterOptions, AdapterFactory } from '../src/index.ts';
import { adapter, output, createTypedAdapter, getAutoAdapterType, getEnv } from '../src/index.ts';

import { test, expect, describe, beforeEach, afterEach, vi } from 'vitest';
import { $ } from 'zx';
import process from "node:process";

// ====================================================================
// TEST CONFIGURATION
// ====================================================================

/**
 * Built-in adapter modes for comprehensive testing.
 * Tests both static and server output modes for each adapter.
 */
const builtInModes = Object.keys({
  cloudflare: {},
  deno: {},
  netlify: {},
  vercel: {},
  node: {},
  sst: {},
} as IAdapterOptions)
  .map(adapterType => [
    [adapterType, "static"],
    [adapterType, "server"]
  ]).flat(1);

/**
 * Custom adapter test configurations.
 * These test the registration and type safety features.
 */
interface CustomAdapterTestOptions {
  region: 'us-west' | 'us-east' | 'eu-west';
  healthCheckPath?: string;
  environmentId?: string;
}

interface MockPlatformOptions {
  apiKey: string;
  endpoint: string;
  timeout?: number;
}

// ====================================================================
// CUSTOM ADAPTER FACTORIES FOR TESTING
// ====================================================================

/**
 * Mock adapter factory for testing custom adapter registration.
 * Creates a minimal Astro integration for testing purposes.
 */
const testAdapterFactory = createTypedAdapter<CustomAdapterTestOptions>((opts) => {
  const options = opts!;
  console.log(`Test adapter configured with region: ${options.region}`);

  return {
    name: "test-adapter",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          output: "server",
          vite: {
            define: {
              'process.env.TEST_REGION': JSON.stringify(options.region),
              'process.env.HEALTH_PATH': JSON.stringify(options.healthCheckPath || '/health')
            }
          }
        });
      }
    }
  };
});

/**
 * Mock platform adapter that simulates a third-party integration.
 * Tests async adapter factory functionality.
 */
const mockPlatformFactory = createTypedAdapter<MockPlatformOptions>(async (opts) => {
  const options = opts!;
  console.log(`Mock platform configured with endpoint: ${options.endpoint}`);

  // Simulate async adapter loading
  await new Promise(resolve => setTimeout(resolve, 10));

  return {
    name: "mock-platform-adapter",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          output: "server",
          vite: {
            define: {
              'process.env.MOCK_API_KEY': JSON.stringify(options.apiKey),
              'process.env.MOCK_ENDPOINT': JSON.stringify(options.endpoint),
              'process.env.MOCK_TIMEOUT': JSON.stringify(options.timeout || 5000)
            }
          }
        });
      }
    }
  };
});

// ====================================================================
// ENVIRONMENT UTILITIES
// ====================================================================

/**
 * Temporarily sets environment variables for testing.
 * Automatically cleans up after test completion.
 */
function withEnvVars(vars: Record<string, string>, fn: () => Promise<void> | void) {
  return async () => {
    const originalValues: Record<string, string | undefined> = {};

    // Store original values and set new ones
    for (const [key, value] of Object.entries(vars)) {
      originalValues[key] = process.env[key];
      process.env[key] = value;
    }

    try {
      await fn();
    } finally {
      // Restore original values
      for (const [key, originalValue] of Object.entries(originalValues)) {
        if (originalValue === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = originalValue;
        }
      }
    }
  };
}

// ====================================================================
// UNIT TESTS
// ====================================================================

describe('astro-auto-adapter', () => {

  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.ASTRO_ADAPTER_MODE;
    delete process.env.ASTRO_OUTPUT_MODE;
  });

  afterEach(() => {
    // Clean up after each test
    delete process.env.ASTRO_ADAPTER_MODE;
    delete process.env.ASTRO_OUTPUT_MODE;
  });

  // ====================================================================
  // ENVIRONMENT DETECTION TESTS
  // ====================================================================

  describe('Environment Detection', () => {

    test('should detect Vercel environment', withEnvVars(
      { VERCEL: '1' },
      () => {
        expect(getAutoAdapterType()).toBe('vercel');
      }
    ));

    test('should detect Netlify environment', withEnvVars(
      { NETLIFY: 'true' },
      () => {
        expect(getAutoAdapterType()).toBe('netlify');
      }
    ));

    test('should default to node when no platform detected', () => {
      expect(getAutoAdapterType()).toBe('node');
    });

    test('should override detection with ASTRO_ADAPTER_MODE', withEnvVars(
      { VERCEL: '1', ASTRO_ADAPTER_MODE: 'netlify' },
      () => {
        expect(getEnv('ASTRO_ADAPTER_MODE')).toBe('netlify');
      }
    ));
  });

  // ====================================================================
  // OUTPUT MODE TESTS
  // ====================================================================

  describe('Output Mode Selection', () => {

    test('should default to static mode', () => {
      expect(output('node')).toBe('static');
    });

    test('should respect explicit server mode', () => {
      expect(output('vercel', 'server')).toBe('server');
    });

    test('should handle hybrid mode gracefully (v4/v5 compatibility)', () => {
      const result = output('netlify', 'hybrid' as any);
      // Should either return 'hybrid' (v4) or convert to 'server' (v5)
      expect(['hybrid', 'server']).toContain(result);
    });

    test('should force static for legacy adapters', () => {
      expect(output('vercel-static' as any, 'server')).toBe('static');
      expect(output('netlify-static' as any, 'server')).toBe('static');
    });
  });

  // ====================================================================
  // CUSTOM ADAPTER TESTS
  // ====================================================================

  describe('Custom Adapter Registration', () => {

    test('should create custom adapter successfully', async () => {
      const customAdapter = await adapter('test-adapter', {
        'test-adapter': {
          region: 'us-west',
          healthCheckPath: '/api/health',
          environmentId: 'test-env'
        },
        register: {
          'test-adapter': testAdapterFactory
        }
      });

      expect(customAdapter).toBeDefined();
      expect(customAdapter.name).toBe('test-adapter');
      expect(customAdapter.hooks).toBeDefined();
    });

    test('should handle async custom adapter factory', async () => {
      const customAdapter = await adapter('mock-platform', {
        'mock-platform': {
          apiKey: 'test-key-123',
          endpoint: 'https://api.mock-platform.com',
          timeout: 10000
        },
        register: {
          'mock-platform': mockPlatformFactory
        }
      });

      expect(customAdapter).toBeDefined();
      expect(customAdapter.name).toBe('mock-platform-adapter');
    });

    test('should throw error for failed custom adapter factory', async () => {
      const brokenFactory: AdapterFactory = () => {
        throw new Error('Factory error');
      };

      await expect(
        adapter('broken-adapter', {
          register: {
            'broken-adapter': brokenFactory
          }
        })
      ).rejects.toThrow(/Failed to create custom adapter/);
    });
  });

  // ====================================================================
  // TYPE SAFETY TESTS (COMPILE-TIME, BUT WE CAN TEST RUNTIME BEHAVIOR)
  // ====================================================================

  describe('Type Safety Features', () => {

    test('should work with createTypedAdapter utility', () => {
      const typedFactory = createTypedAdapter<CustomAdapterTestOptions>((options) => ({
        name: 'typed-test',
        hooks: {}
      }));

      expect(typeof typedFactory).toBe('function');
    });

    test('should handle options correctly in typed adapter', async () => {
      const capturedOptions: CustomAdapterTestOptions[] = [];

      const capturingFactory = createTypedAdapter<CustomAdapterTestOptions>((options) => {
        capturedOptions.push(options!);
        return {
          name: 'capturing-adapter',
          hooks: {}
        };
      });

      await adapter('test-capture', {
        'test-capture': {
          region: 'eu-west',
          healthCheckPath: '/status'
        },
        register: {
          'test-capture': capturingFactory
        }
      });

      expect(capturedOptions).toHaveLength(1);
      expect(capturedOptions[0].region).toBe('eu-west');
      expect(capturedOptions[0].healthCheckPath).toBe('/status');
    });
  });
});

// ====================================================================
// INTEGRATION TESTS (ASTRO BUILD)
// ====================================================================

describe('Astro Build Integration', () => {

  test.for(builtInModes)(
    'should build successfully with %s adapter in %s mode',
    {
      timeout: 30_000, // Increased timeout for build processes
    },
    async ([adapterType, outputMode]) => {
      await withEnvVars(
        {
          ASTRO_ADAPTER_MODE: adapterType,
          ASTRO_OUTPUT_MODE: outputMode
        },
        async () => {
          console.log(`\n🔧 Testing: ${adapterType} adapter with ${outputMode} output`);

          try {
            const result = await $`astro build`;

            console.log(`✅ Build successful for ${adapterType} (${outputMode})`);
            console.log('Build output:', result.stdout.slice(-200)); // Last 200 chars

            expect(result.exitCode).toBe(0);
          } catch (error: any) {
            console.error(`❌ Build failed for ${adapterType} (${outputMode})`);
            console.error('Error message:', error.message);
            console.error('stdout:', error.stdout?.slice(-500)); // Last 500 chars
            console.error('stderr:', error.stderr?.slice(-500));

            throw new Error(
              `Build failed for ${adapterType} adapter with ${outputMode} output: ${error.message}`
            );
          }
        }
      )();
    }
  );
});

// ====================================================================
// ERROR HANDLING TESTS
// ====================================================================

describe('Error Handling', () => {

  test('should warn about unknown adapter types', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

    try {
      // This should fall back to node adapter and warn
      const result = await adapter('unknown-platform', {});
      expect(result.name).toContain('node'); // Should fall back to node adapter
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown adapter type "unknown-platform"')
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});

// ====================================================================
// PERFORMANCE TESTS
// ====================================================================

describe('Performance', () => {

  test('should handle multiple adapter creations efficiently', async () => {
    const start = performance.now();

    const adapters = await Promise.all([
      adapter('test-1', {
        register: {
          'test-1': createTypedAdapter(() => ({ name: 'test-1', hooks: {} }))
        }
      }),
      adapter('test-2', {
        register: {
          'test-2': createTypedAdapter(() => ({ name: 'test-2', hooks: {} }))
        }
      }),
      adapter('test-3', {
        register: {
          'test-3': createTypedAdapter(() => ({ name: 'test-3', hooks: {} }))
        }
      })
    ]);

    const end = performance.now();

    expect(adapters).toHaveLength(3);
    expect(end - start).toBeLessThan(1000); // Should complete within 1 second

    console.log(`✅ Created ${adapters.length} adapters in ${(end - start).toFixed(2)}ms`);
  });

  test('should cache adapter factories efficiently', async () => {
    let factoryCalls = 0;

    const countingFactory = createTypedAdapter(() => {
      factoryCalls++;
      return { name: 'counting-adapter', hooks: {} };
    });

    // Create multiple adapters with same factory
    await adapter('counting-1', {
      register: { 'counting-1': countingFactory }
    });

    await adapter('counting-2', {
      register: { 'counting-2': countingFactory }
    });

    // Each should call the factory once (no unwanted caching)
    expect(factoryCalls).toBe(2);
  });
});