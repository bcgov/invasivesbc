import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

import { viteSingleFile } from "vite-plugin-singlefile"
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill';

import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import inject from 'rollup-plugin-inject';

// sets up constants in the code, based on build environment
function buildSpecificDefines() {
  const defines = {};

  const isMobile = JSON.stringify('TRUE' === process.env.MOBILE);

  defines.ENABLE_JEEPSQLITE = JSON.stringify('TRUE' === process.env.JEEPSQLITE);
  defines.CONFIGURATION_IS_MOBILE = JSON.stringify(isMobile);

  if (process.env.CONFIGURATION_SOURCE === undefined || process.env.CONFIGURATION_SOURCE === 'Hardcoded') {
    const commitHash = require('child_process')
      .execSync('git rev-parse --short HEAD')
      .toString();

    defines.INJECTED_COMMIT_HASH = JSON.stringify(commitHash);
    defines.CONFIGURATION_SOURCE = JSON.stringify('Hardcoded');
  } else if (process.env.CONFIGURATION_SOURCE === 'Provided') {
    defines.CONFIGURATION_SOURCE = JSON.stringify('Provided');
    const commitHash = require('child_process')
      .execSync('git rev-parse --short HEAD')
      .toString();

    defines.INJECTED_COMMIT_HASH = JSON.stringify(commitHash);

    if (process.env['REDIRECT_URI'] === undefined) {
      throw new Error('Heads up -- at least one required env var is not defined. Did you setup your environment?');
    }

    defines.CONFIGURATION_API_BASE = JSON.stringify(process.env['REACT_APP_API_HOST']);
    defines.CONFIGURATION_KEYCLOAK_CLIENT_ID = JSON.stringify(process.env['SSO_CLIENT_ID']);
    defines.CONFIGURATION_KEYCLOAK_REALM = JSON.stringify(process.env['SSO_REALM']);
    defines.CONFIGURATION_KEYCLOAK_URL = JSON.stringify(process.env['SSO_URL']);
    defines.CONFIGURATION_REDIRECT_URI = JSON.stringify(process.env['REDIRECT_URI']);

    defines.CONFIGURATION_KEYCLOAK_ADAPTER = JSON.stringify(isMobile ? 'capacitor' : 'web');
  } else if (process.env.CONFIGURATION_SOURCE === 'Caddy') {
    defines.CONFIGURATION_SOURCE = JSON.stringify('Caddy');

    console.dir(process.env);

    if (process.env['OPENSHIFT_BUILD_COMMIT'] !== undefined) {
      console.log('Building in Openshift');
      defines.INJECTED_COMMIT_HASH = JSON.stringify(process.env['OPENSHIFT_BUILD_COMMIT']);
    } else if (process.env['SOURCE_GIT_COMMIT'] !== undefined) {
      defines.INJECTED_COMMIT_HASH = JSON.stringify(process.env['SOURCE_GIT_COMMIT']);
    } else {
      console.log('Using fallback commit hash');
      defines.INJECTED_COMMIT_HASH = JSON.stringify('local');
    }

  } else {
    throw new Error('Unrecognized CONFIGURATION_SOURCE environment variable -- please correct your configuration');
  }

  return defines;
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    // Relative to the root
    outDir: '../dist',
    minify: true,
    sourcemap: true,
    rollupOptions: {
      plugins: [
        rollupNodePolyFill(), viteSingleFile({ removeViteModuleLoader: true })
      ],

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
      include: '**/*.{jsx,tsx}'
    }),
    viteSingleFile()
  ],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  resolve: {
    alias: {
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      "@mui/styled-engine": "@mui/styled-engine-sc"
    }
  }
});
