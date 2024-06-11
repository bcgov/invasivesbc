import { Draft } from 'immer';
import { createNextState } from '@reduxjs/toolkit';
import {
  AUTH_CLEAR_ROLES,
  AUTH_FORGET_OFFLINE_USER,
  AUTH_INITIALIZE_COMPLETE,
  AUTH_MAKE_OFFLINE_USER_CURRENT,
  AUTH_OPEN_OFFLINE_USER_SELECTION_DIALOG,
  AUTH_REFRESH_ROLES_COMPLETE,
  AUTH_REFRESH_ROLES_ERROR,
  AUTH_REFRESH_ROLES_REQUEST,
  AUTH_REQUEST_COMPLETE,
  AUTH_SAVE_CURRENT_TO_OFFLINE,
  AUTH_SET_DISRUPTED,
  AUTH_SET_RECOVERED_FROM_DISRUPTION,
  AUTH_SIGNOUT_COMPLETE,
  AUTH_UPDATE_TOKEN_STATE
} from '../actions';
import { AppConfig } from 'state/config';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';

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

export interface AuthState {
  [MIGRATION_VERSION_KEY]: number;

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
  const accessRoles: { role_id: number; role_name: string }[] = [];

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
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,
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
  roles: [],
  rolesInitialized: false,
  username: null,
  v2BetaAccess: false
};

function loadCurrentStateFromIdToken(idToken): object {
  let displayName = 'User';
  let username: null | string = null;
  let email = '';
  let bceid_userid = '';
  let idir_userid = '';
  let bceid_user_guid = '';
  let idir_user_guid = '';

  const authenticated = !!idToken;

  if (authenticated) {
    try {
      const parsedToken = JSON.parse(
        decodeURIComponent(
          atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        )
      );
      if (parsedToken['idir_username']) idir_userid = parsedToken['idir_username'];
      if (parsedToken['idir_user_guid']) idir_user_guid = parsedToken['idir_user_guid'];
      if (parsedToken['bceid_username']) bceid_userid = parsedToken['bceid_username'];
      if (parsedToken['bceid_user_guid']) bceid_user_guid = parsedToken['bceid_user_guid'];
      username = idir_userid ? idir_userid.toLowerCase() + '@idir' : bceid_userid.toLowerCase() + '@bceid-business';
      if (
        'display_name' in parsedToken &&
        parsedToken['display_name'] !== null &&
        parsedToken['display_name'].length > 0
      ) {
        // BCEid token has this attribute set
        displayName = parsedToken['display_name'];
      } else {
        displayName = `${parsedToken['given_name']} ${parsedToken['family_name']}`;
      }
      email = parsedToken['email'];
    } catch (e) {
      console.error(e);
      // token parse error
    }
  }

  return {
    authenticated,
    displayName,
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
      if (AUTH_SIGNOUT_COMPLETE.match(action)) {
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
      }
      if (AUTH_SAVE_CURRENT_TO_OFFLINE.match(action)) {
        if (draftState.authenticated) {
          const found = draftState.offlineUsers.find((o) => o.displayName === draftState.displayName);
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
        }
      }
      if (AUTH_OPEN_OFFLINE_USER_SELECTION_DIALOG.match(action))
        draftState.offlineUserDialogOpen = action.payload.state;

      if (AUTH_FORGET_OFFLINE_USER.match(action)) {
        const foundIndex = draftState.offlineUsers.findIndex((o) => o.displayName === action.payload.displayName);
        if (foundIndex !== -1) {
          draftState.offlineUsers.splice(foundIndex, 1);
        }
      }
      if (AUTH_MAKE_OFFLINE_USER_CURRENT.match(action)) {
        const found = draftState.offlineUsers.find((o) => o.displayName === action.payload.displayName);
        if (found) {
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
        }
      }
      if (AUTH_INITIALIZE_COMPLETE.match(action)) {
        draftState.initialized = true;
        draftState.disrupted = false;
        const currentIdToken = action.payload.idToken;
        Object.keys(loadCurrentStateFromIdToken(currentIdToken)).forEach((key) => {
          draftState[key] = loadCurrentStateFromIdToken(currentIdToken)[key];
        });
      }
      if (AUTH_REQUEST_COMPLETE.match(action)) {
        const currentIdToken = action.payload.idToken;
        Object.keys(loadCurrentStateFromIdToken(currentIdToken)).forEach((key) => {
          draftState[key] = loadCurrentStateFromIdToken(currentIdToken)[key];
        });
      }
      if (AUTH_UPDATE_TOKEN_STATE.match(action)) {
        const currentIdToken = action.payload.idToken;
        Object.keys(loadCurrentStateFromIdToken(currentIdToken)).forEach((key) => {
          draftState[key] = loadCurrentStateFromIdToken(currentIdToken)[key];
        });
        draftState.disrupted = false;
      }
      if (AUTH_SET_DISRUPTED.match(action)) {
        draftState.disrupted = true;
      }
      if (AUTH_SET_RECOVERED_FROM_DISRUPTION.match(action)) {
        draftState.disrupted = false;
      }
      if (AUTH_REFRESH_ROLES_REQUEST.match(action)) {
        draftState.rolesInitialized = false;
        draftState.roles = [];
        draftState.accessRoles = [];
        draftState.extendedInfo = null;
      }
      if (AUTH_CLEAR_ROLES.match(action)) {
        draftState.rolesInitialized = false;
        draftState.roles = [];
        draftState.accessRoles = [];
        draftState.extendedInfo = null;
      }
      if (AUTH_REFRESH_ROLES_COMPLETE.match(action)) {
        const { all_roles, roles, extendedInfo, v2BetaAccess } = action.payload;
        draftState.roles = roles;
        draftState.accessRoles = computeAccessRoles(all_roles, roles);
        draftState.extendedInfo = extendedInfo;
        draftState.rolesInitialized = true;
        draftState.v2BetaAccess = v2BetaAccess;
      }
      if (AUTH_REFRESH_ROLES_ERROR.match(action)) {
        draftState.rolesInitialized = false;
        draftState.roles = [];
        draftState.accessRoles = [];
        draftState.extendedInfo = null;
      }
    });
  };
}

const selectAuth: (state) => AuthState = (state) => state.Auth;

export { createAuthReducer, selectAuth };
