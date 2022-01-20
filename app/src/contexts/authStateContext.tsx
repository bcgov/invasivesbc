import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import useKeycloakWrapper, { IUserInfo } from '../hooks/useKeycloakWrapper';

export const info: IUserInfo = {
  username: '',
  bceid_business_name: '',
  displayName: '',
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
  hasRole: (role: string) => boolean;
  loginUser: () => Promise<void>;
}

export const AuthStateContext = React.createContext<IAuthState>({
  keycloak: {},
  userInfo: {
    username: '',
    bceid_business_name: '',
    displayName: '',
    email: '',
    groups: [],
    roles: []
  },
  userInfoLoaded: false,
  userRoles: [],
  setUserInfo: () => {},
  setUserInfoLoaded: () => {},
  setUserRoles: () => {},
  hasRole: () => false,
  loginUser: () => Promise.resolve()
});

export const AuthStateContextProvider: React.FC = (props) => {
  const invasivesApi = useInvasivesApi();
  const keycloak = useKeycloakWrapper();
  const [userInfoLoaded, setUserInfoLoaded] = React.useState(infoLoaded);
  const [userInfo, setUserInfo] = React.useState(info);
  const [userRoles, setUserRoles] = React.useState([]);
  const [applicationUsers, setApplicationUsers] = React.useState([]);

  const loginUser = async () => {
    await keycloak?.obj?.login();
    const user = await keycloak?.obj?.loadUserInfo();
    console.dir(user);
    // const roles = await keycloak?.obj?.resourceAccess['invasives-bc'].roles;
    // await setUserRoles(roles);
    await setUserInfo(user);
    setUserInfoLoaded(true);
  };

  const hasRole = (role: string) => {
    // Check if user has a role
    if (userRoles.some((r) => r.role_name === role)) {
      return true;
    } else {
      return false;
    }
  };

  React.useEffect(() => {
    const getUserByIDIR = async (idir_userid) => {
      const user = await invasivesApi.getUserByIDIR(idir_userid, keycloak?.obj?.token);
      return user;
    };

    const getUserByBCEID = async (bceid_userid) => {
      const user = await invasivesApi.getUserByBCEID(bceid_userid, keycloak?.obj?.token);
      return user;
    };

    const getRolesForUser = async (user_id) => {
      const roles = await invasivesApi.getRolesForUser(user_id, keycloak?.obj?.token);
      return roles;
    };

    if (keycloak?.obj?.authenticated) {
      keycloak?.obj?.loadUserInfo().then(async (info) => {
        if (info) {
          const token = keycloak?.obj?.tokenParsed;
          if (token && token.idir_userid) {
            const userResponse = await getUserByIDIR(token.idir_userid);
            const user = userResponse[0];
            const roles = await getRolesForUser(user.user_id);
            setUserRoles(roles.data);
            const mergedInfo = { ...user, ...info, roles: roles.data };
            console.log('User Info: ', mergedInfo);
            setUserInfo(mergedInfo);
            setUserInfoLoaded(true);
          }
          if (token && token.bceid_userid) {
            const userResponse = await getUserByBCEID(token.idir_userid);
            const user = userResponse[0];
            const roles = await getRolesForUser(user.user_id);
            setUserRoles(roles.data);
            const mergedInfo = { ...user, ...info, roles: roles.data };
            console.log('User Info: ', mergedInfo);
            setUserInfo(mergedInfo);
            setUserInfoLoaded(true);
          }
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
    <>
      {
        <AuthStateContext.Provider
          value={{
            keycloak,
            userInfoLoaded,
            userInfo,
            userRoles,
            setUserInfo,
            setUserInfoLoaded,
            setUserRoles,
            hasRole,
            loginUser
          }}>
          {props.children}
        </AuthStateContext.Provider>
      }
    </>
  );
};
