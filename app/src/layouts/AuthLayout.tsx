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

      onEvent={getKeycloakEventHandler(props.keycloak)}
      //this is a hack so we can have a public page in prod today
    >
      {process.env.REACT_APP_REAL_NODE_ENV !== 'production' ? (
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

      ) : (
        <PublicLayout>{props.children}</PublicLayout>
      )}
    </KeycloakProvider>
  );
};

export default AuthLayout;
