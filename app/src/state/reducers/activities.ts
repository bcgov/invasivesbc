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
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_TABLE_ROWS_GET_SUCCESS,
  IAPP_RECORDSET_ID_LIST_GET_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class ActivitiesState {
  initialized: boolean;
  error: boolean;
  activitiesGeoJSON: any;
  activitiesTableRows: {};
  IAPPGeoJSON: any;
  IAPPTableRows: any;
  IAPPRecordSetIDS: any;

  constructor() {
    this.initialized = false;
  }
}
const initialState = new ActivitiesState();

function createActivitiesReducer(configuration: AppConfig): (ActivitiesState, AnyAction) => ActivitiesState {
  return (state = initialState, action) => {
    switch (action.type) {
      /*  case ACTIVITIES_TABLE_ROW_GET_SUCCESS: {
        return {
          ...state,
          activities_table_rows: [
            ...state?.activities_table_rows?.filter((item) => {
              return item.recordSetID !== action.payload.recordSetID;
            }),
            { recordSetID: action.payload.recordSetID, rows: [...action.payload.activities_table_rows] }
          ]
        };
      }*/
      case ACTIVITIES_GEOJSON_GET_SUCCESS: {
        if (
          state?.activitiesGeoJSON?.length &&
          state?.activitiesGeoJSON?.filter((item) => {
            return item.recordSetID !== action.payload.recordSetID;
          })
        ) {
          return {
            ...state,
            activitiesGeoJSON: [
              ...state?.activitiesGeoJSON?.filter((item) => {
                return item.recordSetID !== action.payload.recordSetID;
              }),
              {
                recordSetID: action.payload.recordSetID,
                featureCollection: action.payload.activitiesGeoJSON,
                layerState: action.payload.layerState
              }
            ]
          };
        } else {
          return {
            ...state,
            activitiesGeoJSON: [
              {
                recordSetID: action.payload.recordSetID,
                featureCollection: action.payload.activitiesGeoJSON,
                layerState: action.payload.layerState
              }
            ]
          };
        }
      }
      case IAPP_RECORDSET_ID_LIST_GET_SUCCESS: {
        const newState = {};
        newState[action.payload.recordSetID] = action.payload.ids;

        return {
          ...state,
          IAPPRecordSetIDS: { ...state.IAPPRecordSetIDS, ...newState }
        };
      }
      case IAPP_TABLE_ROWS_GET_SUCCESS: {
        if (
          state?.IAPPTableRows?.length &&
          state?.IAPPTableRows?.filter((item) => {
            return item.recordSetID !== action.payload.recordSetID;
          })
        ) {
          return {
            ...state,
            IAPPTableRows: [
              ...state?.IAPPTableRows?.filter((item) => {
                return item.recordSetID !== action.payload.recordSetID;
              }),
              {
                recordSetID: action.payload.recordSetID,
                IAPPTableRows: action.payload.IAPPTableRows
              }
            ]
          };
        } else {
          return {
            ...state,
            IAPPTableRows: [
              {
                recordSetID: action.payload.recordSetID,
                IAPPTableRows: action.payload.IAPPTableRows
              }
            ]
          };
        }
      }
      case IAPP_GEOJSON_GET_SUCCESS: {
        if (
          state?.IAPPGeoJSON?.length &&
          state?.IAPPGeoJSON?.filter((item) => {
            return item.recordSetID !== action.payload.recordSetID;
          })
        ) {
          return {
            ...state,
            IAPPGeoJSON: [
              ...state?.IAPPGeoJSON?.filter((item) => {
                return item.recordSetID !== action.payload.recordSetID;
              }),
              {
                recordSetID: action.payload.recordSetID,
                featureCollection: action.payload.IAPPGeoJSON,
                layerState: action.payload.layerState
              }
            ]
          };
        } else {
          return {
            ...state,
            IAPPGeoJSON: [
              {
                recordSetID: action.payload.recordSetID,
                featureCollection: action.payload.IAPPGeoJSON,
                layerState: action.payload.layerState
              }
            ]
          };
        }
      }
      default:
        return state;
    }
  };
}

const selectActivities: (state) => ActivitiesState = (state) => state.Activities;

export { createActivitiesReducer, selectActivities };
