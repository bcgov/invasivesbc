import { DeviceInfo } from '@capacitor/device';
import { IonReactRouter } from '@ionic/react-router';
import { Box } from '@material-ui/core';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@material-ui/lab/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import { KeycloakEventHandler, KeycloakProvider, KeycloakTokensHandler } from '@react-keycloak/web';
import { AuthStateContextProvider } from 'contexts/authStateContext';
import { NetworkContextProvider } from 'contexts/NetworkContext';
import Keycloak, { KeycloakConfig, KeycloakInstance } from 'keycloak-js';
import React, { useEffect, useState } from 'react';
import AppRouter from './AppRouter';
import { DatabaseContextProvider } from './contexts/DatabaseContext';
import { ThemeContextProvider } from './contexts/themeContext';
import CustomThemeProvider from './utils/CustomThemeProvider';
import { useStorage } from '@ionic/react-hooks/storage';
import { useTokenStore } from './hooks/useTokenStore';
import { KeycloakTokens } from '@react-keycloak/core';

interface IAppProps {
  deviceInfo: DeviceInfo;
}

// temp till pipeline cleanup
let SSO_URL;
switch (process.env.REACT_APP_REAL_NODE_ENV) {
  case 'development':
    SSO_URL = 'https://dev.oidc.gov.bc.ca/auth/';
    break;
  case 'test':
    SSO_URL = 'https://test.oidc.gov.bc.ca/auth/';
    break;
  case 'production':
    SSO_URL = 'https://oidc.gov.bc.ca/auth/';
    break;
  default:
    SSO_URL = 'https://dev.oidc.gov.bc.ca/auth/';
    break;
}

console.log('SSO URL:', SSO_URL);
const App: React.FC<IAppProps> = ({ deviceInfo }) => {
  const { clearTokens, getTokens, saveTokens } = useTokenStore();

  const [keycloakConfig, setKeycloakConfig] = useState(null);
  const [keycloakConfigured, setKeycloakConfigured] = useState(false);

  const appRouterProps = {
    deviceInfo
  };

  const CORDOVA_KEYCLOAK_CONFIG = {
    flow: 'hybrid',
    redirectUri: 'http://127.0.0.1',
    checkLoginIframe: false,
    onLoad: 'check-sso'
  };
  const WEB_KEYCLOAK_CONFIG = {
    flow: 'hybrid',
    checkLoginIframe: false,
    onLoad: 'check-sso'
  };

  const keycloakEventHandler: KeycloakEventHandler = (event, error) => {
    switch (event) {
      case 'onAuthSuccess':
        console.dir(keycloak);
        saveTokens({
          token: keycloak.token,
          refreshToken: keycloak.refreshToken,
          idToken: keycloak.idToken
        });
        break;
      case 'onAuthError':
        clearTokens();
        break;
      case 'onAuthLogout':
        clearTokens();
        break;
      case 'onAuthRefreshError':
        clearTokens();
        break;
      case 'onAuthRefreshSuccess':
        saveTokens({
          token: keycloak.token,
          refreshToken: keycloak.refreshToken,
          idToken: keycloak.idToken
        });
        break;
      case 'onInitError':
        clearTokens();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!keycloakConfigured) {
      getTokens()
        .then((tokens) => {
          if (window['cordova']) {
            setKeycloakConfig({
              ...CORDOVA_KEYCLOAK_CONFIG,
              ...tokens
            });
          } else {
            setKeycloakConfig({
              ...WEB_KEYCLOAK_CONFIG,
              ...tokens
            });
          }
          console.log('using cached auth token');
          setKeycloakConfigured(true);
        })
        .catch(() => {
          if (window['cordova']) {
            setKeycloakConfig(CORDOVA_KEYCLOAK_CONFIG);
          } else {
            setKeycloakConfig(WEB_KEYCLOAK_CONFIG);
          }
          setKeycloakConfigured(true);
          console.log('no cached token is available, login will be required');
        });
    }
  }, []);

  const keycloakInstanceConfig: KeycloakConfig = {
    realm: 'dfmlcg7z',
    url: SSO_URL,
    clientId: 'invasives-bc'
  };

  //@ts-ignore
  const keycloak: KeycloakInstance = new Keycloak(keycloakInstanceConfig);

  if (!keycloakConfigured) {
    // cached token not loaded/configured yet
    return null;
  }

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden">
      <NetworkContextProvider>
        <KeycloakProvider
          keycloak={keycloak}
          initConfig={keycloakConfig}
          onEvent={keycloakEventHandler}>
          <DatabaseContextProvider>
            <AuthStateContextProvider>
              <ThemeContextProvider>
                <CustomThemeProvider>
                  <IonReactRouter>
                    <AppRouter {...appRouterProps} />
                  </IonReactRouter>
                </CustomThemeProvider>
              </ThemeContextProvider>
            </AuthStateContextProvider>
          </DatabaseContextProvider>
        </KeycloakProvider>
      </NetworkContextProvider>
    </Box>
  );
};

export default App;
