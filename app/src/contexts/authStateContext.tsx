import { useInvasivesApi } from '../hooks/useInvasivesApi';
import useKeycloakWrapper from '../hooks/useKeycloakWrapper';
import React, { createContext, useEffect, useState } from 'react';
import { useNetworkInformation } from '../hooks/useNetworkInformation';
import { useTokenStore } from '../hooks/useTokenStore';

export interface IAuthState {
  keycloak?: any;
  isAuthenticated: boolean;
  doLogin: () => Promise<void>;
  doLogout: () => Promise<void>;
}

export const AuthStateContext = createContext<IAuthState>({
  keycloak: {},
  isAuthenticated: false,
  doLogin: async () => {},
  doLogout: async () => {}
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();
  const { saveTokens } = useTokenStore();
  const { isMobile } = useNetworkInformation();
  const [isAuthenticated, setAuthenticated] = useState(false);

  /*
    Logout current user by wiping their keycloak access token and notifying keycloak if we are online
  */
  const doLogout = async () => {
    // Reset user info object
    if (!isMobile()) {
      try {
        await keycloak?.obj?.logout();
      } catch (err) {
        console.error('Error logging out: ', err);
      }
    }
  };

  const doLogin = async () => {
    await keycloak?.obj?.login({
      scope: 'offline_access'
    });

    saveTokens({
      token: keycloak.obj.token,
      idToken: keycloak.obj.idToken,
      refreshToken: keycloak.obj.refreshToken
    });
  };

  useEffect(() => {
    if (keycloak?.obj) {
      setAuthenticated(keycloak.obj.authenticated);
    }
  }, [keycloak?.obj?.authenticated]);

  return (
    <>
      {
        <AuthStateContext.Provider
          value={{
            keycloak,
            isAuthenticated,
            doLogin,
            doLogout
          }}>
          {props.children}
        </AuthStateContext.Provider>
      }
    </>
  );
};
