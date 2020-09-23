import { DeviceInfo } from '@capacitor/core';
import { IonReactRouter } from '@ionic/react-router';
import { CircularProgress, makeStyles } from '@material-ui/core';
import { KeycloakProvider } from '@react-keycloak/web';
import Keycloak, { KeycloakConfig, KeycloakInstance } from 'keycloak-js';
import React from 'react';
import AppRouter from './AppRouter';
import { AuthStateContext, AuthStateContextProvider, IAuthState } from './contexts/authStateContext';
import getKeycloakEventHandler from './utils/KeycloakEventHandler';

const useStyles = makeStyles(() => ({
  root: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    overflow: 'hidden'
  }
}));

const App: React.FC<{ info: DeviceInfo }> = (props) => {
  const classes = useStyles();

  const keycloakConfig: KeycloakConfig = {
    realm: 'dfmlcg7z',
    url: 'https://sso-dev.pathfinder.gov.bc.ca/auth/',
    clientId: 'invasives-bc'
  };

  //@ts-ignore
  const keycloak: KeycloakInstance = new Keycloak(keycloakConfig);

  let initConfig = null;

  if (window['cordova']) {
    initConfig = {
      ...initConfig,
      ...{
        flow: 'hybrid',
        redirectUri: 'http://127.0.0.1',
        checkLoginIframe: false,
        onLoad: 'login-required'
      }
    };
  } else {
    initConfig = { onLoad: 'login-required' };
  }

  return (
    <div className={classes.root}>
      <KeycloakProvider
        keycloak={keycloak}
        initConfig={initConfig}
        LoadingComponent={<CircularProgress />}
        onEvent={getKeycloakEventHandler(keycloak)}>
        <AuthStateContextProvider>
          <IonReactRouter>
            <AuthStateContext.Consumer>
              {(context: IAuthState) => {
                if (!context.ready) {
                  return <CircularProgress />;
                }

                return <AppRouter />;
              }}
            </AuthStateContext.Consumer>
          </IonReactRouter>
        </AuthStateContextProvider>
      </KeycloakProvider>
    </div>
  );
};

export default App;
