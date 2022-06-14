import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

import { DeviceInfo } from '@capacitor/device';
import { IonReactRouter } from '@ionic/react-router';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import { KeycloakProvider } from '@react-keycloak/web';
import { AuthStateContextProvider } from 'contexts/authStateContext';
import { ErrorContextProvider } from 'contexts/ErrorContext';
import { NetworkContextProvider } from 'contexts/NetworkContext';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import getKeycloakEventHandler from 'utils/KeycloakEventHandler';
import AppRouter from './AppRouter';
import { DatabaseContextProvider } from './contexts/DatabaseContext';
import CustomThemeProvider from './utils/CustomThemeProvider';

//Neither worked in both cases with standard sso realm.
// 1. keycloak-js with cordova adapater only redirects to localhost, but
// web origin would be an ip, and standard realm doesn't handle that.
// 2. keycloak-ionic just plain didn't work in web.
const getKeycloak = () => {
  if (Capacitor.isNativePlatform()) {
    return require('keycloak-ionic');
  } else {
    return require('keycloak-js');
  }
};
const KC = getKeycloak();

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

/* . If you want to run app locally and point to dev api using
     ```$ . ./setenv dev```
     you need to change teh 'development' case below to have the same redirect_uri as the default case.
     If you don't it will redirect to the dev site on login.
     */
//let redirect_uri = 'InvasivesBC://127.0.0.1:3000/home/landing';

let redirect_uri = 'http://127.0.0.1:3000/home/landing';
switch (process.env.REACT_APP_REAL_NODE_ENV) {
  case 'development':
    redirect_uri = 'https://dev-invasivesbci.apps.silver.devops.gov.bc.ca/home/landing';
    break;
  case 'test':
    redirect_uri = 'https://test-invasivesbci.apps.silver.devops.gov.bc.ca/home/landing';
    break;
  case 'production':
    redirect_uri = 'https://invasivesbci.apps.silver.devops.gov.bc.ca/home/landing';
    break;
  default:
    redirect_uri = 'http://localhost:3000/home/landing';
    break;
}
if (Capacitor.isNativePlatform()) {
  redirect_uri = 'invasivesbc://localhost/home/landing';
}

// console.log('SSO URL:', SSO_URL);
const App: React.FC<IAppProps> = (props) => {
  const keycloakInstanceConfig: Keycloak.KeycloakConfig = {
    realm: 'onestopauth-business',
    //    adapter: 'capacitor-native',
    url: SSO_URL,
    clientId: 'invasives-bc-1849'
  };

  //@ts-ignore
  const keycloak: KeycloakInstance = new KC(keycloakInstanceConfig);
  let keycloakConfig = null;

  switch (Capacitor.getPlatform()) {
    case 'ios':
      keycloakConfig = {
        adapter: 'web',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        redirectUri: 'invasivesbc://localhost/home/landing'
      };
      break;
    case 'android':
      keycloakConfig = {
        adapter: 'capacitor-native',
        pkceMethod: 'S256',
        responseMode: 'query',
        redirectUri: 'invasivesbc://localhost/home/landing'
      };
      break;
    case 'web':
    default:
      keycloakConfig = {
        adapter: 'web',
        pkceMethod: 'S256',
        checkLoginIframe: false
        // redirectUri: redirect_uri
      };
      break;
  }

  const [deviceInfo, setDeviceInfo] = useState(null);
  const getDeviceInfo = async () => {
    const dev = await Device.getInfo();
    setDeviceInfo({ ...dev });
  };

  useEffect(() => {
    getDeviceInfo();
  }, []);

  const appRouterProps = {
    deviceInfo: deviceInfo, //props.deviceInfo,
    keycloak,
    keycloakConfig
  };

  const DebugRouter = ({ children }: { children: any }) => {
    const { location } = useHistory();
    if (['development', 'local'].includes(process.env.REACT_APP_REAL_NODE_ENV)) {
      console.log(`Route: ${location.pathname}${location.search}, State: ${JSON.stringify(location.state)}`);
    }

    return children;
  };

  const loadingComponent = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden" justifyContent="center" alignContent="center">
      {deviceInfo !== null ? (
        <ErrorContextProvider>
          <NetworkContextProvider>
            <KeycloakProvider
              keycloak={keycloak}
              LoadingComponent={loadingComponent}
              initConfig={keycloakConfig}
              onEvent={getKeycloakEventHandler(keycloak)}>
              <DatabaseContextProvider>
                <AuthStateContextProvider>
                  <CustomThemeProvider>
                    <IonReactRouter>
                      <DebugRouter>
                        <AppRouter {...appRouterProps} />
                      </DebugRouter>
                    </IonReactRouter>
                  </CustomThemeProvider>
                </AuthStateContextProvider>
              </DatabaseContextProvider>
            </KeycloakProvider>
          </NetworkContextProvider>
        </ErrorContextProvider>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default App;
