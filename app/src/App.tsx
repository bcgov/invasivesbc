import { DeviceInfo } from '@capacitor/device';
import { IonReactRouter } from '@ionic/react-router';
import { Box } from '@material-ui/core';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@material-ui/lab/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import { KeycloakProvider } from '@react-keycloak/web';
import { AuthStateContextProvider } from 'contexts/authStateContext';
import { NetworkContextProvider } from 'contexts/NetworkContext';
import Keycloak, { KeycloakConfig, KeycloakInstance } from 'keycloak-js';
import React from 'react';
import getKeycloakEventHandler from 'utils/KeycloakEventHandler';
import AppRouter from './AppRouter';
import { DatabaseContext2Provider } from './contexts/DatabaseContext';
import { ThemeContextProvider } from './contexts/themeContext';
import CustomThemeProvider from './utils/CustomThemeProvider';

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
const App: React.FC<IAppProps> = (props) => {
  const keycloakInstanceConfig: KeycloakConfig = {
    realm: 'dfmlcg7z',
    url: SSO_URL,
    clientId: 'invasives-bc'
  };

  //@ts-ignore
  const keycloak: KeycloakInstance = new Keycloak(keycloakInstanceConfig);
  let keycloakConfig = null;

  if (window['cordova']) {
    keycloakConfig = {
      flow: 'hybrid',
      redirectUri: 'http://127.0.0.1',
      checkLoginIframe: false
    };
  } else {
    keycloakConfig = { checkLoginIframe: false };
  }

  const appRouterProps = {
    deviceInfo: props.deviceInfo,
    keycloak,
    keycloakConfig
  };

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden">
      <NetworkContextProvider>
        <KeycloakProvider keycloak={keycloak} initConfig={keycloakConfig} onEvent={getKeycloakEventHandler(keycloak)}>
          <DatabaseContext2Provider>
            <AuthStateContextProvider>
              <ThemeContextProvider>
                <CustomThemeProvider>
                  <IonReactRouter>
                    <AppRouter {...appRouterProps} />
                  </IonReactRouter>
                </CustomThemeProvider>
              </ThemeContextProvider>
            </AuthStateContextProvider>
          </DatabaseContext2Provider>
        </KeycloakProvider>
      </NetworkContextProvider>
    </Box>
  );
};

export default App;
