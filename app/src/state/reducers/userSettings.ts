import { INewRecordDialogState } from 'components/activities-list/Tables/NewRecordDialog';
import { DocType } from 'constants/database';
import {
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS,
  USER_SETTINGS_ADD_RECORD_SET_SUCCESS,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS,
  USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_BOUNDARIES_REQUEST,
  USER_SETTINGS_SET_DARK_THEME,
  USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS,
  USER_SETTINGS_SET_RECORD_SET_SUCCESS,
  USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class UserSettingsState {
  initialized: boolean;
  error: boolean;

  activeActivity: string;
  activeActivityDescription: string;
  activeIAPP: string;

  newRecordDialogState: INewRecordDialogState;
  recordSets: [
    {
      advancedFilters: [];
      gridFilters: [];
      color: string;
      drawOrder: number;
      expanded: boolean;
      isSelected: boolean;
      mapToggle: boolean;
      recordSetName: string;
      recordSetType: string;
      searchBoundary: {
        geos: [];
        id: number;
        name: string;
        server_id: any;
      };
    }
  ];
  recordsExpanded: boolean;
  boundaries: [
    {
      geos: [];
      id: number;
      name: string;
      server_id: any;
    }
  ];

  darkTheme: boolean;

  constructor() {
    this.initialized = false;
    this.darkTheme = localStorage.getItem('USER_SETTINGS_DARK_THEME')
      ? JSON.parse(localStorage.getItem('USER_SETTINGS_DARK_THEME'))
      : false;
    console.log('this.darkTheme', this.darkTheme);
    this.newRecordDialogState = {
      recordCategory:
        JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordCategory || '',
      recordType: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordType || '',
      recordSubtype: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordSubtype || ''
    };
  }
}

const initialState = new UserSettingsState();

function createUserSettingsReducer(configuration: AppConfig): (UserSettingsState, AnyAction) => UserSettingsState {
  return (state = initialState, action) => {
    switch (action.type) {
      case USER_SETTINGS_GET_INITIAL_STATE_SUCCESS: {
        return {
          ...state,
          activeActivity: action.payload.activeActivity,
          activeIAPP: action.payload.activeIAPP,
          recordSets: action.payload.recordSets,
          recordsExpanded: action.payload.recordsExpanded
        };
      }
      case USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS: {
        return {
          ...state,
          activeActivity: action.payload.id,
          activeActivityDescription: action.payload.description
        };
      }
      case USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS: {
        return {
          ...state,
          activeIAPP: action.payload.activeIAPP
        };
      }
      case USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS: {
        return {
          ...state,
          newRecordDialogState: action.payload
        };
      }
      case USER_SETTINGS_ADD_RECORD_SET_SUCCESS: {
        return {
          ...state,
          recordSets: action.payload.recordSets
        };
      }
      case USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS: {
        return {
          ...state,
          recordSets: action.payload.recordSets
        };
      }
      case USER_SETTINGS_SET_SELECTED_RECORD_REQUEST: {
        return {
          ...state,
          selectedRecord: action.payload.selectedRecord
        };
      }
      case USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS: {
        return {
          ...state,
          recordSets: action.payload.recordSets
        };
      }
      case USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS: {
        return {
          ...state,
          recordSets: action.payload.recordSets
        };
      }
      case USER_SETTINGS_SET_BOUNDARIES_REQUEST: {
        return {
          ...state,
          boundaries: action.payload.boundaries
        };
      }
      case USER_SETTINGS_SET_RECORD_SET_SUCCESS: {
        return {
          ...state,
          recordSets: action.payload.recordSets
        };
      }
      case USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS: {
        return {
          ...state,
          recordsExpanded: !state.recordsExpanded
        };
      }
      case USER_SETTINGS_SET_DARK_THEME: {
        return {
          ...state,
          darkTheme: action.payload.enabled
        };
      }
      default:
        return state;
    }
  };
}

const selectUserSettings: (state) => UserSettingsState = (state) => state.UserSettings;

export { createUserSettingsReducer, selectUserSettings };
