import { createNextState } from '@reduxjs/toolkit';
import { Md5 } from 'ts-md5';

import {
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_GET_REQUEST,
  CLOSE_NEW_RECORD_MENU,
  GET_API_DOC_SUCCESS,
  IAPP_GET_SUCCESS,
  MAP_TOGGLE_WHATS_HERE,
  OPEN_NEW_RECORD_MENU,
  RECORDSET_ADD_FILTER,
  RECORDSET_CLEAR_FILTERS,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_SET_SORT,
  RECORDSET_UPDATE_FILTER,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS,
  USER_SETTINGS_ADD_RECORD_SET,
  USER_SETTINGS_DELETE_BOUNDARY_SUCCESS,
  USER_SETTINGS_DELETE_KML_SUCCESS,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS,
  USER_SETTINGS_REMOVE_RECORD_SET,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS,
  USER_SETTINGS_SET_API_ERROR_DIALOG,
  USER_SETTINGS_SET_BOUNDARIES_SUCCESS,
  USER_SETTINGS_SET_DARK_THEME,
  USER_SETTINGS_SET_MAP_CENTER_SUCCESS,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS,
  USER_SETTINGS_SET_RECORDSET,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

export function getUuid() {
  return Math.random() + Date.now().toString();
}

interface UserSettingsState {
  initialized: boolean;
  error: boolean;

  activeActivity: string | null;
  activeActivityDescription: string | null;
  activeIAPP: string | null;
  apiDocsWithViewOptions: object | null;
  apiDocsWithSelectOptions: object | null;

  mapCenter: [number, number];
  newRecordDialogState: any;

  recordSets: {
    [key: number]: {
      tableFilters?: any;
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
    };
  };
  recordsExpanded: boolean;

  boundaries: {
    geos: [];
    id: number;
    name: string;
    server_id: any;
  }[];

  darkTheme: boolean;
}

const initialState: UserSettingsState = {
  activeActivity: null,
  activeActivityDescription: null,
  activeIAPP: null,

  apiDocsWithSelectOptions: null,
  apiDocsWithViewOptions: null,

  boundaries: [],
  error: false,
  recordSets: {},
  recordsExpanded: false,
  initialized: false,
  darkTheme: localStorage.getItem('USER_SETTINGS_DARK_THEME')
    ? JSON.parse(localStorage.getItem('USER_SETTINGS_DARK_THEME'))
    : false,
  mapCenter: [55, -128],
  newRecordDialogState: {
    recordCategory: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordCategory || '',
    recordType: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordType || '',
    recordSubtype: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordSubtype || ''
  }
};

function createUserSettingsReducer(configuration: AppConfig): (UserSettingsState, AnyAction) => UserSettingsState {
  return (state = initialState, action) => {
    return createNextState(state, (draftState) => {
      switch (action.type) {
        case ACTIVITY_GET_REQUEST: {
          draftState.activeActivity = action.payload.activityID;
          break;
        }
        case ACTIVITY_DELETE_SUCCESS: {
          draftState.activeActivity = '';
          draftState.activeActivityDescription = '';
          break;
        }
        case GET_API_DOC_SUCCESS: {
          draftState.apiDocsWithViewOptions = action.payload.apiDocsWithViewOptions;
          draftState.apiDocsWithSelectOptions = action.payload.apiDocsWithSelectOptions;
          break;
        }
        case MAP_TOGGLE_WHATS_HERE: {
          draftState.recordsExpanded = action.payload?.toggle ? false : draftState.recordsExpanded;
          break;
        }
        case OPEN_NEW_RECORD_MENU: {
          draftState.newRecordDialogueOpen = true;
          break;
        }
        case CLOSE_NEW_RECORD_MENU: {
          draftState.newRecordDialogueOpen = false;
          break;
        }
        case IAPP_GET_SUCCESS: {
          draftState.activeIAPP = action.payload.iapp?.site_id;
          break;
        }
        case ACTIVITY_CREATE_SUCCESS: {
          draftState.newRecordDialogueOpen = false;
          break;
        }
        case RECORDSET_ADD_FILTER: {
          switch (action.payload.filterType) {
            case 'tableFilter':
              if (!draftState.recordSets[action.payload.setID]?.tableFilters) {
                draftState.recordSets[action.payload.setID].tableFilters = [];
              }
              draftState.recordSets[action.payload.setID]?.tableFilters.push({
                id: getUuid(),
                field: action.payload.field,
                filterType: action.payload.filterType,
                operator: action.payload.operator ? action.payload.operator : 'CONTAINS',
                filter: action.payload.filter ? action.payload.filter : ''
              });
              break;
            default:
              break;
          }
          localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: { ...draftState.recordSets } }));
          break;
        }
        case RECORDSET_SET_SORT: {
          draftState.recordSets[action.payload.setID].sortOrder  = action.payload.sortColumn === draftState.recordSets[action.payload.setID].sortColumn ? draftState.recordSets[action.payload.setID].sortOrder === 'ASC' ? 'DESC' : 'ASC' : 'ASC';
          draftState.recordSets[action.payload.setID].sortColumn = action.payload.sortColumn;
          break;
        }
        case RECORDSET_REMOVE_FILTER: {
          const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
            (filter) => filter.id === action.payload.filterID
          );
          draftState.recordSets[action.payload.setID]?.tableFilters.splice(index, 1);

          draftState.recordSets[action.payload.setID].tableFiltersPreviousHash =
            draftState.recordSets[action.payload.setID]?.tableFiltersHash;

          const tableFiltersNotBlank = draftState.recordSets[action.payload.setID]?.tableFilters.filter(
            (filter) => filter.filter !== ''
          );

          draftState.recordSets[action.payload.setID].tableFiltersHash = Md5.hashStr(
            JSON.stringify(tableFiltersNotBlank)
          );
          localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: { ...draftState.recordSets } }));
          break;
        }
        case RECORDSET_UPDATE_FILTER: {
          if (!draftState.recordSets[action.payload.setID]?.tableFilters) {
            draftState.recordSets[action.payload.setID].tableFilters = [];
          }
          draftState.recordSets[action.payload.setID]?.tableFilters.filter(
            (filter) => filter.id !== action.payload.filterID
          );

          const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
            (filter) => filter.id === action.payload.filterID
          );
          if (index !== -1)
            if (action.payload.filterType) {
              draftState.recordSets[action.payload.setID].tableFilters[index].filterType = action.payload.filterType;
            }

          if (
            action.payload.filterType === 'spatialFilterDrawn' ||
            action.payload.filterType === 'spatialFilterUploaded'
          ) {
            delete draftState.recordSets[action.payload.setID].tableFilters[index].field;
            if (!action.payload.operator) {
              draftState.recordSets[action.payload.setID].tableFilters[index].operator = 'CONTAINED IN';
            }
            if (!action.payload.filter) {
              delete draftState.recordSets[action.payload.setID].tableFilters[index].filter;
            }
          }

          if (action.payload.field) {
            const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
              (filter) => filter.id === action.payload.filterID
            );
            if (index !== -1)
              draftState.recordSets[action.payload.setID].tableFilters[index].field = action.payload.field;
          }

          if (action.payload.operator) {
            const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
              (filter) => filter.id === action.payload.filterID
            );
            if (index !== -1)
              draftState.recordSets[action.payload.setID].tableFilters[index].operator = action.payload.operator;
          }

          //re used for spatial filters
          if (action.payload.filter !== undefined) {
            const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
              (filter) => filter.id === action.payload.filterID
            );
            if (index !== -1)
              draftState.recordSets[action.payload.setID].tableFilters[index].filter = action.payload.filter;
          }

          const tableFiltersNotBlank = draftState.recordSets[action.payload.setID]?.tableFilters.filter(
            (filter) => filter.filter !== ''
          );

          draftState.recordSets[action.payload.setID].tableFiltersPreviousHash =
            draftState.recordSets[action.payload.setID]?.tableFiltersHash;
          draftState.recordSets[action.payload.setID].tableFiltersHash = Md5.hashStr(
            JSON.stringify(tableFiltersNotBlank)
          );
          localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: { ...draftState.recordSets } }));
          break;
        }
        case RECORDSET_CLEAR_FILTERS: {
          if (!(action.payload.setID === '1')) {
            draftState.recordSets[action.payload.setID].tableFilters = [];
          } else {
            draftState.recordSets[action.payload.setID].tableFilters = [
              {
                id: '1',
                field: 'form_status',
                filterType: 'tableFilter',
                filter: 'Draft'
              }
            ];
          }
          localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: { ...draftState.recordSets } }));
          break;
        }
        case USER_SETTINGS_GET_INITIAL_STATE_SUCCESS: {
          if (!draftState.activeActivity) draftState.activeActivity = action.payload.activeActivity;

          if (!draftState.activeActivityDescription)
            draftState.activeActivityDescription = action.payload.activeActivityDescription;

          if (!draftState.activeIAPP) draftState.activeIAPP = action.payload.activeIAPP;

          draftState.recordSets = { ...action.payload.recordSets };
          draftState.recordsExpanded = action.payload.recordsExpanded;
          break;
        }
        case USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS: {
          draftState.activeActivity = action.payload.id;
          draftState.activeActivityDescription = action.payload.description;
          break;
        }
        case USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS: {
          draftState.activeIAPP = action.payload.activeIAPP;
          break;
        }
        case USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS: {
          draftState.newRecordDialogState = action.payload;
          break;
        }
        case USER_SETTINGS_ADD_RECORD_SET: {
          draftState.recordSets[Object.keys(draftState.recordSets).length + 1] = {
            tableFilters: [],
            color: 'blue',
            drawOrder: 0,
            mapToggle: false,
            recordSetName: 'New Recordset - ' + action.payload.recordSetType,
            recordSetType: action.payload.recordSetType
          };
          break;
        }
        case USER_SETTINGS_REMOVE_RECORD_SET: {
          delete draftState.recordSets[action.payload.setID];
          break;
        }
        case USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS: {
          draftState.recordSets = { ...action.payload.recordSets };
          break;
        }

        //MW: these are all wrong we shouldn't clobber all sets from the dispatching components copy of state
        case USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS: {
          draftState.recordSets = { ...action.payload.recordSets };
          break;
        }
        case USER_SETTINGS_SET_BOUNDARIES_SUCCESS: {
          draftState.boundaries = action.payload.boundaries;
          break;
        }
        case USER_SETTINGS_DELETE_BOUNDARY_SUCCESS: {
          draftState.boundaries = draftState.boundaries.filter((boundary) => boundary.id !== action.payload.id);
          break;
        }
        case USER_SETTINGS_DELETE_KML_SUCCESS: {
          draftState.boundaries = draftState.boundaries?.filter(
            (boundary) => boundary.server_id !== action.payload.server_id
          );
          break;
        }
        case USER_SETTINGS_SET_RECORDSET: {
          Object.keys(action.payload.updatedSet).forEach((key) => {
            draftState.recordSets[action.payload.setName][key] = action.payload.updatedSet[key];
          });
          draftState.recordSets[action.payload.setName].labelToggle = draftState.recordSets[action.payload.setName].labelToggle && draftState.recordSets[action.payload.setName].mapToggle || false;
          break;
        }
        case USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS: {
          draftState.recordsExpanded = !draftState.recordsExpanded;
          break;
        }
        case USER_SETTINGS_SET_DARK_THEME: {
          draftState.darkTheme = action.payload.enabled;
          break;
        }
        case USER_SETTINGS_SET_MAP_CENTER_SUCCESS: {
          draftState.mapCenter = action.payload.center;
          break;
        }
        case USER_SETTINGS_SET_API_ERROR_DIALOG: {
          draftState.APIErrorDialog = action.payload.APIErrorDialog;
          break;
        }
        default:
          break;
      }
    }) as unknown as UserSettingsState;
  };
}

const selectUserSettings: (state) => UserSettingsState = (state) => state.UserSettings;

export { createUserSettingsReducer, selectUserSettings };
