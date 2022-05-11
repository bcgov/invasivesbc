import * as React from 'react';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import useKeycloakWrapper from '../hooks/useKeycloakWrapper';
import { useDataAccess } from '../hooks/useDataAccess';
import { Capacitor } from '@capacitor/core';
import { NetworkContext } from './NetworkContext';

export interface IUserInfo {
  account_status?: number;
  activation_status?: number;
  active_session_id?: string;
  bceid_account_name?: string;
  bceid_business_name?: string;
  bceid_userid?: string;
  created_at?: string;
  displayName?: string;
  email?: string;
  employer?: string;
  expiry_date?: string;
  first_name?: string;
  funding_agencies?: string;
  groups?: [];
  idir_account_name?: string;
  idir_userid?: string;
  last_name?: string;
  pac_number?: string;
  pac_service_number_1?: string;
  pac_service_number_2?: string;
  preferred_username?: string;
  updated_at?: string;
  user_id?: string;
  username?: string;
  work_phone_number?: string;
}

export const info: IUserInfo = {
  username: '',
  bceid_business_name: '',
  displayName: '',
  email: '',
  groups: []
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
  logoutUser: () => Promise<void>;
}

export const AuthStateContext = React.createContext<IAuthState>({
  keycloak: {},
  userInfo: {
    username: '',
    bceid_business_name: '',
    displayName: '',
    email: '',
    groups: []
  },
  userInfoLoaded: false,
  userRoles: [],
  rolesUserHasAccessTo: [],
  setUserInfo: () => {},
  setUserInfoLoaded: () => {},
  setUserRoles: () => {},
  setRolesUserHasAccessTo: () => {},
  hasRole: () => false,
  loginUser: () => Promise.resolve(),
  logoutUser: () => Promise.resolve()
});

export const AuthStateContextProvider: React.FC<any> = (props: any) => {
  const dataAccess = useDataAccess();
  const invasivesApi = useInvasivesApi();
  const keycloak = useKeycloakWrapper();
  const [userInfoLoaded, setUserInfoLoaded] = React.useState(infoLoaded);
  const [userInfo, setUserInfo] = React.useState(info);
  const [userRoles, setUserRoles] = React.useState([]);
  const [rolesUserHasAccessTo, setRolesUserHasAccessTo] = React.useState([]);

  const networkContext = React.useContext(NetworkContext);

  const loginUser = async () => {
    await keycloak?.obj?.login();
  };

  const logoutUser = async () => {
    if (isMobile()) {
      try {
        await invasivesApi.clearUserInfoFromCache();
      } catch (err) {
        console.log('Error clearing cache: ', err);
      }
    } else {
      try {
        await keycloak?.obj?.logout();
      } catch (err) {
        console.log('Error logging out: ', err);
      }
    }
    setUserInfoLoaded(false);
    setUserInfo({ username: '', bceid_business_name: '', displayName: '', email: '', groups: [] });
  };

  const loadUserFromCache = async () => {
    try {
      invasivesApi.getUserInfoFromCache().then((res: any) => {
        if (res) {
          setUserInfo(res.userInfo);
          setUserInfoLoaded(true);
        } else {
        }
      });
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const cacheAllRoles = async () => {
    await dataAccess.cacheAllRoles();
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

  const cacheCodeTables = async () => {
    await dataAccess.cacheCodeTables();
  };

  const cacheCurrentUserBCEID = async (bceid_userid) => {
    await dataAccess.cacheCurrentUserBCEID(bceid_userid);
  };

  const cacheCurrentUserIDIR = async (idir_userid) => {
    await dataAccess.cacheCurrentUserIDIR(idir_userid);
  };

  const cacheUserInfo = async (userInfo) => {
    await invasivesApi.cacheUserInfo(userInfo);
  };

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

  const handleUserResponse = async (userResponse) => {
    if (userResponse && userResponse.length > 0) {
      const user = userResponse[0];
      const roles = await getRolesForUser(user.user_id);
      const accessibleRoles = await getRolesUserHasAccessTo(user.user_id);
      setRolesUserHasAccessTo(accessibleRoles);
      setUserRoles(roles);
      const mergedInfo = { ...info, ...user };
      if (isMobile()) {
        await cacheRolesForUser(user.user_id);
        await cacheUserInfo(mergedInfo);
      }
      setUserInfo(mergedInfo);
      setUserInfoLoaded(true);
    }
  };

  const getRolesUserHasAccessTo = async (user_id) => {
    const all_roles_response = await invasivesApi.getRoles(keycloak?.obj?.token);
    const all_roles = all_roles_response;
    const roles = await getRolesForUser(user_id);
    const accessRoles = [];
    for (const role of roles) {
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

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  const hasRole = (role: string) => {
    if (userRoles.some((r) => r.role_name === role)) {
      return true;
    } else {
      return false;
    }
  };

  React.useEffect(() => {
    if (!keycloak?.obj) {
      console.log('keycloak undefined');
      return;
    }

    if (!networkContext.connected && isMobile() && !userInfoLoaded) {
      loadUserFromCache();
    } else if (keycloak?.obj?.authenticated) {
      keycloak?.obj?.loadUserInfo().then(async (info) => {
        if (info) {
          if (isMobile()) {
            await cacheAllRoles();
            await cacheEmployers();
            await cacheFundingAgencies();
            await cacheCodeTables();
          }
          const token = keycloak?.obj?.tokenParsed;
          if (token && token.idir_userid) {
            if (isMobile()) {
              await cacheCurrentUserIDIR(token.idir_userid);
            }
            const userResponse = await getUserByIDIR(token.idir_userid);
            handleUserResponse(userResponse);
          }
          if (token && token.bceid_userid) {
            if (isMobile()) {
              await cacheCurrentUserBCEID(token.bceid_userid);
            }
            const userResponse = await getUserByBCEID(token.bceid_userid);
            handleUserResponse(userResponse);
          }
        }
      });
    }
  }, [keycloak?.obj?.authenticated]);

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
            loginUser,
            logoutUser
          }}>
          {props.children}
        </AuthStateContext.Provider>
      }
    </>
  );
};
