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
  rolesUserHasAccessTo: any[];
  setUserInfo: React.Dispatch<React.SetStateAction<Object>>;
  setUserInfoLoaded: React.Dispatch<React.SetStateAction<Boolean>>;
  setUserRoles: React.Dispatch<React.SetStateAction<any>>;
  setRolesUserHasAccessTo: React.Dispatch<React.SetStateAction<any>>;
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
  rolesUserHasAccessTo: [],
  setUserInfo: () => {},
  setUserInfoLoaded: () => {},
  setUserRoles: () => {},
  setRolesUserHasAccessTo: () => {},
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
  const [rolesUserHasAccessTo, setRolesUserHasAccessTo] = React.useState([]);

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

    const getRolesUserHasAccessTo = async (user_id) => {
      const all_roles = await invasivesApi.getRoles(keycloak?.obj?.token);
      const roles = await getRolesForUser(user_id);
      const accessRoles = [];
      for (const role of roles.data) {
        accessRoles.push(role);
        if (role.role_name === 'master_administrator') {
          accessRoles.push(...all_roles);
        }
        if (role.role_name === 'indigenous_riso_manager_both') {
          accessRoles.push(...all_roles.filter((r) => r.role_name.includes('indigenous_riso')));
        }
        if (role.role_name === 'indigenous_riso_manager_plants') {
          accessRoles.push(...all_roles.filter((r) => r.role_name.includes('indigenous_riso_staff_plants')));
        }
        if (role.role_name === 'indigenous_riso_manager_animals') {
          accessRoles.push(...all_roles.filter((r) => r.role_name.includes('indigenous_riso_staff_animals')));
        }
        if (role.role_name === 'contractor_manager_both') {
          accessRoles.push(...all_roles.filter((r) => r.role_name.includes('contractor')));
        }
        if (role.role_name === 'contractor_manager_plants') {
          accessRoles.push(...all_roles.filter((r) => r.role_name.includes('contractor_staff_plants')));
        }
        if (role.role_name === 'contractor_manager_animals') {
          accessRoles.push(...all_roles.filter((r) => r.role_name.includes('contractor_staff_animals')));
        }
        if (role.role_name === 'administrator_animals') {
          accessRoles.push(...all_roles.filter((r) => r.role_name.includes('animals')));
        }
        if (role.role_name === 'administrator_plants') {
          accessRoles.push(...all_roles.filter((r) => r.role_name.includes('plants')));
        }
      }
      const uniqueArray = accessRoles.filter((thing, index, self) => {
        return index === self.findIndex((t) => t.role_name === thing.role_name);
      });
      return uniqueArray.sort((a, b) => {
        return a.role_id < b.role_id ? -1 : a.role_id > b.role_id ? 1 : 0;
      });
    };

    if (keycloak?.obj?.authenticated) {
      keycloak?.obj?.loadUserInfo().then(async (info) => {
        if (info) {
          const token = keycloak?.obj?.tokenParsed;
          if (token && token.idir_userid) {
            const userResponse = await getUserByIDIR(token.idir_userid);
            if (userResponse && userResponse.length > 0) {
              const user = userResponse[0];
              const roles = await getRolesForUser(user.user_id);
              const accessibleRoles = await getRolesUserHasAccessTo(user.user_id);
              setRolesUserHasAccessTo(accessibleRoles);
              setUserRoles(roles.data);
              const mergedInfo = { ...user, ...info, roles: roles.data };
              console.log('User Info: ', mergedInfo);
              setUserInfo(mergedInfo);
              setUserInfoLoaded(true);
            }
          }
          if (token && token.bceid_userid) {
            const userResponse = await getUserByBCEID(token.idir_userid);
            if (userResponse && userResponse.length > 0) {
              const user = userResponse[0];
              const roles = await getRolesForUser(user.user_id);
              const accessibleRoles = await getRolesUserHasAccessTo(user.user_id);
              setRolesUserHasAccessTo(accessibleRoles);
              setUserRoles(roles.data);
              const mergedInfo = { ...user, ...info, roles: roles.data };
              console.log('User Info: ', mergedInfo);
              setUserInfo(mergedInfo);
              setUserInfoLoaded(true);
            }
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
            rolesUserHasAccessTo,
            setUserInfo,
            setUserInfoLoaded,
            setUserRoles,
            setRolesUserHasAccessTo,
            hasRole,
            loginUser
          }}>
          {props.children}
        </AuthStateContext.Provider>
      }
    </>
  );
};
