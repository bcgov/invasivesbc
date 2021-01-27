import * as React from 'react';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';

export interface IAuthState {
  ready?: boolean;
}

export const AuthStateContext = React.createContext<IAuthState>({
  ready: false
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();

  const [userInfo, setUserInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const loadUserInfo = async () => {
      const user = await keycloak.obj?.loadUserInfo();
      setUserInfo(user);
    };

    loadUserInfo();
  }, [keycloak.obj]);

  return (
    <AuthStateContext.Provider value={{ ready: keycloak.obj?.authenticated && !!userInfo }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
