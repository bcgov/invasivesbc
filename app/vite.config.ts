import { execSync } from 'child_process';
import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// sets up constants in the code, based on the build environment
function buildSpecificDefines() {
  const defines = {};

  defines['minify'] = false;

  if (process.env.CONFIGURATION_SOURCE === 'Provided') {
    defines['CONFIGURATION_SOURCE'] = JSON.stringify('Provided');
    const commitHash = execSync('git rev-parse --short HEAD').toString();

    defines['INJECTED_COMMIT_HASH'] = JSON.stringify(commitHash);

    defines['CONFIGURATION_API_BASE'] = JSON.stringify(process.env['REACT_APP_API_HOST']);
    defines['CONFIGURATION_API_V2_BASE'] = JSON.stringify(process.env['API_V2_BASE']);
    defines['CONFIGURATION_KEYCLOAK_CLIENT_ID'] = JSON.stringify(process.env['SSO_CLIENT_ID']);
    defines['CONFIGURATION_KEYCLOAK_REALM'] = JSON.stringify(process.env['SSO_REALM']);
    defines['CONFIGURATION_KEYCLOAK_URL'] = JSON.stringify(process.env['SSO_URL']);
    defines['CONFIGURATION_REDIRECT_URI'] = JSON.stringify(process.env['REDIRECT_URI']);
    defines['CONFIGURATION_PUBLIC_MAP_URL'] = JSON.stringify(process.env['PUBLIC_MAP_URL']);
    defines['CONFIGURATION_SILENT_CHECK_URI'] = JSON.stringify(process.env['SILENT_CHECK_URI']);
    defines['CONFIGURATION_IOS_APP_STORE_URL'] = JSON.stringify(process.env['IOS_APP_STORE_URL']);
    defines['CONFIGURATION_ANDROID_APP_STORE_URL'] = JSON.stringify(process.env['ANDROID_APP_STORE_URL']);

    defines['CONFIGURATION_COMPONENTIZED_MAP'] = JSON.stringify(process.env['ENABLE_COMPONENTIZED_MAP']);
  } else if (process.env.CONFIGURATION_SOURCE === 'Caddy') {
    defines['minify'] = true;

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
    target: process.env['VITE_TARGET_PLATFORM'] === 'ios' ? 'ios26.4' : 'baseline-widely-available',

    rolldownOptions: {
      plugins: [...statsPlugin()],
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules/,
              name: 'vendor'
            },
            {
              test: /state\/configuration\/runtime-config/,
              name: 'configuration'
            },
            {
              test: /state\/configuration\/injected-features/,
              name: 'injected-features'
            }
          ]
        }
      }
    }
  },
  define: {
    ...buildSpecificDefines()
  },
  assetsInclude: ['**/*.tiff'],
  plugins: [
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: '**/*.{jsx,tsx}',
      ...reactDevOptions()
    })
  ],
  optimizeDeps: {},
  resolve: {
    alias: {},
    tsconfigPaths: true
  }
});
