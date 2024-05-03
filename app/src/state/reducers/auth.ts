import { keycloakInstance } from '../sagas/auth';

import {
  AUTH_CLEAR_ROLES, AUTH_FORGET_OFFLINE_USER,
  AUTH_INITIALIZE_COMPLETE, AUTH_MAKE_OFFLINE_USER_CURRENT, AUTH_OPEN_OFFLINE_USER_SELECTION_DIALOG,
  AUTH_REFRESH_ROLES_COMPLETE,
  AUTH_REFRESH_ROLES_ERROR,
  AUTH_REFRESH_ROLES_REQUEST,
  AUTH_REQUEST_COMPLETE, AUTH_SAVE_CURRENT_TO_OFFLINE, AUTH_SET_DISRUPTED, AUTH_SET_RECOVERED_FROM_DISRUPTION,
  AUTH_SIGNOUT_COMPLETE,
  AUTH_UPDATE_TOKEN_STATE
} from '../actions';
import { AppConfig } from 'state/config';
import { Draft } from 'immer';
import { createNextState } from '@reduxjs/toolkit';

interface OfflineUserState {
  roles: { role_id: number; role_name: string }[];

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

  email: string | null;
  displayName: string | null;
  username: string | null;

  idir_userid: string | null;
  idir_user_guid: string | null;

  bceid_userid: string | null;
  bceid_user_guid: string | null;
}

interface AuthState {
  initialized: boolean;
  error: boolean;
  authenticated: boolean;

  disrupted: boolean;

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

  offlineUserDialogOpen: boolean;
  offlineUsers: OfflineUserState[];
  workingOffline: boolean;

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
  disrupted: false,
  offlineUserDialogOpen: false,
  offlineUsers: [],
  workingOffline: false,
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
            draftState.disrupted = false;
            draftState.roles = [];
            draftState.accessRoles = [];
            draftState.rolesInitialized = false;
            draftState.extendedInfo = null;
            draftState.displayName = null;
            draftState.email = null;
            draftState.username = 'loggedOut';
            break;
          }
          case AUTH_SAVE_CURRENT_TO_OFFLINE: {
            if (!draftState.authenticated) {

              break;
            }
            let found = draftState.offlineUsers.find(o => o.displayName === draftState.displayName);
            if (found) {
              found.roles = draftState.roles;
              found.extendedInfo = draftState.extendedInfo;
              found.email = draftState.email;
              found.bceid_userid = draftState.bceid_userid;
              found.bceid_user_guid = draftState.bceid_user_guid;
              found.displayName = draftState.displayName;
              found.username = draftState.username;
              found.idir_userid = draftState.idir_userid;
              found.idir_user_guid = draftState.idir_user_guid;
            } else {
              draftState.offlineUsers.push({
                roles: draftState.roles,
                extendedInfo: draftState.extendedInfo,
                email: draftState.email,
                bceid_user_guid: draftState.bceid_user_guid,
                bceid_userid: draftState.bceid_userid,
                displayName: draftState.displayName,
                idir_user_guid: draftState.idir_user_guid,
                idir_userid: draftState.idir_userid,
                username: draftState.username
              });
            }
            break;
          }
          case AUTH_OPEN_OFFLINE_USER_SELECTION_DIALOG:
            draftState.offlineUserDialogOpen = action.payload.state;
            break;

          case AUTH_FORGET_OFFLINE_USER: {
            let foundIndex = draftState.offlineUsers.findIndex(o => o.displayName === action.payload.displayName);
            if (foundIndex == -1) {
              break;
            }
            draftState.offlineUsers.splice(foundIndex, 1);
            break;
          }
          case AUTH_MAKE_OFFLINE_USER_CURRENT: {
            let found = draftState.offlineUsers.find(o => o.displayName === action.payload.displayName);
            if (!found) {
              break;
            }
            draftState.roles = found.roles;
            draftState.extendedInfo = found.extendedInfo;
            draftState.email = found.email;
            draftState.bceid_user_guid = found.bceid_user_guid;
            draftState.bceid_userid = found.bceid_userid;
            draftState.idir_user_guid = found.idir_user_guid;
            draftState.idir_userid = found.idir_userid;
            draftState.username = found.username;
            draftState.displayName = found.displayName;
            draftState.workingOffline = true;
            break;
          }
          case AUTH_INITIALIZE_COMPLETE: {
            draftState.initialized = true;
            draftState.disrupted = false;
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
            draftState.disrupted = false;
            break;
          }
          case AUTH_SET_DISRUPTED: {
            draftState.disrupted = true;
            break;
          }
          case AUTH_SET_RECOVERED_FROM_DISRUPTION: {
            draftState.disrupted = false;
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
      }
    );
  };
};

const selectAuthHeaders: (state) => { authorization: any } = (state) => state.Auth.requestHeaders;
const selectAuth: (state) => AuthState = (state) => state.Auth;

export { createAuthReducer, selectAuthHeaders, selectAuth };
