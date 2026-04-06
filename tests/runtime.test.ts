import { spawn } from 'node:child_process';
import process from 'node:process';
import { describe, test } from 'vitest';

const builtInModes = [
  ['cloudflare', 'static'],
  ['cloudflare', 'server'],
  ['deno', 'static'],
  ['deno', 'server'],
  ['netlify', 'static'],
  ['netlify', 'server'],
  ['vercel', 'static'],
  ['vercel', 'server'],
  ['node', 'static'],
  ['node', 'server'],
  ['sst', 'static'],
  ['sst', 'server'],
] as const;

const unsupportedRuntimeModes = new Map<string, string>([
  [
    'sst:server',
    'astro-sst 3.1.4 is not compatible with Astro 6 server entrypoints yet.',
  ],
]);

type AdapterType = (typeof builtInModes)[number][0];
type OutputMode = (typeof builtInModes)[number][1];
type CommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

function parseFilter(name: string): Set<string> | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  return new Set(raw.split(',').map((part) => part.trim()).filter(Boolean));
}

function withEnvVars(vars: Record<string, string>, fn: () => Promise<void> | void) {
  return async () => {
    const originalValues: Record<string, string | undefined> = {};

    for (const [key, value] of Object.entries(vars)) {
      originalValues[key] = process.env[key];
      process.env[key] = value;
    }

    try {
      await fn();
    } finally {
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

function runAstroBuild(): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('astro', ['build'], {
      cwd: process.cwd(),
      env: process.env,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');

    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({
        exitCode: code ?? -1,
        stdout,
        stderr,
      });
    });
  });
}

const adapterFilter = parseFilter('ASTRO_AUTO_ADAPTER_TEST_ADAPTERS');
const outputModeFilter = parseFilter('ASTRO_AUTO_ADAPTER_TEST_OUTPUT_MODES');

const selectedModes = builtInModes.filter(([adapterType, outputMode]) => {
  const adapterMatches = !adapterFilter || adapterFilter.has(adapterType);
  const outputMatches = !outputModeFilter || outputModeFilter.has(outputMode);
  return adapterMatches && outputMatches;
});

if (selectedModes.length === 0) {
  throw new Error(
    'No runtime integration cases matched ASTRO_AUTO_ADAPTER_TEST_ADAPTERS/ASTRO_AUTO_ADAPTER_TEST_OUTPUT_MODES.'
  );
}

describe('Astro Build Integration', () => {
  for (const [adapterType, outputMode] of selectedModes) {
    const testName = `should build successfully with ${adapterType} adapter in ${outputMode} mode`;
    const unsupportedReason = unsupportedRuntimeModes.get(`${adapterType}:${outputMode}`);
    const runtimeTest = unsupportedReason ? test.skip : test;

    runtimeTest(
      testName,
      {
        timeout: 30_000,
      },
      async () => {
        await withEnvVars(
          {
            ASTRO_ADAPTER_MODE: adapterType,
            ASTRO_OUTPUT_MODE: outputMode,
          },
          async () => {
            console.log(`\n🔧 Testing: ${adapterType} adapter with ${outputMode} output`);

            const result = await runAstroBuild();

            if (result.exitCode !== 0) {
              console.error(`❌ Build failed for ${adapterType} (${outputMode})`);
              console.error('stdout:', result.stdout.slice(-500));
              console.error('stderr:', result.stderr.slice(-500));

              throw new Error(
                `Build failed for ${adapterType} adapter with ${outputMode} output (exit code ${result.exitCode})`
              );
            }

            console.log(`✅ Build successful for ${adapterType} (${outputMode})`);
            console.log('Build output:', result.stdout.slice(-200));
          }
        )();
      }
    );
  }
});