import { Capacitor } from '@capacitor/core';
import { DeviceInfo } from '@capacitor/device';

import { IonReactRouter } from '@ionic/react-router';
import { Box, CircularProgress } from '@material-ui/core';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@material-ui/lab/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import { DatabaseChangesContextProvider } from './contexts/DatabaseChangesContext';
import { DatabaseContext, DatabaseContextProvider, IDatabaseContext } from './contexts/DatabaseContext';
import { DatabaseContext2Provider } from './contexts/DatabaseContext2';
import { ThemeContextProvider } from './contexts/themeContext';
import { NetworkContextProvider } from 'contexts/NetworkContext';
import Keycloak, { KeycloakConfig, KeycloakInstance } from 'keycloak-js';
import React from 'react';
import CustomThemeProvider from './utils/CustomThemeProvider';

import AppRouter from './AppRouter';

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
      checkLoginIframe: false,
      onLoad: 'login-required'
    };
  } else {
    keycloakConfig = { onLoad: 'login-required', checkLoginIframe: false };
  }

  const appRouterProps = {
    deviceInfo: props.deviceInfo,
    keycloak,
    keycloakConfig
  };

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden">
      <ThemeContextProvider>
        <NetworkContextProvider>
          <CustomThemeProvider>
            <IonReactRouter>
              <DatabaseContext2Provider>
                <DatabaseContextProvider>
                  <DatabaseContext.Consumer>
                    {(databaseContext: IDatabaseContext) => {
                      if (Capacitor.getPlatform() === 'ios') {
                        return (
                          <DatabaseChangesContextProvider>
                            <AppRouter {...appRouterProps} />
                          </DatabaseChangesContextProvider>
                        );
                      }
                      if (databaseContext.database) {
                        // database not ready, delay loading app
                        return (
                          <DatabaseChangesContextProvider>
                            <AppRouter {...appRouterProps} />
                          </DatabaseChangesContextProvider>
                        );
                      }
                      return <CircularProgress />;
                    }}
                  </DatabaseContext.Consumer>
                </DatabaseContextProvider>
              </DatabaseContext2Provider>
            </IonReactRouter>
          </CustomThemeProvider>
        </NetworkContextProvider>
      </ThemeContextProvider>
    </Box>
  );
};

export default App;
