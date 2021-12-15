import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import useKeycloakWrapper, { IUserInfo } from '../hooks/useKeycloakWrapper';

export interface IAuthState {
  keycloak?: any;
}

export const AuthStateContext = React.createContext<IAuthState>({
  keycloak: {}
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();
  const invasivesApi = useInvasivesApi();
  // const [userInfoLoaded, setUserInfoLoaded] = React.useState(infoLoaded);
  // const [userInfo, setUserInfo] = React.useState(info);
  // const [userRoles, setUserRoles] = React.useState([]);

  const loginUser = async () => {
    await keycloak?.obj?.login();
    const user = await keycloak?.obj?.loadUserInfo();
    const roles = await keycloak?.obj?.resourceAccess['invasives-bc'].roles;
    await setUserRoles(roles);
    await setUserInfo(user);
    setUserInfoLoaded(true);
  };

  React.useEffect(() => {
    if (keycloak?.obj?.authenticated) {
      // keycloak?.obj?.loadUserInfo().then((info) => {
      //   if (info) {
      //     setUserRoles(info?.roles);
      //     setUserInfo(info);
      //     setUserInfoLoaded(true);
      //   }
      // });
    }
    //}, [keycloak?.obj?.authenticated]);
  }, [keycloak?.obj?.authenticated]);

  React.useEffect(() => {
    const getApiSpec = async () => {
      await invasivesApi.getCachedApiSpec();
    };
    getApiSpec();
  }, []);

  return (
    <>
      {
        <AuthStateContext.Provider
          value={{
            keycloak
          }}>
          {props.children}
        </AuthStateContext.Provider>
      }
    </>
  );
};
