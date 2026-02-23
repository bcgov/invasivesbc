interface AppConfig {
  API_BASE: string;
  API_V2_BASE: string;

  COMMIT_HASH: string;

  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_URL: string;

  REDIRECT_URI: string;
  SILENT_CHECK_URI: string;

  PUBLIC_MAP_URL: string;
  IOS_APP_STORE_URL: string;
  ANDROID_APP_STORE_URL: string;
}

/* global CONFIGURATION_SOURCE */
declare global {
  const CONFIGURATION_SOURCE: string;
  const CONFIGURATION_API_BASE: string | null;
  const CONFIGURATION_API_V2_BASE: string | null;
  const CONFIGURATION_KEYCLOAK_CLIENT_ID: string | null;
  const CONFIGURATION_KEYCLOAK_REALM: string | null;
  const CONFIGURATION_KEYCLOAK_URL: string | null;
  const CONFIGURATION_REDIRECT_URI: string | null;
  const CONFIGURATION_SILENT_CHECK_URI: string | null;
  const CONFIGURATION_IOS_APP_STORE_URL: string | null;
  const CONFIGURATION_ANDROID_APP_STORE_URL: string | null;
  const CONFIGURATION_PUBLIC_MAP_URL: string | null;
  const INJECTED_COMMIT_HASH: string | null;
}

let runtimeConfig: AppConfig;

switch (CONFIGURATION_SOURCE) {
  case 'Caddy':
    runtimeConfig = {
      COMMIT_HASH: INJECTED_COMMIT_HASH && INJECTED_COMMIT_HASH.length > 0 ? INJECTED_COMMIT_HASH : 'unknown',
      API_BASE: '{{env "API_BASE"}}',
      API_V2_BASE: '{{env "API_V2_BASE"}}',
      KEYCLOAK_CLIENT_ID: '{{env "KEYCLOAK_CLIENT_ID"}}',
      KEYCLOAK_REALM: '{{env "KEYCLOAK_REALM"}}',
      KEYCLOAK_URL: '{{env "KEYCLOAK_URL"}}',
      REDIRECT_URI: '{{env "REDIRECT_URI"}}',
      PUBLIC_MAP_URL: '{{env "PUBLIC_MAP_URL"}}',
      SILENT_CHECK_URI: '{{env "SILENT_CHECK_URI"}}',
      IOS_APP_STORE_URL: '{{env "IOS_APP_STORE_URL"}}',
      ANDROID_APP_STORE_URL: '{{env "ANDROID_APP_STORE_URL"}}'
    };
    break;
  case 'Provided':
    runtimeConfig = {
      COMMIT_HASH: INJECTED_COMMIT_HASH && INJECTED_COMMIT_HASH.length > 0 ? INJECTED_COMMIT_HASH : 'unknown',
      API_V2_BASE: CONFIGURATION_API_V2_BASE || 'unset',
      API_BASE: CONFIGURATION_API_BASE || 'unset',
      KEYCLOAK_CLIENT_ID: CONFIGURATION_KEYCLOAK_CLIENT_ID || 'unset',
      KEYCLOAK_REALM: CONFIGURATION_KEYCLOAK_REALM || 'unset',
      KEYCLOAK_URL: CONFIGURATION_KEYCLOAK_URL || 'unset',
      REDIRECT_URI: CONFIGURATION_REDIRECT_URI || 'unset',
      PUBLIC_MAP_URL: CONFIGURATION_PUBLIC_MAP_URL || 'unset',
      SILENT_CHECK_URI: CONFIGURATION_SILENT_CHECK_URI || 'unset',
      IOS_APP_STORE_URL: CONFIGURATION_IOS_APP_STORE_URL || 'unset',
      ANDROID_APP_STORE_URL: CONFIGURATION_ANDROID_APP_STORE_URL || 'unset'
    };
    break;
  default:
    throw new Error('unconfigured');
}

export { runtimeConfig };
export type { AppConfig };
