import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
import path from 'node:path';

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig,
    defineConfig({
      test: {
        exclude: ['packages/template/*'],
        setupFiles: ['./src/setupTests.ts'],
        deps: {
          optimizer: {
            ssr: {
              enabled: true,
              include: ['openapi-sampler']
            }
          }
        }
      },
      define: { CONFIGURATION_TEST: true }
    })
  )
);
