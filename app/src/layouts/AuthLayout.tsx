import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { KeycloakProvider } from '@react-keycloak/web';
import { AuthStateContext, AuthStateContextProvider } from 'contexts/authStateContext';
import PublicLayout from './PublicLayout';
import getKeycloakEventHandler from '../utils/KeycloakEventHandler';
import { RolesContextProvider } from 'contexts/RolesContext';

interface IAuthLayoutProps {
  keycloak: any;
  keycloakConfig: any;
}

const AuthLayout: React.FC<IAuthLayoutProps> = (props) => {
  return (
    <KeycloakProvider
      keycloak={props.keycloak}
      initConfig={props.keycloakConfig}
      LoadingComponent={<CircularProgress />}
      onEvent={getKeycloakEventHandler(props.keycloak)}>
      <RolesContextProvider>
        <AuthStateContextProvider>
          <AuthStateContext.Consumer>
            {(context) => {
              if (!context.ready) {
                return <CircularProgress />;
              }

              return <PublicLayout>{props.children}</PublicLayout>;
            }}
          </AuthStateContext.Consumer>
        </AuthStateContextProvider>
      </RolesContextProvider>
    </KeycloakProvider>
  );
};

export default AuthLayout;
