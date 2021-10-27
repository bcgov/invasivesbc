import { useKeycloak } from '@react-keycloak/web';
import { NetworkContext } from 'contexts/NetworkContext';
import { useEffect, useState, useContext } from 'react';
import { Capacitor } from '@capacitor/core';
import { useInvasivesApi } from './useInvasivesApi';
/**
 * Represents the userinfo provided by keycloak.
 *
 * @export
 * @interface IUserInfo
 */
export interface IUserInfo {
  displayName?: string;
  username: string;
  name?: string;
  preferred_username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  groups: string[];
  roles: string[];
  given_name?: string;
  family_name?: string;
  sub?: string;
}

/**
 * Represents the keycloak object for the authenticated user.
 *
 * @export
 * @interface IKeycloak
 */
export interface IKeycloak {
  obj: any;
  userInfo: IUserInfo;
  displayName?: string;
  username: string;
  name?: string;
  preferred_username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  sub: string;
  hasRole(role?: string | string[]): boolean;
}

/**
 * Provides extension methods to interact with the `keycloak` object.
 */
function useKeycloakWrapper(): IKeycloak {
  const api = useInvasivesApi();
  const network = useContext(NetworkContext);
  const { keycloak } = useKeycloak();
  const authenticated = keycloak?.authenticated;
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    console.log('USER INFO HERE: ', userInfo);
    const loadUserInfoFromCache = async () => {
      console.log('loadUserInfoFromCache hit');
      // Grab the user info object from the cache
      await api.getUserInfoFromCache().then((res: any) => {
        console.log('res from getUserInfoFromCache: ', res);
        if (res) {
          // If cache returned an entry set user info
          console.log('Got user info from cache: ', res.userInfo);
          setUserInfo(res.userInfo);
        }
      });
    };
    const loadUserInfoFromKeycloak = async () => {
      // Load user from keycloak
      const user = await keycloak?.loadUserInfo();
      // Set user in state
      setUserInfo(user);
      // Grab roles from keycloak
      const roles = await keycloak?.resourceAccess['invasives-bc'].roles;
      const userInfoAndRoles = {
        userInfo: user,
        roles: roles
      };
      // Cache user info and roles for offline use
      await api.cacheUserInfo(userInfoAndRoles).then((res: any) => {
        console.log('User info cached successfully');
      });
    };
    // Do not run either function if we already have userinfo
    if (userInfo) {
      return;
    }
    // For offline mobile usage, grab info from cache
    console.log('Platform: ', Capacitor.getPlatform());
    console.log('Network connected? ', network.connected);
    if (Capacitor.getPlatform() !== 'web' && !network.connected) {
      console.log('Loading user info from cache...');
      loadUserInfoFromCache();
    } else {
      // If online or on web, grab user info from keycloak and cache it
      console.log('Loading user info from keycloak...');
      loadUserInfoFromKeycloak();
    }
  }, [authenticated, keycloak, userInfo]);

  /**
   * Determine if the user belongs to the specified role(s).
   * The user's role(s) must match at least 1 of the valid roles.
   *
   * @param {(string | string[])} [validRoles] a role, or array of roles, that the user must match.
   * @return {*} {boolean} true if the user's role(s) match at least 1 of the valid roles, false otherwise.
   */
  const hasRole = (validRoles?: string | string[]): boolean => {
    if (!validRoles || !validRoles.length) {
      return false;
    }

    if (Array.isArray(validRoles)) {
      return validRoles.some((role) => getRoles().includes(role));
    }

    return getRoles().includes(validRoles);
  };

  /**
   * Return the array of roles that the user belongs to.
   */
  const getRoles = (): string[] => {
    return keycloak?.resourceAccess?.['invasives-bc']?.roles || [];
  };

  /**
   * Return the user's username
   */
  const getUsername = (): string => {
    return userInfo?.username;
  };

  /**
   * Return the user's preferred_username
   */
  const getPreferredUsername = (): string => {
    return userInfo?.preferred_username;
  };

  /**
   * Return the user's display name
   */
  const getDisplayName = (): string | undefined => {
    return userInfo?.name ?? userInfo?.preferred_username;
  };

  /**
   * Return the user's first name
   */
  const getFirstName = (): string | undefined => {
    return userInfo?.firstName ?? userInfo?.given_name;
  };

  /**
   * Return the user's last name
   */
  const getLastName = (): string | undefined => {
    return userInfo?.lastName ?? userInfo?.family_name;
  };

  /**
   * Return the user's email
   */
  const getEmail = (): string | undefined => {
    return userInfo?.email;
  };

  /**
   * Return the user's sub (unique identifier)
   */
  const getSub = (): string | undefined => {
    return userInfo?.sub;
  };

  return {
    obj: keycloak,
    userInfo: userInfo,
    username: getUsername(),
    preferred_username: getPreferredUsername(),
    displayName: getDisplayName(),
    firstName: getFirstName(),
    lastName: getLastName(),
    email: getEmail(),
    roles: getRoles(),
    sub: getSub(),
    hasRole: hasRole
  };
}

export default useKeycloakWrapper;
