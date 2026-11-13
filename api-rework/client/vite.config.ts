import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    // Relative to the root
    outDir: '../dist',
    minify: 'oxc',
    sourcemap: true,
    cssCodeSplit: false,

    rolldownOptions: {
      plugins: [],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('configuration')) {
            return 'configuration';
          }
        }
      }
    }
  },
  plugins: [],
  optimizeDeps: {},
  resolve: {
    alias: {},
    tsconfigPaths: true
  }
});
