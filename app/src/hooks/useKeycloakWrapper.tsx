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

  const userInfo = keycloak?.userInfo as IUserInfo;

  /**
   * Determine if the user belongs to the specified role(s).
   * The user's role(s) must match at least 1 of the valid roles.
   *
   * @param {(string | string[])} [validRoles] a role, or array of roles, that the user must match.
   * @return {*}  {boolean} true if the user's role(s) match at least 1 of the valid roles, false otherwise.
   */
  const hasRole = (validRoles?: string | string[]): boolean => {
    if (!validRoles || !validRoles.length) {
      return false;
    }

    if (Array.isArray(validRoles)) {
      return validRoles.some((role) => roles().includes(role));
    }

    return roles().includes(validRoles);
  };

  /**
   * Return the array of roles that the user belongs to.
   */
  const roles = (): string[] => {
    return keycloak?.resourceAccess?.['invasives-bc']?.roles || [];
  };

  /**
   * Return the user's username
   */
  const username = (): string => {
    return userInfo?.username;
  };

  /**
   * Return the user's preferred_username
   */
  const preferredUsername = (): string => {
    return userInfo?.preferred_username;
  };

  /**
   * Return the user's display name
   */
  const displayName = (): string | undefined => {
    return userInfo?.name ?? userInfo?.preferred_username;
  };

  /**
   * Return the user's first name
   */
  const firstName = (): string | undefined => {
    return userInfo?.firstName ?? userInfo?.given_name;
  };

  /**
   * Return the user's last name
   */
  const lastName = (): string | undefined => {
    return userInfo?.lastName ?? userInfo?.family_name;
  };

  /**
   * Return the user's email
   */
  const email = (): string | undefined => {
    return userInfo?.email;
  };

  /**
   * Return the user's sub (unique identifier)
   */
  const sub = (): string | undefined => {
    return userInfo?.sub;
  };

  return {
    obj: keycloak,
    username: username(),
    preferred_username: preferredUsername(),
    displayName: displayName(),
    firstName: firstName(),
    lastName: lastName(),
    email: email(),
    roles: roles(),
    sub: sub(),
    hasRole: hasRole
  };
}

export default useKeycloakWrapper;
