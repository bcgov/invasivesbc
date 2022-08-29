import { INewRecordDialogState } from 'components/activities-list/Tables/NewRecordDialog';
import { DocType } from 'constants/database';
import { USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS, USER_SETTINGS_ADD_RECORD_SET_SUCCESS, USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS, USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS, USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS, USER_SETTINGS_SET_BOUNDARIES_REQUEST, USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS, USER_SETTINGS_SET_SELECTED_RECORD_REQUEST } from '../actions';

import { AppConfig } from '../config';

class UserSettingsState {
  initialized: boolean;
  error: boolean;

  activeActivity: string;

  newRecordDialogState: INewRecordDialogState;
  recordSets: [
    {
      advancedFilters: [],
      color: string,
      drawOrder: number,
      expanded: boolean,
      isSelected: boolean,
      mapToggle: boolean,
      recordSetName: string,
      recordSetType: string,
      searchBoundary: any
    }
  ];
  selectedRecord: {
    type: DocType,
    description: string,
    id: any,
    isIAPP: boolean
  }
  boundaries: [
    {
      geos: [],
      id: number,
      name: string,
      server_id: any
    }
  ];

  constructor() {
    this.initialized = false;
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
          recordSets: action.payload.recordSets
        };
      }
      case USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS: {
        return {
          ...state,
          activeActivity: action.payload.activeActivity
        };
      }
      case USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS: {
        return {
          ...state,
          newRecordDialogState: action.payload
        }
      }
      case USER_SETTINGS_ADD_RECORD_SET_SUCCESS: {
        return {
          ...state, recordSets: action.payload.recordSets
        };
      }
      case USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS: {
        return {
          ...state, recordSets: action.payload.recordSets
        }
      }
      case USER_SETTINGS_SET_SELECTED_RECORD_REQUEST: {
        return {
          ...state, selectedRecord: action.payload.selectedRecord
        }
      }
      case USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS: {
        return {
          ...state, recordSets: action.payload.recordSets
        }
      }
      case USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS: {
        return {
          ...state, recordSets: action.payload.recordSets
        }
      }
      case USER_SETTINGS_SET_BOUNDARIES_REQUEST: {
        return {
          ...state, boundaries: action.payload.boundaries
        }
      }
      

      default:
        return state;
    }
  };
}

const selectUserSettings: (state) => UserSettingsState = (state) => state.UserSettings;

export { createUserSettingsReducer, selectUserSettings };
