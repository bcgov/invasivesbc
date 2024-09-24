import { execSync } from 'child_process';
import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// sets up constants in the code, based on build environment
function buildSpecificDefines() {
  const defines = {};

  defines['minify'] = false;

  if (process.env.CONFIGURATION_SOURCE === 'Provided') {
    defines['CONFIGURATION_SOURCE'] = JSON.stringify('Provided');
    const commitHash = execSync('git rev-parse --short HEAD').toString();

    defines['INJECTED_COMMIT_HASH'] = JSON.stringify(commitHash);

    if (process.env['IAPP_GEOJSON_URL'] === undefined) {
      throw new Error('Heads up -- at least one required env var is not defined. Did you setup your environment?');
    }

    defines['CONFIGURATION_API_BASE'] = JSON.stringify(process.env['REACT_APP_API_HOST']);
    defines['CONFIGURATION_KEYCLOAK_CLIENT_ID'] = JSON.stringify(process.env['SSO_CLIENT_ID']);
    defines['CONFIGURATION_KEYCLOAK_REALM'] = JSON.stringify(process.env['SSO_REALM']);
    defines['CONFIGURATION_KEYCLOAK_URL'] = JSON.stringify(process.env['SSO_URL']);
    defines['CONFIGURATION_REDIRECT_URI'] = JSON.stringify(process.env['REDIRECT_URI']);
    defines['CONFIGURATION_PUBLIC_MAP_URL'] = JSON.stringify(process.env['PUBLIC_MAP_URL']);
    defines['CONFIGURATION_IAPP_GEOJSON_URL'] = JSON.stringify(process.env['IAPP_GEOJSON_URL']);
    defines['CONFIGURATION_SILENT_CHECK_URI'] = JSON.stringify(process.env['SILENT_CHECK_URI']);
  } else if (process.env.CONFIGURATION_SOURCE === 'Caddy') {
    defines['minify'] = false;

    defines['CONFIGURATION_SOURCE'] = JSON.stringify('Caddy');

    if (process.env['OPENSHIFT_BUILD_COMMIT'] !== undefined) {
      defines['INJECTED_COMMIT_HASH'] = JSON.stringify(process.env['OPENSHIFT_BUILD_COMMIT']);
    } else if (process.env['SOURCE_GIT_COMMIT'] !== undefined) {
      defines['INJECTED_COMMIT_HASH'] = JSON.stringify(process.env['SOURCE_GIT_COMMIT']);
    } else {
      defines['INJECTED_COMMIT_HASH'] = JSON.stringify('local');
    }
  } else {
    throw new Error('Unrecognized CONFIGURATION_SOURCE environment variable -- please correct your configuration');
  }

  return defines;
}

function reactDevOptions() {
  if (process.env['ENABLE_WDYR'] && process.env['ENABLE_WDYR'].toLowerCase() === 'true') {
    return { jsxImportSource: '@welldone-software/why-did-you-render' };
  }
  return {};
}

function statsPlugin() {
  if (process.env['ENABLE_STATS'] && process.env['ENABLE_STATS'].toLowerCase() === 'true') {
    return [
      visualizer({
        template: 'flamegraph',
        emitFile: true,
        filename: 'bundle-stats.html'
      }) as PluginOption
    ];
  }
  return [];
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
    minify: buildSpecificDefines()['minify'],
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
      plugins: [rollupNodePolyFill() as PluginOption, ...statsPlugin()],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('state/config')) {
            return 'configuration';
          }
        }
      }
    }
  },
  define: {
    ...buildSpecificDefines()
  },
  assetsInclude: ['**/*.tiff'],
  plugins: [
    tsconfigPaths(),
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: '**/*.{jsx,tsx}',
      ...reactDevOptions()
    }),
    VitePWA({
      srcDir: '.',
      filename: 'worker.ts',
      strategies: 'injectManifest',
      injectRegister: false,
      //manifest: true,
      injectManifest: {
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,svg,gif,png,jpg}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [NodeModulesPolyfillPlugin()]
    }
  },
  resolve: {
    alias: {
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream'
    }
  }
});
