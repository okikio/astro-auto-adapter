// tests/custom-adapters.test.ts
import { adapter, createTypedAdapter } from '../src/index.ts';
import { test, expect, describe, vi } from 'vitest';

// ====================================================================
// CUSTOM ADAPTER TYPE DEFINITIONS
// ====================================================================

/**
 * Example Railway adapter options for testing type safety
 */
interface RailwayOptions {
  region: 'us-west' | 'us-east' | 'eu-west';
  healthCheckPath?: string;
  environmentId?: string;
  memory?: 512 | 1024 | 2048 | 4096;
}

/**
 * Example DigitalOcean adapter options
 */
interface DigitalOceanOptions {
  dropletSize: 's-1vcpu-1gb' | 's-2vcpu-2gb' | 's-4vcpu-8gb';
  region: 'nyc1' | 'sfo3' | 'fra1';
  enableBackups?: boolean;
  sshKeys?: string[];
}

/**
 * Example company-internal platform
 */
interface CompanyPlatformOptions {
  cluster: string;
  namespace: string;
  replicas?: number;
  resources?: {
    cpu: string;
    memory: string;
  };
}

// ====================================================================
// MOCK ADAPTER IMPLEMENTATIONS
// ====================================================================

/**
 * Railway adapter mock implementation
 */
const railwayAdapter = createTypedAdapter<RailwayOptions>(async (opts) => {
  const options = opts!;

  // Validate required options
  if (!options.region) {
    throw new Error('Railway adapter requires region to be specified');
  }

  console.log(`🚄 Railway adapter: Deploying to ${options.region}`);

  // Simulate Railway adapter package import
  await new Promise(resolve => setTimeout(resolve, 50));

  return {
    name: 'railway-adapter',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          output: 'server',
          vite: {
            define: {
              'process.env.RAILWAY_REGION': JSON.stringify(options.region),
              'process.env.RAILWAY_HEALTH_CHECK': JSON.stringify(options.healthCheckPath || '/health'),
              'process.env.RAILWAY_MEMORY': JSON.stringify(options.memory || 1024)
            }
          }
        });
      },
      'astro:build:done': () => {
        console.log(`✅ Railway deployment configured for ${options.region}`);
      }
    }
  };
});

/**
 * DigitalOcean adapter mock implementation
 */
const digitalOceanAdapter = createTypedAdapter<DigitalOceanOptions>((opts) => {
  const options = opts!;

  return {
    name: 'digitalocean-adapter',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          output: 'server',
          build: {
            serverEntry: 'digitalocean-entry.mjs'
          },
          vite: {
            define: {
              'process.env.DO_DROPLET_SIZE': JSON.stringify(options.dropletSize),
              'process.env.DO_REGION': JSON.stringify(options.region),
              'process.env.DO_BACKUPS': JSON.stringify(options.enableBackups || false)
            }
          }
        });
      }
    }
  };
});

/**
 * Company platform adapter for internal deployments
 */
const companyPlatformAdapter = createTypedAdapter<CompanyPlatformOptions>((opts) => {
  const options = opts!;

  return {
    name: 'company-platform-adapter',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          output: 'server',
          vite: {
            define: {
              'process.env.COMPANY_CLUSTER': JSON.stringify(options.cluster),
              'process.env.COMPANY_NAMESPACE': JSON.stringify(options.namespace),
              'process.env.COMPANY_REPLICAS': JSON.stringify(options.replicas || 1)
            }
          }
        });
      },
      'astro:config:done': (config) => {
        console.log(`🏢 Company platform: ${options.cluster}/${options.namespace}`);
      }
    }
  };
});

// ====================================================================
// CUSTOM ADAPTER TESTS
// ====================================================================

