import { keycloakInstance } from '../sagas/auth';

import {
  AUTH_CLEAR_ROLES,
  AUTH_INITIALIZE_COMPLETE,
  AUTH_REFRESH_ROLES_COMPLETE,
  AUTH_REFRESH_ROLES_ERROR,
  AUTH_REFRESH_ROLES_REQUEST,
  AUTH_REQUEST_COMPLETE,
  AUTH_SIGNOUT_COMPLETE,
  AUTH_UPDATE_TOKEN_STATE
} from '../actions';
import { AppConfig } from 'state/config';
import { immerable } from 'immer';
import { createNextState } from '@reduxjs/toolkit';

class AuthState {
  [immerable] = true;
  initialized: boolean;
  error: boolean;
  authenticated: boolean;

  email: string;
  displayName: string;
  username: string;
  idir_userid: string;
  idir_user_guid: string;

  bceid_userid: string;
  bceid_user_guid: string;

  requestHeaders: {
    authorization: string;
  };

  roles: { role_id: number; role_name: string }[];
  accessRoles: { role_id: number; role_name: string }[];
  rolesInitialized: false;

  extendedInfo: {
    user_id: number;
    account_status: number;
    activation_status: number;
    work_phone_number: string | null;
    funding_agencies: any[];
    employer: string | null;
    pac_number: string | null;
    pac_service_number_1: string | null;
    pac_service_number_2: string | null;
  };

  constructor() {
    this.initialized = false;
    this.authenticated = false;
    this.roles = [];
    this.accessRoles = [];
    this.rolesInitialized = false;
    this.extendedInfo = null;
  }
}

function computeAccessRoles(
  all_roles: { role_id: number; role_name: string }[],
  roles: { role_id: number; role_name: string }[]
): { role_id: number; role_name: string }[] {
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
    if (role.role_name === 'administrator_plants') {
      accessRoles.push(...all_roles.filter((r) => r.role_name.includes('plants')));
    }
  }
  const uniqueArray: { role_id: number; role_name: string }[] = accessRoles.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  return uniqueArray.sort((a, b) => {
    return a.role_id - b.role_id;
  });
}

const initialState = new AuthState();

function loadCurrentStateFromKeycloak(previousState: AuthState, config: AppConfig): object {
  let displayName = 'User';
  let username = null;
  let email = '';
  let bceid_userid = '';
  let idir_userid = '';
  let bceid_user_guid = '';
  let idir_user_guid = '';

  const authenticated = keycloakInstance.authenticated;

  if (keycloakInstance.idTokenParsed) {
    if (keycloakInstance.idTokenParsed['idir_username']) idir_userid = keycloakInstance.idTokenParsed['idir_username'];
    if (keycloakInstance.idTokenParsed['idir_user_guid'])
      idir_user_guid = keycloakInstance.idTokenParsed['idir_user_guid'];
    if (keycloakInstance.idTokenParsed['bceid_username'])
      bceid_userid = keycloakInstance.idTokenParsed['bceid_username'];
    if (keycloakInstance.idTokenParsed['bceid_user_guid'])
      bceid_user_guid = keycloakInstance.idTokenParsed['bceid_user_guid'];
    username = idir_userid ? idir_userid.toLowerCase() + '@idir' : bceid_userid.toLowerCase() + '@bceid-business';
    if (
      'display_name' in keycloakInstance.idTokenParsed &&
      keycloakInstance.idTokenParsed['display_name'] !== null &&
      keycloakInstance.idTokenParsed['display_name'].length > 0
    ) {
      // BCEid token has this attribute set
      displayName = keycloakInstance.idTokenParsed['display_name'];
    } else {
      displayName = `${keycloakInstance.idTokenParsed['given_name']} ${keycloakInstance.idTokenParsed['family_name']}`;
    }
    email = keycloakInstance.idTokenParsed['email'];
  }

  const requestHeaders = {
    authorization: `Bearer ${keycloakInstance.idToken}`
  };

  return {
    authenticated,
    displayName,
    requestHeaders,
    username,
    email,
    idir_userid,
    bceid_userid,
    idir_user_guid,
    bceid_user_guid
  };
}

function createAuthReducer(configuration: AppConfig): (AuthState, AnyAction) => AuthState {
  return (state = initialState, action) => {
    return createNextState(state, (draftState) => {
      switch (action.type) {
        case AUTH_SIGNOUT_COMPLETE: {
          draftState.initialized = true;
          draftState.authenticated = false;
          draftState.roles = [];
          draftState.accessRoles = [];
          draftState.rolesInitialized = false;
          draftState.extendedInfo = null;
          draftState.displayName = null;
          draftState.email = null;
          draftState.username = 'loggedOut';
          break;
        }
        case AUTH_INITIALIZE_COMPLETE: {
          draftState.initialized = true;
          Object.keys(loadCurrentStateFromKeycloak(state, configuration)).forEach((key) => {
            draftState[key] = loadCurrentStateFromKeycloak(state, configuration)[key];
          });
          break;
        }
        case AUTH_REQUEST_COMPLETE: {
          Object.keys(loadCurrentStateFromKeycloak(state, configuration)).forEach((key) => {
            draftState[key] = loadCurrentStateFromKeycloak(state, configuration)[key];
          });
          break;
        }
        case AUTH_UPDATE_TOKEN_STATE: {
          Object.keys(loadCurrentStateFromKeycloak(state, configuration)).forEach((key) => {
            draftState[key] = loadCurrentStateFromKeycloak(state, configuration)[key];
          });
          break;
        }
        case AUTH_REFRESH_ROLES_REQUEST: {
          draftState.rolesInitialized = false;
          draftState.roles = [];
          draftState.accessRoles = [];
          draftState.extendedInfo = null;
          break;
        }
        case AUTH_CLEAR_ROLES: {
          draftState.rolesInitialized = false;
          draftState.roles = [];
          draftState.accessRoles = [];
          draftState.extendedInfo = null;
          break;
        }
        case AUTH_REFRESH_ROLES_COMPLETE: {
          const { all_roles, roles, extendedInfo, v2BetaAccess } = action.payload;
          draftState.roles = roles;
          draftState.accessRoles = computeAccessRoles(all_roles, roles);
          draftState.extendedInfo = extendedInfo;
          draftState.rolesInitialized = true;
          draftState.v2BetaAccess = v2BetaAccess;
          break;
        }
        case AUTH_REFRESH_ROLES_ERROR: {
          draftState.rolesInitialized = false;
          draftState.roles = [];
          draftState.accessRoles = [];
          draftState.extendedInfo = null;
          break;
        }
        default:
          break;
        //return state;
      }
    });
  };
}

const selectAuthHeaders: (state) => { authorization: any } = (state) => state.Auth.requestHeaders;
const selectAuth: (state) => AuthState = (state) => state.Auth;

export { createAuthReducer, selectAuthHeaders, selectAuth };
