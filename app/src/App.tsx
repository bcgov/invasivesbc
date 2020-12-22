import { DeviceInfo } from '@capacitor/core';
import { IonReactRouter } from '@ionic/react-router';
import { Box, CircularProgress, ThemeProvider } from '@material-ui/core';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@material-ui/lab/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import { DatabaseChangesContextProvider } from 'contexts/DatabaseChangesContext';
import { DatabaseContext, DatabaseContextProvider, IDatabaseContext } from 'contexts/DatabaseContext';
import { NetworkContextProvider } from 'contexts/NetworkContext';
import Keycloak, { KeycloakConfig, KeycloakInstance } from 'keycloak-js';
import React from 'react';
import appTheme from 'themes/appTheme';
import AppRouter from './AppRouter';

interface IAppProps {
  deviceInfo: DeviceInfo;
}

const App: React.FC<IAppProps> = (props) => {
  const keycloakInstanceConfig: KeycloakConfig = {
    realm: 'dfmlcg7z',
    url: 'https://dev.oidc.gov.bc.ca/auth/',
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
      <ThemeProvider theme={appTheme}>
        <IonReactRouter>
          <NetworkContextProvider>
            <DatabaseContextProvider>
              <DatabaseContext.Consumer>
                {(databaseContext: IDatabaseContext) => {
                  if (!databaseContext.database) {
                    // database not ready, delay loading app
                    return <CircularProgress />;
                  }
                  return (
                    <DatabaseChangesContextProvider>
                      <AppRouter {...appRouterProps} />
                    </DatabaseChangesContextProvider>
                  );
                }}
              </DatabaseContext.Consumer>
            </DatabaseContextProvider>
          </NetworkContextProvider>
        </IonReactRouter>
      </ThemeProvider>
    </Box>
  );
};

export default App;
