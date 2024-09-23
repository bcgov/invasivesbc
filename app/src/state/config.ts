interface AppConfig {
  API_BASE: string;

  COMMIT_HASH: string;

  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_URL: string;

  REDIRECT_URI: string;
  SILENT_CHECK_URI: string;

  PUBLIC_MAP_URL: string;
  IAPP_GEOJSON_URL: string;

  // to easily disable features not ready for prod-use (or disable them on mobile/web)
  FEATURE_GATE: {
    PLAN_MY_TRIP: boolean;
    EMBEDDED_REPORTS: boolean;
    BATCH: boolean;
  };
}

/* global CONFIGURATION_SOURCE */
declare global {
  const CONFIGURATION_SOURCE: string;
  const CONFIGURATION_API_BASE: string | null;
  const CONFIGURATION_KEYCLOAK_CLIENT_ID: string | null;
  const CONFIGURATION_KEYCLOAK_REALM: string | null;
  const CONFIGURATION_KEYCLOAK_URL: string | null;
  const CONFIGURATION_REDIRECT_URI: string | null;
  const CONFIGURATION_SILENT_CHECK_URI: string | null;
  const CONFIGURATION_PUBLIC_MAP_URL: string | null;
  const INJECTED_COMMIT_HASH: string | null;
  const CONFIGURATION_IAPP_GEOJSON_URL: string | null;
}

let CONFIG: AppConfig;

switch (CONFIGURATION_SOURCE) {
  case 'Caddy':
    CONFIG = {
      COMMIT_HASH: INJECTED_COMMIT_HASH && INJECTED_COMMIT_HASH.length > 0 ? INJECTED_COMMIT_HASH : 'unknown',
      API_BASE: '{{env "API_BASE"}}',
      KEYCLOAK_CLIENT_ID: '{{env "KEYCLOAK_CLIENT_ID"}}',
      KEYCLOAK_REALM: '{{env "KEYCLOAK_REALM"}}',
      KEYCLOAK_URL: '{{env "KEYCLOAK_URL"}}',
      REDIRECT_URI: '{{env "REDIRECT_URI"}}',
      PUBLIC_MAP_URL: '{{env "PUBLIC_MAP_URL"}}',
      IAPP_GEOJSON_URL: '{{env "IAPP_GEOJSON_URL"}}',
      SILENT_CHECK_URI: '{{env "SILENT_CHECK_URI"}}',
      FEATURE_GATE: {
        PLAN_MY_TRIP: true,
        EMBEDDED_REPORTS: true,
        BATCH: '{{env "FEATURE_GATE_BATCH_ENABLED"}}'.toLowerCase() === 'true'
      }
    };
    break;
  case 'Provided':
    CONFIG = {
      COMMIT_HASH: INJECTED_COMMIT_HASH && INJECTED_COMMIT_HASH.length > 0 ? INJECTED_COMMIT_HASH : 'unknown',
      API_BASE: CONFIGURATION_API_BASE || 'unset',
      KEYCLOAK_CLIENT_ID: CONFIGURATION_KEYCLOAK_CLIENT_ID || 'unset',
      KEYCLOAK_REALM: CONFIGURATION_KEYCLOAK_REALM || 'unset',
      KEYCLOAK_URL: CONFIGURATION_KEYCLOAK_URL || 'unset',
      REDIRECT_URI: CONFIGURATION_REDIRECT_URI || 'unset',
      PUBLIC_MAP_URL: CONFIGURATION_PUBLIC_MAP_URL || 'unset',
      SILENT_CHECK_URI: CONFIGURATION_SILENT_CHECK_URI || 'unset',
      IAPP_GEOJSON_URL: CONFIGURATION_IAPP_GEOJSON_URL || 'unset',
      FEATURE_GATE: {
        PLAN_MY_TRIP: true,
        EMBEDDED_REPORTS: true,
        BATCH: true
      }
    };
    break;
  default:
    throw new Error('unconfigured');
}

export { CONFIG };
export type { AppConfig };