describe('Custom Adapter Registration', () => {

  test('should register and use Railway adapter successfully', async () => {
    const result = await adapter('railway', {
      railway: {
        region: 'us-west',
        healthCheckPath: '/api/health',
        environmentId: 'prod-123',
        memory: 2048
      },
      register: {
        railway: railwayAdapter,
        digitalocean: digitalOceanAdapter,
        'company-platform': companyPlatformAdapter
      }
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('railway-adapter');
    expect(result.hooks).toBeDefined();
    expect(result.hooks['astro:config:setup']).toBeTypeOf('function');
  });

  test('should register and use DigitalOcean adapter successfully', async () => {
    const result = await adapter('digitalocean', {
      digitalocean: {
        dropletSize: 's-2vcpu-2gb',
        region: 'nyc1',
        enableBackups: true,
        sshKeys: ['ssh-key-1', 'ssh-key-2']
      },
      register: {
        railway: railwayAdapter,
        digitalocean: digitalOceanAdapter,
        'company-platform': companyPlatformAdapter
      }
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('digitalocean-adapter');
  });

  test('should handle company platform adapter with minimal config', async () => {
    const result = await adapter('company-platform', {
      'company-platform': {
        cluster: 'production-cluster',
        namespace: 'web-apps'
        // replicas and resources are optional
      },
      register: {
        railway: railwayAdapter,
        digitalocean: digitalOceanAdapter,
        'company-platform': companyPlatformAdapter
      }
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('company-platform-adapter');
  });

  test('should validate required options in custom adapters', async () => {
    await expect(
      adapter('railway', {
        // @ts-expect-error Missing required 'region' field
        railway: {
          // Missing required 'region' field
          healthCheckPath: '/health'
        } ,
        register: {
          railway: railwayAdapter,
          digitalocean: digitalOceanAdapter,
          'company-platform': companyPlatformAdapter
        }
      })
    ).rejects.toThrow('Railway adapter requires region to be specified');
  });
});

// ====================================================================
// TYPE SAFETY TESTS
// ====================================================================

describe('Type Safety Features', () => {

  test('should enforce type constraints at runtime where possible', async () => {
    // This tests that the adapter factory receives correctly typed options
    let capturedOptions: RailwayOptions | undefined;

    const capturingAdapter = createTypedAdapter<RailwayOptions>((options) => {
      capturedOptions = options;
      return {
        name: 'capturing-adapter',
        hooks: {}
      };
    });

    await adapter('railway', {
      railway: {
        region: 'eu-west',
        healthCheckPath: '/status',
        memory: 4096
      },
      register: {
        railway: capturingAdapter,
        digitalocean: digitalOceanAdapter,
        'company-platform': companyPlatformAdapter
      }
    });

    expect(capturedOptions).toBeDefined();
    expect(capturedOptions!.region).toBe('eu-west');
    expect(capturedOptions!.healthCheckPath).toBe('/status');
    expect(capturedOptions!.memory).toBe(4096);
  });

  test('should handle optional properties correctly', async () => {
    let capturedOptions: DigitalOceanOptions | undefined;

    const capturingAdapter = createTypedAdapter<DigitalOceanOptions>((options) => {
      capturedOptions = options;
      return {
        name: 'capturing-do-adapter',
        hooks: {}
      };
    });

    await adapter('digitalocean', {
      digitalocean: {
        dropletSize: 's-1vcpu-1gb',
        region: 'sfo3'
        // enableBackups and sshKeys are optional
      },
      register: {
        railway: railwayAdapter,
        digitalocean: capturingAdapter,
        'company-platform': companyPlatformAdapter
      }
    });

    expect(capturedOptions).toBeDefined();
    expect(capturedOptions!.dropletSize).toBe('s-1vcpu-1gb');
    expect(capturedOptions!.region).toBe('sfo3');
    expect(capturedOptions!.enableBackups).toBeUndefined();
    expect(capturedOptions!.sshKeys).toBeUndefined();
  });

  test('should work with createTypedAdapter utility', () => {
    const typedFactory = createTypedAdapter<RailwayOptions>((options) => ({
      name: 'test-typed-adapter',
      hooks: {}
    }));

    expect(typeof typedFactory).toBe('function');
    expect(typedFactory.name).toBe(''); // Anonymous function
  });
});

// ====================================================================
// ERROR HANDLING TESTS
// ====================================================================

describe('Custom Adapter Error Handling', () => {

  test('should handle adapter factory errors gracefully', async () => {
    const errorFactory = createTypedAdapter<RailwayOptions>(() => {
      throw new Error('Simulated adapter factory error');
    });

    await expect(
      adapter('railway', {
        railway: {
          region: 'us-west'
        },
        register: {
          railway: errorFactory,
          digitalocean: digitalOceanAdapter,
          'company-platform': companyPlatformAdapter
        }
      })
    ).rejects.toThrow(/Failed to create custom adapter "railway"/);
  });

  test('should handle async adapter factory errors', async () => {
    const asyncErrorFactory = createTypedAdapter<RailwayOptions>(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      throw new Error('Async adapter factory error');
    });

    await expect(
      adapter('railway', {
        railway: {
          region: 'us-west'
        },
        register: {
          railway: asyncErrorFactory,
          digitalocean: digitalOceanAdapter,
          'company-platform': companyPlatformAdapter
        }
      })
    ).rejects.toThrow(/Failed to create custom adapter "railway"/);
  });
});

// ====================================================================
// INTEGRATION SCENARIOS
// ====================================================================

describe('Real-World Integration Scenarios', () => {

  test('should handle multi-environment Railway configuration', async () => {
    const environments = ['development', 'staging', 'production'];

    for (const env of environments) {
      const result = await adapter('railway', {
        railway: {
          region: env === 'production' ? 'us-east' : 'us-west',
          healthCheckPath: '/health',
          environmentId: `${env}-env`,
          memory: env === 'production' ? 4096 : 1024
        },
        register: {
          railway: railwayAdapter,
          digitalocean: digitalOceanAdapter,
          'company-platform': companyPlatformAdapter
        }
      });

      expect(result.name).toBe('railway-adapter');
    }
  });

  test('should handle company platform with resource constraints', async () => {
    const result = await adapter('company-platform', {
      'company-platform': {
        cluster: 'production-cluster',
        namespace: 'high-traffic-apps',
        replicas: 3,
        resources: {
          cpu: '2000m',
          memory: '4Gi'
        }
      },
      register: {
        railway: railwayAdapter,
        digitalocean: digitalOceanAdapter,
        'company-platform': companyPlatformAdapter
      }
    });

    expect(result.name).toBe('company-platform-adapter');
  });

  test('should handle switching between adapters based on environment', async () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const adapterType = isDevelopment ? 'railway' : 'digitalocean';

    const result = await adapter(adapterType, {
      railway: {
        region: 'us-west',
        memory: 1024
      },
      digitalocean: {
        dropletSize: 's-4vcpu-8gb',
        region: 'nyc1',
        enableBackups: true
      },
      register: {
        railway: railwayAdapter,
        digitalocean: digitalOceanAdapter,
        'company-platform': companyPlatformAdapter
      }
    });

    expect(result).toBeDefined();
    expect(['railway-adapter', 'digitalocean-adapter']).toContain(result.name);
  });
});

// ====================================================================
// PERFORMANCE TESTS FOR CUSTOM ADAPTERS
// ====================================================================

describe('Custom Adapter Performance', () => {

  test('should handle rapid adapter creation efficiently', async () => {
    const start = performance.now();

    const promises = Array.from({ length: 10 }, (_, i) =>
      adapter('railway', {
        railway: {
          region: 'us-west',
          environmentId: `test-${i}`
        },
        register: {
          railway: railwayAdapter,
          digitalocean: digitalOceanAdapter,
          'company-platform': companyPlatformAdapter
        }
      })
    );

    const results = await Promise.all(promises);
    const end = performance.now();

    expect(results).toHaveLength(10);
    expect(results.every(r => r.name === 'railway-adapter')).toBe(true);
    expect(end - start).toBeLessThan(2000); // Should complete within 2 seconds

    console.log(`⚡ Created ${results.length} custom adapters in ${(end - start).toFixed(2)}ms`);
  });

  test('should handle concurrent different adapter types', async () => {
    const start = performance.now();

    const results = await Promise.all([
      adapter('railway', {
        railway: { region: 'us-west' },
        register: { railway: railwayAdapter, digitalocean: digitalOceanAdapter, 'company-platform': companyPlatformAdapter }
      }),
      adapter('digitalocean', {
        digitalocean: { dropletSize: 's-1vcpu-1gb', region: 'nyc1' },
        register: { railway: railwayAdapter, digitalocean: digitalOceanAdapter, 'company-platform': companyPlatformAdapter }
      }),
      adapter('company-platform', {
        'company-platform': { cluster: 'test', namespace: 'apps' },
        register: { railway: railwayAdapter, digitalocean: digitalOceanAdapter, 'company-platform': companyPlatformAdapter }
      })
    ]);

    const end = performance.now();

    expect(results).toHaveLength(3);
    expect(results[0].name).toBe('railway-adapter');
    expect(results[1].name).toBe('digitalocean-adapter');
    expect(results[2].name).toBe('company-platform-adapter');

    console.log(`🚀 Created 3 different custom adapters concurrently in ${(end - start).toFixed(2)}ms`);
  });
});