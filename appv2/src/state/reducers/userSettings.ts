import { createNextState } from '@reduxjs/toolkit'
//import { Uuid, UuidOptions } from 'node-ts-uuid';
//import  process from 'process'
//window.process = process

import {
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_GET_REQUEST,
  GET_API_DOC_SUCCESS,
  MAP_TOGGLE_WHATS_HERE,
  RECORDSET_ADD_FILTER,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_UPDATE_FILTER,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS,
  USER_SETTINGS_ADD_RECORD_SET_SUCCESS,
  USER_SETTINGS_CLEAR_RECORD_SET_FILTERS_SUCCESS,
  USER_SETTINGS_DELETE_BOUNDARY_SUCCESS,
  USER_SETTINGS_DELETE_KML_SUCCESS,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS,
  USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS,
  USER_SETTINGS_SET_API_ERROR_DIALOG,
  USER_SETTINGS_SET_BOUNDARIES_SUCCESS,
  USER_SETTINGS_SET_DARK_THEME,
  USER_SETTINGS_SET_MAP_CENTER_SUCCESS,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS,
  USER_SETTINGS_SET_RECORD_SET_SUCCESS,
  USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS
} from '../actions';

import { AppConfig } from '../config';
import { createNextState } from '@reduxjs/toolkit';


/*const options: UuidOptions = {
  length: 50,
};
*/

export function getUuid() {
  const uuid: string = Math.random() + Date.now().toString();
  return uuid;
}

class UserSettingsState {
  initialized: boolean;
  error: boolean;

  activeActivity: string;
  activeActivityDescription: string;
  activeIAPP: string;
  apiDocsWithViewOptions: object;
  apiDocsWithSelectOptions: object;

