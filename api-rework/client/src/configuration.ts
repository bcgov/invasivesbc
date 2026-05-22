
const CONFIG = {
  API_URL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  OBJECTSTORE_ROOT: import.meta.env.VITE_OBJECTSTORE_ROOT || 'http://localhost:3900', //@todo deprecate, now that we're using presigned urls
  SSO_CLIENT_ID: import.meta.env.VITE_SSO_CLIENT_ID || 'invasives-bc-4565',
  SSO_REALM: import.meta.env.VITE_SSO_REALM || 'standard',
  SSO_URL: import.meta.env.VITE_SSO_URL || 'https://dev.loginproxy.gov.bc.ca/auth/',
  SSO_REDIRECT_URI: import.meta.env.VITE_SSO_REDIRECT_URI || 'http://localhost:3001',
}


export { CONFIG };
