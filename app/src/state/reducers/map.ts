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
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_TABLE_ROWS_GET_SUCCESS,
  IAPP_RECORDSET_ID_LIST_GET_SUCCESS,
  LAYER_STATE_UPDATE,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  FILTER_STATE_UPDATE,
  ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
  PAGE_OR_LIMIT_UPDATE
} from '../actions';

import { AppConfig } from '../config';

class MapState {
  initialized: boolean;
  layers: object;
  recordTables: object;
  error: boolean;
  activitiesGeoJSON: any;
  IAPPGeoJSON: any;

  constructor() {
    this.initialized = false;
  }
}
const initialState = new MapState();

function createMapReducer(configuration: AppConfig): (MapState, AnyAction) => MapState {
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
      case LAYER_STATE_UPDATE: {
        let newState = JSON.parse(JSON.stringify({ ...state.layers }));
        for (const x in action.payload) {
          if (newState[x]?.layerState) {
            newState[x].layerState = action.payload[x]?.layerState;
            newState[x].type = action.payload[x]?.type;
          } else {
            newState[x] = {};
            newState[x].layerState = action.payload[x]?.layerState;
            newState[x].type = action.payload[x]?.type;
          }
        }

        return {
          ...state,
          layers: JSON.parse(JSON.stringify({ ...newState }))
        };
      }
      case FILTER_STATE_UPDATE: {
        let newState = JSON.parse(JSON.stringify({ ...state.layers }));
        for (const x in action.payload) {
          newState[x].filters = { ...action.payload[x]?.filters };
          newState[x].loaded = false;
        }

        return {
          ...state,
          layers: JSON.parse(JSON.stringify({ ...newState }))
        };
      }
      case PAGE_OR_LIMIT_UPDATE: {
        const id = action.payload.recordSetID;
        return {
          ...state,
          recordTables: {
            ...state.recordTables,
            [id]: {
              ...state.recordTables[id],
              page: action.payload.page ? action.payload.page : state.recordTables[id].page,
              limit: action.payload.limit ? action.payload.limit : state.recordTables[id].limit
            }
          }
        };
      }
      case ACTIVITIES_GEOJSON_GET_SUCCESS: {
        return {
          ...state,
          activitiesGeoJSON: action.payload.activitiesGeoJSON
        };
      }
      case ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS: {
        const newState = JSON.parse(JSON.stringify({ ...state.layers }));
        newState[action.payload.recordSetID].IDList = [...action.payload.IDList];
        newState[action.payload.recordSetID].loaded = true;
        return {
          ...state,
          layers: JSON.parse(JSON.stringify({ ...newState }))
        };
      }
      case IAPP_GET_IDS_FOR_RECORDSET_SUCCESS: {
        const newState = JSON.parse(JSON.stringify({ ...state.layers }));
        newState[action.payload.recordSetID].IDList = [...action.payload.IDList];
        newState[action.payload.recordSetID].loaded = true;
        return {
          ...state,
          layers: JSON.parse(JSON.stringify({ ...newState }))
        };
      }
      case ACTIVITIES_TABLE_ROWS_GET_SUCCESS: {
        let newState = (state.recordTables)? JSON.parse(JSON.stringify({ ...state.recordTables })): {}

        if(newState?.[action.payload.recordSetID])
        {
          newState[action.payload.recordSetID].rows = action.payload.rows;
        }
        else
        {
          newState[action.payload.recordSetID] = {}
          newState[action.payload.recordSetID].rows = action.payload.rows;
        }

        // set defaults
        if (!newState?.[action.payload.recordSetID]?.page) newState[action.payload.recordSetID].page = 1;
        if (!newState?.[action.payload.recordSetID]?.limit) newState[action.payload.recordSetID].limit = 10;
        
        return {
          ...state,
          recordTables: JSON.parse(JSON.stringify({ ...newState }))
        };
      }
      case IAPP_TABLE_ROWS_GET_SUCCESS: {
        let newState = (state.recordTables) ? JSON.parse(JSON.stringify({ ...state.recordTables })): {};

        if(newState?.[action.payload.recordSetID])
        {
          newState[action.payload.recordSetID].rows = action.payload.rows;
        }
        else
        {
          newState[action.payload.recordSetID] = {}
          newState[action.payload.recordSetID].rows = action.payload.rows;
        }

        // set defaults
        if (!newState?.[action.payload.recordSetID]?.page) newState[action.payload.recordSetID].page = 1;
        if (!newState?.[action.payload.recordSetID]?.limit) newState[action.payload.recordSetID].limit = 10;

        return {
          ...state,
          recordTables: JSON.parse(JSON.stringify({ ...newState }))
        };
      }
      case IAPP_GEOJSON_GET_SUCCESS: {
        return {
          ...state,
          IAPPGeoJSON: action.payload.IAPPGeoJSON
        };
      }
      default:
        return state;
    }
  };
}

const selectMap: (state) => MapState = (state) => state.Map;

export { createMapReducer, selectMap };
