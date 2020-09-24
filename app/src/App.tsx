import { DeviceInfo } from '@capacitor/core';
import { IonReactRouter } from '@ionic/react-router';
import { CircularProgress, createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core';
import { KeycloakProvider } from '@react-keycloak/web';
import Keycloak, { KeycloakConfig, KeycloakInstance } from 'keycloak-js';
import React from 'react';
import AppRouter from './AppRouter';
import { AuthStateContext, AuthStateContextProvider, IAuthState } from './contexts/authStateContext';
import { DatabaseContextProvider } from './contexts/DatabaseContext';
import getKeycloakEventHandler from './utils/KeycloakEventHandler';

const theme = createMuiTheme({
  overrides: {
    MuiCircularProgress: {
      root: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: '60px !important',
        width: '60px !important',
        marginLeft: '-30px',
        marginTop: '-30px'
      }
    },
    MuiContainer: {
      root: {
        maxWidth: 'xl'
      }
    }
  }
});

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
      <ThemeProvider theme={theme}>
        <KeycloakProvider
          keycloak={keycloak}
          initConfig={initConfig}
          LoadingComponent={<CircularProgress />}
          onEvent={getKeycloakEventHandler(keycloak)}>
          <AuthStateContextProvider>
            <IonReactRouter>
              <DatabaseContextProvider>
                <AuthStateContext.Consumer>
                  {(context: IAuthState) => {
                    if (!context.ready) {
                      return <CircularProgress />;
                    }

                    return <AppRouter />;
                  }}
                </AuthStateContext.Consumer>
              </DatabaseContextProvider>
            </IonReactRouter>
          </AuthStateContextProvider>
        </KeycloakProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
