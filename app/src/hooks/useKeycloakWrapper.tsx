import { useKeycloak } from '@react-keycloak/web';
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
  bceid_business_name?: string;
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
  const { keycloak } = useKeycloak();
  const userInfo = null;

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
    if (userInfo?.name) {
      return userInfo.name;
    }
    if (userInfo?.preferred_username) {
      return userInfo.preferred_username;
    }
    if (userInfo?.bceid_business_name) {
      return userInfo.bceid_business_name;
    }
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
