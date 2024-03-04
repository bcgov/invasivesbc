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
import { Draft, immerable } from 'immer';
import { createNextState } from '@reduxjs/toolkit';

interface AuthState {
  initialized: boolean;
  error: boolean;
  authenticated: boolean;

  email: string | null;
  displayName: string | null;
  username: string | null;

  idir_userid: string | null;
  idir_user_guid: string | null;

  bceid_userid: string | null;
  bceid_user_guid: string | null;

  v2BetaAccess: boolean;

  requestHeaders: {
    authorization: string | null;
  };

  roles: { role_id: number; role_name: string }[];
  accessRoles: { role_id: number; role_name: string }[];
  rolesInitialized: boolean;

  extendedInfo: {
    user_id: number | null;
    account_status: number | null;
    activation_status: number | null;
    work_phone_number: string | null;
    funding_agencies: any[];
    employer: string | null;
    pac_number: string | null;
    pac_service_number_1: string | null;
    pac_service_number_2: string | null;
  };
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

const initialState: AuthState = {
  accessRoles: [],
  authenticated: false,
  bceid_user_guid: null,
  bceid_userid: null,
  displayName: null,
  email: null,
  error: false,
  extendedInfo: {
    account_status: 0,
    activation_status: 0,
    employer: null,
    funding_agencies: [],
    pac_number: null,
    pac_service_number_1: null,
    pac_service_number_2: null,
    user_id: null,
    work_phone_number: null
  },
  idir_user_guid: null,
  idir_userid: null,
  initialized: false,
  requestHeaders: { authorization: null },
  roles: [],
  rolesInitialized: false,
  username: null,
  v2BetaAccess: false
};

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
  return (state: AuthState = initialState, action) => {
    return createNextState(state, (draftState: Draft<AuthState>) => {
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
      }
    });
  };
}

const selectAuthHeaders: (state) => { authorization: any } = (state) => state.Auth.requestHeaders;
const selectAuth: (state) => AuthState = (state) => state.Auth;

export { createAuthReducer, selectAuthHeaders, selectAuth };
