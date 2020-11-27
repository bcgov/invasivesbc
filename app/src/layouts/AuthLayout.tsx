import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { KeycloakProvider } from '@react-keycloak/web';
import { AuthStateContext, AuthStateContextProvider } from 'contexts/authStateContext';
import PublicLayout from './PublicLayout';
import getKeycloakEventHandler from '../utils/KeycloakEventHandler';

interface IAuthLayoutProps {
  keycloak: any;
  initConfig: any;
}

const AuthLayout: React.FC<IAuthLayoutProps> = (props) => {
  console.log('props in auth layoutttt', props);

  return (
    <KeycloakProvider
      keycloak={props.keycloak}
      initConfig={props.initConfig}
      LoadingComponent={<CircularProgress />}
      onEvent={getKeycloakEventHandler(props.keycloak)}>
      <AuthStateContextProvider>
        <AuthStateContext.Consumer>
          {(context) => {
            if (!context.ready) {
              return <CircularProgress></CircularProgress>;
            }

            return <PublicLayout>{props.children}</PublicLayout>;
          }}
        </AuthStateContext.Consumer>
      </AuthStateContextProvider>
    </KeycloakProvider>
  );
};

export default AuthLayout;
