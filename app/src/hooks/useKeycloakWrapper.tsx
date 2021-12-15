import {KeycloakEventHandler, useKeycloak} from '@react-keycloak/web';
import { NetworkContext } from 'contexts/NetworkContext';
import { useContext, useState } from 'react';
import { useInvasivesApi } from './useInvasivesApi';

/**
 * Represents the keycloak object for the authenticated user.
 *
 * @export
 * @interface IKeycloak
 */
export interface IKeycloak {
  obj: any;
  hasRole(role?: string | string[]): boolean;
}

/**
 * Provides extension methods to interact with the `keycloak` object.
 */
function useKeycloakWrapper(): IKeycloak {
  const { keycloak } = useKeycloak();

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

  return {
    obj: keycloak,
    hasRole: hasRole
  };
}

export default useKeycloakWrapper;
