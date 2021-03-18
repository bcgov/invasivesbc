import * as React from 'react';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import { useInvasivesApi } from 'hooks/useInvasivesApi';

export interface IAuthState {
  ready?: boolean;
}

export const AuthStateContext = React.createContext<IAuthState>({
  ready: false
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();
  const invasivesApi = useInvasivesApi();

  const [userInfo, setUserInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const loadUserInfo = async () => {
      const user = await keycloak.obj?.loadUserInfo();
      setUserInfo(user);
    };

    loadUserInfo();
  }, [keycloak.obj]);

  React.useEffect(() => {
    const getApiSpec = async () => {
      await invasivesApi.getCachedApiSpec();
    };

    getApiSpec();
  }, []);

  return (
    <AuthStateContext.Provider value={{ ready: keycloak.obj?.authenticated && !!userInfo }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
