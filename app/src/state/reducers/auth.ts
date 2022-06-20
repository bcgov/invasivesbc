import { keycloakInstance } from '../sagas/auth';

import {
  AUTH_CLEAR_ROLES,
  AUTH_INITIALIZE_COMPLETE,
  AUTH_REFRESH_ROLES_COMPLETE,
  AUTH_REFRESH_ROLES_ERROR,
  AUTH_REFRESH_ROLES_REQUEST,
  AUTH_REQUEST_COMPLETE,
  AUTH_UPDATE_TOKEN_STATE
} from '../actions';

import { AppConfig } from '../config';

class AuthState {
  initialized: boolean;
  error: boolean;
  authenticated: boolean;

  email: string;
  displayName: string;
  userId: 'notImplemented';

  requestHeaders: {
    authorization: string;
  };

  roles: string[];
  accessRoles: string[];
  rolesInitialized: false;

  constructor() {
    this.initialized = false;
    this.roles = [];
    this.accessRoles = [];
    this.rolesInitialized = false;
  }
}

function computeAccessRoles(all_roles: { role_name: string }[], roles: string[]): string[] {
  const accessRoles = [];

  for (const role of roles) {
    accessRoles.push(role);

    if (role === 'master_administrator') {
      accessRoles.push(...all_roles.map(r => r.role_name));
    }
    if (role === 'indigenous_riso_manager_both') {
      accessRoles.push(...all_roles.filter((r) => r.role_name.includes('indigenous_riso')).map(r => r.role_name));
    }
    if (role === 'indigenous_riso_manager_plants') {
      accessRoles.push(...all_roles.filter((r) => r.role_name.includes('indigenous_riso_staff_plants')).map(r => r.role_name));
    }
    if (role === 'administrator_plants') {
      accessRoles.push(...all_roles.filter((r) => r.role_name.includes('plants')).map(r => r.role_name));
    }
  }
  const uniqueArray = accessRoles.filter((thing, index, self) => {
    return index === self.findIndex((t) => t.role_name === thing.role_name);
  });
  return uniqueArray.sort((a, b) => {
    return a.role_id < b.role_id ? -1 : a.role_id > b.role_id ? 1 : 0;
  });
}

const initialState = new AuthState();

function loadCurrentStateFromKeycloak(previousState: AuthState, config: AppConfig): object {
  let displayName = 'User';
  const preferenceOrder = ['preferred_username', 'name', 'given_name', 'sub'];

  for (const p of preferenceOrder) {
    if (keycloakInstance.idTokenParsed) {
      if (
        p in keycloakInstance.idTokenParsed &&
        keycloakInstance.idTokenParsed[p] !== null &&
        keycloakInstance.idTokenParsed[p].length > 0
      ) {
        displayName = keycloakInstance.idTokenParsed[p];
        break;
      }
    }
  }
  let username = null;
  let email = '';

  if (keycloakInstance.idTokenParsed) {
    username = keycloakInstance.idTokenParsed['preferred_username'];
    displayName = `${keycloakInstance.idTokenParsed['first_name']} ${keycloakInstance.idTokenParsed['last_name']}`;
    email = keycloakInstance.idTokenParsed['email'];
  }

  const requestHeaders = {
    authorization: `Bearer ${keycloakInstance.idToken}`
  };

  return {
    displayName,
    requestHeaders,
    username,
    email
  };
}

function createAuthReducer(configuration: AppConfig): (AuthState, AnyAction) => AuthState {
  return (state = initialState, action) => {
    switch (action.type) {
      case AUTH_INITIALIZE_COMPLETE: {
        const { authenticated } = action.payload;
        return {
          ...state,
          initialized: true,
          authenticated,
          ...loadCurrentStateFromKeycloak(state, configuration)
        };
      }
      case AUTH_REQUEST_COMPLETE: {
        const { authenticated } = action.payload;
        return {
          ...state,
          authenticated,
          ...loadCurrentStateFromKeycloak(state, configuration)
        };
      }
      case AUTH_UPDATE_TOKEN_STATE: {
        return {
          ...state,
          ...loadCurrentStateFromKeycloak(state, configuration)
        };
      }
      case AUTH_REFRESH_ROLES_REQUEST: {
        return {
          ...state,
          roles: [],
          accessRoles: [],
          rolesInitialized: false
        };
      }
      case AUTH_CLEAR_ROLES: {
        return {
          ...state,
          roles: [],
          accessRoles: [],
          rolesInitialized: false
        };
      }
      case AUTH_REFRESH_ROLES_COMPLETE: {
        const { all_roles, roles } = action.payload;
        return {
          ...state,
          roles,
          accessRoles: computeAccessRoles(all_roles, roles),
          rolesInitialized: true
        };
      }
      case AUTH_REFRESH_ROLES_ERROR: {
        return {
          ...state,
          roles: [],
          accessRoles: [],
          rolesInitialized: false
        };
      }
      default:
        return state;
    }
  };
}

const selectAuthHeaders: (state) => { authorization: any } = (state) => state.Auth.requestHeaders;
const selectAuth: (state) => (AuthState) = (state) => state.Auth;

export { createAuthReducer, selectAuthHeaders, selectAuth };
