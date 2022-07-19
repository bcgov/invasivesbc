import { keycloakInstance } from '../sagas/auth';

import {
ACTIVITY_UPDATE_GEO, 
ACTIVITY_UPDATE_AUTOFILL, 
ACTIVITY_UPDATE_PHOTO, 
ACTIVITY_LINK_RECORD, 
ACTIVITY_PERSIST, 
ACTIVITY_SAVE, 
ACTIVITY_SUBMIT, 
ACTIVITY_DELETE 
} from '../actions';

import { AppConfig } from '../config';

class ActivityState {
  initialized: boolean;
  error: boolean;

  persistedActivityData: Object;
  rjsfFormData: Object;
  geometry: any;
  
  //?
  requestHeaders: {
    authorization: string;
  };

  constructor() {
    this.initialized = false;
  }
}


function createActivityReducer(configuration: AppConfig): (ActivityState, AnyAction) => ActivityState {
  return (state = initialState, action) => {
    switch (action.type) {
      case AUTH_SIGNOUT_COMPLETE: {
        return {
          ...state,
          initialized: true,
          authenticated: false,
          roles: [],
          accessRoles: [],
          rolesInitialized: false,
          extendedInfo: null,
          displayName: null,
          email: null,
          username: 'loggedOut'
        };
      }
      case AUTH_INITIALIZE_COMPLETE: {
        return {
          ...state,
          initialized: true,
          ...loadCurrentStateFromKeycloak(state, configuration)
        };
      }
      case AUTH_REQUEST_COMPLETE: {
        return {
          ...state,
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
          extendedInfo: null,
          rolesInitialized: false
        };
      }
      case AUTH_CLEAR_ROLES: {
        return {
          ...state,
          roles: [],
          accessRoles: [],
          extendedInfo: null,
          rolesInitialized: false
        };
      }
      case AUTH_REFRESH_ROLES_COMPLETE: {
        const { all_roles, roles, extendedInfo } = action.payload;
        return {
          ...state,
          roles,
          accessRoles: computeAccessRoles(all_roles, roles),
          extendedInfo,
          rolesInitialized: true
        };
      }
      case AUTH_REFRESH_ROLES_ERROR: {
        return {
          ...state,
          roles: [],
          accessRoles: [],
          extendedInfo: null,
          rolesInitialized: false
        };
      }
      default:
        return state;
    }
  };
}

const selectActivity: (state) => ActivityState = (state) => state.Activity;

export { createActivityReducer, selectActivity};
