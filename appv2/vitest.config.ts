import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig,
    defineConfig({
      test: {
        exclude: ['packages/template/*'],
        setupFiles: ['./src/setupTests.ts']
      },
      define: { CONFIGURATION_TEST: true }
    })
  )
);
