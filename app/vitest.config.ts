import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig(() =>
  mergeConfig(
    viteConfig,
    defineConfig({
      test: {
        environment: 'jsdom',
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json-summary', 'json'],
          reportOnFailure: true
        },
        globals: true,
        exclude: ['packages/template/*'],
        setupFiles: ['./src/test/setupTests.ts'],
        deps: {
          moduleDirectories: ['node_modules'],
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
