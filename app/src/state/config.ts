export interface AppConfig {
  DEBUG: boolean;
  MOBILE: boolean;

  API_BASE: string;

  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_URL: string;
  KEYCLOAK_ADAPTER: string;

  REDIRECT_URI: string;
}

/* global CONFIGURATION_SOURCE */
declare global {
  const CONFIGURATION_SOURCE: string;
  const CONFIGURATION_API_BASE: string | null;
  const CONFIGURATION_KEYCLOAK_CLIENT_ID: string | null;
  const CONFIGURATION_KEYCLOAK_REALM: string | null;
  const CONFIGURATION_KEYCLOAK_URL: string | null;
  const CONFIGURATION_KEYCLOAK_ADAPTER: string | null;
  const CONFIGURATION_REDIRECT_URI: string | null;
  const CONFIGURATION_IS_MOBILE: string | null;
}

let CONFIG: AppConfig;

switch (CONFIGURATION_SOURCE) {
  case 'Caddy':
    CONFIG = {
      DEBUG: false,
      MOBILE: false,
      API_BASE: '{{env "API_BASE"}}',
      KEYCLOAK_CLIENT_ID: '{{env "KEYCLOAK_CLIENT_ID"}}',
      KEYCLOAK_REALM: '{{env "KEYCLOAK_REALM"}}',
      KEYCLOAK_URL: '{{env "KEYCLOAK_URL"}}',
      KEYCLOAK_ADAPTER: '{{env "KEYCLOAK_ADAPTER"}}',
      REDIRECT_URI: '{{env "REDIRECT_URI"}}'
    };
    break;
  case 'Webpack':
    CONFIG = {
      DEBUG: true,
      MOBILE: JSON.parse(CONFIGURATION_IS_MOBILE) === true,
      API_BASE: CONFIGURATION_API_BASE,
      KEYCLOAK_CLIENT_ID: CONFIGURATION_KEYCLOAK_CLIENT_ID,
      KEYCLOAK_REALM: CONFIGURATION_KEYCLOAK_REALM,
      KEYCLOAK_URL: CONFIGURATION_KEYCLOAK_URL,
      KEYCLOAK_ADAPTER: CONFIGURATION_KEYCLOAK_ADAPTER,
      REDIRECT_URI: CONFIGURATION_REDIRECT_URI
    };
    break;
  case 'Hardcoded':
  default:
    CONFIG = {
      DEBUG: true,
      MOBILE: false,
      API_BASE: 'http://localhost:6005',
      KEYCLOAK_CLIENT_ID: 'invasives-bc-1849',
      KEYCLOAK_REALM: 'onestopauth-business',
      KEYCLOAK_URL: 'https://dev.oidc.gov.bc.ca/auth',
      KEYCLOAK_ADAPTER: 'web',
      REDIRECT_URI: 'http://localhost:300/home/landing'
    };
    break;
}

export { CONFIG };
