import { calculateGeometryArea } from 'utils/geometryHelpers';
import {
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  ACTIVITY_UPDATE_GEO_FAILURE,
  ACTIVITY_UPDATE_AUTOFILL_REQUEST,
  ACTIVITY_UPDATE_AUTOFILL_SUCCESS,
  ACTIVITY_UPDATE_AUTOFILL_FAILURE,
  ACTIVITY_UPDATE_PHOTO_REQUEST,
  ACTIVITY_UPDATE_PHOTO_SUCCESS,
  ACTIVITY_UPDATE_PHOTO_FAILURE,
  ACTIVITY_LINK_RECORD_REQUEST,
  ACTIVITY_LINK_RECORD_SUCCESS,
  ACTIVITY_LINK_RECORD_FAILURE,
  ACTIVITY_PERSIST_REQUEST,
  ACTIVITY_PERSIST_SUCCESS,
  ACTIVITY_PERSIST_FAILURE,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_SAVE_FAILURE,
  ACTIVITY_SUBMIT_REQUEST,
  ACTIVITY_SUBMIT_SUCCESS,
  ACTIVITY_SUBMIT_FAILURE,
  ACTIVITY_DELETE_REQUEST,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_DELETE_FAILURE,
  ACTIVITY_GET_INITIAL_STATE_REQUEST,
  ACTIVITY_SET_ACTIVE_REQUEST,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
  ACTIVITIES_TABLE_ROW_GET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class ActivitesState {
  initialized: boolean;
  error: boolean;
  activitiesGeoJSON: any;
  activitiesTableRows: {};
  IAPPGeoJSON: any;
  IAPPTableRows: any;

  constructor() {
    this.initialized = false;
  }
}
const initialState = new ActivitesState();

function createActivitesReducer(configuration: AppConfig): (ActivityState, AnyAction) => ActivitesState {
  return (state = initialState, action) => {
    switch (action.type) {
      case ACTIVITIES_TABLE_ROW_GET_SUCCESS: {
        return {
          ...state,
          activities_table_rows: [
            ...state.activities_table_rows.filter((item) => {
              return item.recordSetID !== action.payload.recordSetID;
            }),
            { recordSetID: action.payload.recordSetID, rows: [...action.payload.activities_table_rows] }
          ]
        };
      }
      case ACTIVITIES_GEOJSON_GET_SUCCESS: {
        return {
          ...state,
          activities_geojson: [
            ...state.activities_geojson.filter((item) => {
              return item.recordSetID !== action.payload.recordSetID;
            }),
            { recordSetID: action.payload.recordSetID, rows: [...action.payload.activities_geojson] }
          ]
        };
      }
      default:
        return state;
    }
  };
}

const selectActivites: (state) => ActivitesState = (state) => state.ActivitiesPageState;

export { createActivitesReducer, selectActivites };
