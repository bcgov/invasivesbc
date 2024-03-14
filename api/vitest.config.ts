import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig,
    defineConfig({
      test: {
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json-summary', 'json'],
          reportOnFailure: true
        },
        deps: {
          optimizer: {}
        }
      },
      define: { CONFIGURATION_TEST: true }
    })
  )
);
