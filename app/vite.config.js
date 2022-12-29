import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// sets up constants in the code, based on build environment
function buildSpecificDefines() {
  const defines = {};

  const isMobile = JSON.stringify('TRUE' === process.env.MOBILE);

  defines.ENABLE_JEEPSQLITE = JSON.stringify('TRUE' === process.env.JEEPSQLITE);
  defines.CONFIGURATION_IS_MOBILE = JSON.stringify(isMobile);

  if (process.env.CONFIGURATION_SOURCE === undefined || process.env.CONFIGURATION_SOURCE === 'Hardcoded') {
    defines.CONFIGURATION_SOURCE = JSON.stringify('Hardcoded');
  } else if (process.env.CONFIGURATION_SOURCE === 'Provided') {
    defines.CONFIGURATION_SOURCE = JSON.stringify('Provided');

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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return "vendor"
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
      include: '**/*.{jsx,tsx}'
    })
  ],
  resolve: {
    alias: {
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream'
    }
  }
});
