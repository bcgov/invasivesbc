import {
  USER_SETTINGS_GET_INITIAL_STATE_REQUEST,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class UserSettingsState {
  initialized: boolean;
  error: boolean;

  activeActivity: string;
  recordSets: [];

  constructor() {
    this.initialized = false;
  }
}

const initialState = new UserSettingsState();

function createUserSettingsReducer(configuration: AppConfig): (UserSettingsState, AnyAction) => UserSettingsState {
  return (state = initialState, action) => {
    switch (action.type) {
      case USER_SETTINGS_GET_INITIAL_STATE_SUCCESS: {
        return {
          ...state,
          activeActivity: action.payload.activeActivity
        };
      }
      case USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS: {
        return {
          ...state,
          activeActivity: action.payload.activeActivity
        };
      }
      default:
        return state;
    }
  };
}

const selectUserSettings: (state) => UserSettingsState = (state) => state.UserSettings;

export { createUserSettingsReducer, selectUserSettings };
