import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

function reactDevOptions() {
  return {};
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  test: {
    globals: true,
    environment: 'jsdom'
  },
  build: {
    // Relative to the root
    outDir: '../dist',
    minify: true,
    sourcemap: true,
    cssCodeSplit: false,

    rollupOptions: {
      onLog(level, log, handler) {
        // @ts-ignore
        if (log.cause && log.cause.message === `Can't resolve original location of error.`) {
          return;
        }
        handler(level, log);
      },
      plugins: [],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  plugins: [
    tsconfigPaths(),
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: '**/*.{jsx,tsx}',
      ...reactDevOptions()
    })
  ],
  optimizeDeps: {
    esbuildOptions: {}
  },
  resolve: {
    alias: {}
  }
});
