import { CircularProgress } from '@mui/material';
import * as React from 'react';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import useKeycloakWrapper, { IUserInfo } from '../hooks/useKeycloakWrapper';
import { useDataAccess } from '../hooks/useDataAccess';
import { Capacitor } from '@capacitor/core';

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
  const dataAccess = useDataAccess();
  const invasivesApi = useInvasivesApi();
  const keycloak = useKeycloakWrapper();
  const [userInfoLoaded, setUserInfoLoaded] = React.useState(infoLoaded);
  const [userInfo, setUserInfo] = React.useState(info);
  const [userRoles, setUserRoles] = React.useState([]);
  const [applicationUsers, setApplicationUsers] = React.useState([]);
  const [rolesUserHasAccessTo, setRolesUserHasAccessTo] = React.useState([]);

  const afterLoginStuff = async () => {
    console.log('after login, before load info from context');
    const user = await keycloak?.obj?.loadUserInfo();
    console.log('user @ loginUser', user);
    console.dir(user);
    // const roles = await keycloak?.obj?.resourceAccess['invasives-bc'].roles;
    // await setUserRoles(roles);
    await invasivesApi.createUser(user, keycloak?.obj?.token);
    await setUserInfo(user);
    setUserInfoLoaded(true);
  };

  React.useEffect(() => {
    console.log('after login hook');
    afterLoginStuff();
  }, [keycloak.obj.authenticated]);

  const loginUser = async () => {
    console.log('login user from context');
    await keycloak?.obj?.login();
  };

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  const hasRole = (role: string) => {
    // Check if user has a role
    //console.log('hasRole called');
    if (userRoles.some((r) => r.role_name === role)) {
      //  console.log('hasRole returning true');
      return true;
    } else {
      console.log('hasRole returning false');
      return false;
    }
  };

  React.useEffect(() => {
    const cacheRoles = async () => {
      await dataAccess.cacheRoles();
    };

    const cacheRolesForUser = async (userId) => {
      await dataAccess.cacheRolesForUser(userId);
    };

    const cacheEmployers = async () => {
      await dataAccess.cacheEmployers();
    };

    const cacheFundingAgencies = async () => {
      await dataAccess.cacheFundingAgencies();
    };

    const cacheCurrentUserBCEID = async (bceid_userid) => {
      await dataAccess.cacheCurrentUserBCEID(bceid_userid);
    };

    const cacheCurrentUserIDIR = async (idir_userid) => {
      await dataAccess.cacheCurrentUserIDIR(idir_userid);
    };

    const getUserByIDIR = async (idir_userid) => {
      const user = await invasivesApi.getUserByIDIR(idir_userid, keycloak?.obj?.token);
      //   console.log('user @ getUserByIDIR', user);
      return user;
    };

    const getUserByBCEID = async (bceid_userid) => {
      const user = await invasivesApi.getUserByBCEID(bceid_userid, keycloak?.obj?.token);
      //  console.log('user @ getUserByBCEID', user);
      return user;
    };

    const getRolesForUser = async (user_id) => {
      const roles = await invasivesApi.getRolesForUser(user_id, keycloak?.obj?.token);
      console.log('roles @ getRolesForUser', roles);
      return roles;
    };

    const getRolesUserHasAccessTo = async (user_id) => {
      const all_roles = await invasivesApi.getRoles(keycloak?.obj?.token);
      // console.log('all_roles @ getRolesUserHasAccessTo', all_roles);
      const roles = await getRolesForUser(user_id);
      // console.log('roles for user @ getRolesUserHasAccessTo', roles);
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
      console.log('keycloak.obj.authenticated is true');
      keycloak?.obj?.loadUserInfo().then(async (info) => {
        if (info) {
          if (isMobile()) {
            await cacheRoles();
            await cacheEmployers();
            await cacheFundingAgencies();
          }
          const token = keycloak?.obj?.tokenParsed;
          if (token && token.idir_userid) {
            if (isMobile()) {
              // Cache the current user's roles and info by idir
              await cacheCurrentUserIDIR(token.idir_userid);
            }
            const userResponse = await getUserByIDIR(token.idir_userid);
            if (userResponse && userResponse.length > 0) {
              const user = userResponse[0];
              const roles = await getRolesForUser(user.user_id);
              if (isMobile()) {
                await cacheRolesForUser(user.user_id);
              }
              const accessibleRoles = await getRolesUserHasAccessTo(user.user_id);
              setRolesUserHasAccessTo(accessibleRoles);
              setUserRoles(roles.data);
              const mergedInfo = { ...user, ...info, roles: roles.data };
              setUserInfo(mergedInfo);
              setUserInfoLoaded(true);
            }
          }
          if (token && token.bceid_userid) {
            if (isMobile()) {
              // Cache the current user's roles and info by bceid
              await cacheCurrentUserBCEID(token.bceid_userid);
            }
            const userResponse = await getUserByBCEID(token.bceid_userid);
            if (userResponse && userResponse.length > 0) {
              const user = userResponse[0];
              const roles = await getRolesForUser(user.user_id);
              if (isMobile()) {
                await cacheRolesForUser(user.user_id);
              }
              const accessibleRoles = await getRolesUserHasAccessTo(user.user_id);
              setRolesUserHasAccessTo(accessibleRoles);
              setUserRoles(roles.data);
              const mergedInfo = { ...user, ...info, roles: roles.data };
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