  mapCenter: [number, number];
  //newRecordDialogState: INewRecordDialogState;
  newRecordDialogState: any;
  APIErrorDialog: any;
  recordSets: [
    {
      tableFilters?: any;
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
    this.mapCenter = [55, -128];
    this.newRecordDialogState = {
      recordCategory:
        JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordCategory || '',
      recordType: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordType || '',
      recordSubtype: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordSubtype || ''
    };
    this.APIErrorDialog = {
      dialogActions: [],
      dialogOpen: false,
      dialogTitle: '',
      dialogContentText: ``
    };
  }
}

const initialState = new UserSettingsState();

function createUserSettingsReducer(configuration: AppConfig): (UserSettingsState, AnyAction) => UserSettingsState {
  return (state = initialState, action) => {
    switch (action.type) {
      case ACTIVITY_GET_REQUEST: {
        return {
          ...state,
          activeActivity: action.payload.activityID
        };
      }
      case ACTIVITY_DELETE_SUCCESS: {
        return {
          ...state,
          activeActivity: '',
          activeActivityDescription: ''
        };
      }
      case GET_API_DOC_SUCCESS: {
        return {
          ...state,
          apiDocsWithViewOptions: action.payload.apiDocsWithViewOptions,
          apiDocsWithSelectOptions: action.payload.apiDocsWithSelectOptions
        };
      }
      case MAP_TOGGLE_WHATS_HERE: {
        return { ...state, recordsExpanded: action.payload?.toggle ? false : state.recordsExpanded };
      }
      case RECORDSET_ADD_FILTER: {
        const nextState = createNextState(state, (draftState) => {
          switch (action.payload.filterType) {
            case 'tableFilter':
              if(!draftState.recordSets[action.payload.setID]?.tableFilters)
              {
                draftState.recordSets[action.payload.setID].tableFilters = []
              }
              draftState.recordSets[action.payload.setID]?.tableFilters.push({
                id: getUuid(),
                field: action.payload.field,
                fieldPath: action.payload.fieldPath,
                operator: action.payload.operator,
                filter: action.payload.filter
              });
              break;
            default:
              break;
          }
        });
        return nextState;
      }
      case RECORDSET_REMOVE_FILTER: {
        const nextState = createNextState(state, (draftState) => {
          switch (action.payload.filterType) {
            case 'tableFilter':
                const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
                  (filter) => filter.id === action.payload.filterID
                );

                draftState.recordSets[action.payload.setID]?.tableFilters.splice(index, 1)
              break;
            default:
              break;
          }
        });
        return nextState;
      }
      case RECORDSET_UPDATE_FILTER: {
        const nextState = createNextState(state, (draftState) => {
          switch (action.payload.filterType) {
            case 'tableFilter':
              if(!draftState.recordSets[action.payload.setID]?.tableFilters)
              {
                draftState.recordSets[action.payload.setID].tableFilters = []
              }
              draftState.recordSets[action.payload.setID]?.tableFilters.filter(
                (filter) => filter.id !== action.payload.filterID
              );

              if (action.payload.field) {
                const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
                  (filter) => filter.id === action.payload.filterID
                );
                if (index !== -1) draftState.recordSets[action.payload.setID].tableFilters[index].field = action.payload.field;
              }


              if(action.payload.operator)
              {
                const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
                  (filter) => filter.id === action.payload.filterID
                );
                if (index !== -1) draftState.recordSets[action.payload.setID].tableFilters[index].operator = action.payload.operator;
              }

              if (action.payload.filter !== undefined) {
                const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
                  (filter) => filter.id === action.payload.filterID
                );
                if (index !== -1)
                  draftState.recordSets[action.payload.setID].tableFilters[index].filter = action.payload.filter;
              }
              break;
            default:
              break;
          }
        });
        return nextState;
      }

      case USER_SETTINGS_GET_INITIAL_STATE_SUCCESS: {
        const nextState = createNextState(state, (draftState) => {
          if (!draftState.activeActivity) draftState.activeActivity = action.payload.activeActivity;

          if (!draftState.activeActivityDescription)
            draftState.activeActivityDescription = action.payload.activeActivityDescription;

          if (!draftState.activeIAPP) draftState.activeIAPP = action.payload.activeIAPP;

          draftState.recordSets = { ...action.payload.recordSets };
          draftState.recordsExpanded = action.payload.recordsExpanded;
        });
        return nextState;
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
          recordSets: { ...action.payload.recordSets }
        };
      }
      case USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS: {
        return {
          ...state,
          recordSets: { ...action.payload.recordSets }
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
          recordSets: { ...action.payload.recordSets }
        };
      }
      case USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS: {
        return {
          ...state,
          recordSets: { ...action.payload.recordSets }
        };
      }
      case USER_SETTINGS_SET_BOUNDARIES_SUCCESS: {
        return {
          ...state,
          boundaries: action.payload.boundaries
        };
      }
      case USER_SETTINGS_DELETE_BOUNDARY_SUCCESS: {
        const boundaries = state.boundaries.filter((boundary) => boundary.id !== action.payload.id);
        return {
          ...state,
          boundaries: boundaries
        };
      }
      case USER_SETTINGS_DELETE_KML_SUCCESS: {
        const boundaries = state.boundaries.filter((boundary) => boundary.server_id !== action.payload.server_id);
        return {
          ...state,
          boundaries: boundaries
        };
      }
      case USER_SETTINGS_SET_RECORD_SET_SUCCESS: {
        return {
          ...state,
          recordSets: { ...action.payload.recordSets }
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
      case USER_SETTINGS_SET_MAP_CENTER_SUCCESS: {
        return {
          ...state,
          mapCenter: action.payload.center
        };
      }
      case USER_SETTINGS_CLEAR_RECORD_SET_FILTERS_SUCCESS: {
        return {
          ...state,
          recordSets: { ...action.payload.recordSets }
        };
      }
      case USER_SETTINGS_SET_API_ERROR_DIALOG: {
        return {
          ...state,
          APIErrorDialog: action.payload.APIErrorDialog
        };
      }
      default:
        return state;
    }
  };
}

const selectUserSettings: (state) => UserSettingsState = (state) => state.UserSettings;

export { createUserSettingsReducer, selectUserSettings };
