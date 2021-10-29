import * as React from 'react';
import useKeycloakWrapper, { IUserInfo } from '../hooks/useKeycloakWrapper';
import { useInvasivesApi } from '../hooks/useInvasivesApi';

export const info: IUserInfo = {
  username: '',
  email: '',
  groups: [],
  roles: []
};
export const infoLoaded: boolean = false;
export interface IAuthState {
  keycloak?: any;
  userInfo: IUserInfo;
  userInfoLoaded: boolean;
  userRoles: any[];
  setUserInfo: React.Dispatch<React.SetStateAction<Object>>;
  setUserInfoLoaded: React.Dispatch<React.SetStateAction<Boolean>>;
  setUserRoles: React.Dispatch<React.SetStateAction<any>>;
}

export const AuthStateContext = React.createContext<IAuthState>({
  keycloak: {},
  userInfo: {
    username: '',
    email: '',
    groups: [],
    roles: []
  },
  userInfoLoaded: false,
  userRoles: [],
  setUserInfo: () => {},
  setUserInfoLoaded: () => {},
  setUserRoles: () => {}
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();
  const invasivesApi = useInvasivesApi();
  const [userInfoLoaded, setUserInfoLoaded] = React.useState(infoLoaded);
  const [userInfo, setUserInfo] = React.useState(info);
  const [userRoles, setUserRoles] = React.useState([]);

  React.useEffect(() => {
    if (keycloak?.obj?.authenticated) {
      keycloak?.obj?.loadUserInfo().then((info) => {
        if (info) {
          setUserRoles(info?.roles);
          setUserInfo(info);
          setUserInfoLoaded(true);
        }
      });
    }
  }, [keycloak?.obj?.authenticated]);

  React.useEffect(() => {
    const getApiSpec = async () => {
      await invasivesApi.getCachedApiSpec();
    };

    getApiSpec();
  }, []);

  return (
    <AuthStateContext.Provider
      value={{ keycloak, userInfoLoaded, userInfo, userRoles, setUserInfo, setUserInfoLoaded, setUserRoles }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
