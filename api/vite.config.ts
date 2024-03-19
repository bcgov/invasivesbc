import { defineConfig } from 'vite';

// sets up constants in the code, based on build environment
function buildSpecificDefines() {
  const defines = {};

  defines['CONFIGURATION_TEST'] = false;

  return defines;
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  test: {
    globals: true,
    environment: 'jsdom'
  },
  build: {
    outDir: '../dist',
    minify: false,
    sourcemap: false,
    rollupOptions: {
      plugins: [],
      output: {}
    }
  },
  define: {
    ...buildSpecificDefines()
  },
  plugins: [],
  optimizeDeps: {
    esbuildOptions: {
      plugins: []
    }
  },
  resolve: {}
});
