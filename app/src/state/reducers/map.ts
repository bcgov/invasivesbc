import { calculateGeometryArea } from 'utils/geometryHelpers';
import {
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_TABLE_ROWS_GET_SUCCESS,
  LAYER_STATE_UPDATE,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  FILTER_STATE_UPDATE,
  ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
  PAGE_OR_LIMIT_UPDATE,
  MAP_DELETE_LAYER
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
      case MAP_DELETE_LAYER: {
        let newState = JSON.parse(JSON.stringify({ ...state.layers }));
        delete newState[action.payload.recordSetID];
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
              page: action.payload.page,
              limit: action.payload.limit
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
        let newState = state.recordTables ? JSON.parse(JSON.stringify({ ...state.recordTables })) : {};

        if (newState?.[action.payload.recordSetID]) {
          newState[action.payload.recordSetID].rows = action.payload.rows;
        } else {
          newState[action.payload.recordSetID] = {};
          newState[action.payload.recordSetID].rows = action.payload.rows;
        }

        // set defaults
        if (!newState?.[action.payload.recordSetID]?.page) newState[action.payload.recordSetID].page = 0;
        if (!newState?.[action.payload.recordSetID]?.limit) newState[action.payload.recordSetID].limit = 20;

        return {
          ...state,
          recordTables: JSON.parse(JSON.stringify({ ...newState }))
        };
      }
      case IAPP_TABLE_ROWS_GET_SUCCESS: {
        let newState = state.recordTables ? JSON.parse(JSON.stringify({ ...state.recordTables })) : {};

        if (newState?.[action.payload.recordSetID]) {
          newState[action.payload.recordSetID].rows = action.payload.rows;
        } else {
          newState[action.payload.recordSetID] = {};
          newState[action.payload.recordSetID].rows = action.payload.rows;
        }

        // set defaults
        if (!newState?.[action.payload.recordSetID]?.page) newState[action.payload.recordSetID].page = 0;
        if (!newState?.[action.payload.recordSetID]?.limit) newState[action.payload.recordSetID].limit = 20;

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
