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
  MAP_DELETE_LAYER_AND_TABLE,
  MAP_TOGGLE_BASEMAP,
  MAP_TOGGLE_HD,
  MAP_TOGGLE_ACCURACY,
  MAP_SET_COORDS,
  MAP_TOGGLE_TRACKING,
  MAP_TOGGLE_PANNED,
  TOGGLE_BASIC_PICKER_LAYER,
  MAP_TOGGLE_WHATS_HERE,
  MAP_WHATS_HERE_FEATURE,
  WHATS_HERE_IAPP_ROWS_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class MapState {
  initialized: boolean;
  positionTracking: boolean;
  userCoords: any;
  panned: boolean;
  userHeading: number;
  baseMapToggle: boolean;
  HDToggle: boolean;
  accuracyToggle: boolean;
  layers: object;
  whatsHere: any;
  simplePickerLayers: object;
  recordTables: object;
  error: boolean;
  activitiesGeoJSON: any;
  IAPPGeoJSON: any;

  constructor() {
    this.initialized = false;
    this.userHeading = null;
    this.baseMapToggle = false;
    this.HDToggle = false;
    this.accuracyToggle = false;
    this.positionTracking = false;
    this.panned = true;
    this.whatsHere = { toggle: false, feature: null, iappRows: null };
  }
}
const initialState = new MapState();

function createMapReducer(configuration: AppConfig): (MapState, AnyAction) => MapState {
  return (state = initialState, action) => {
    switch (action.type) {
      case MAP_WHATS_HERE_FEATURE: {
        return {
          ...state,
          whatsHere: { toggle: state.whatsHere.toggle, feature: action.payload.feature }
        };
      }
      case MAP_TOGGLE_WHATS_HERE: {
        return {
          ...state,
          whatsHere: { toggle: !state.whatsHere.toggle, feature: null, iappRows: null }
        };
      }
      case MAP_TOGGLE_ACCURACY: {
        return {
          ...state,
          accuracyToggle: !state.accuracyToggle
        };
      }
      case MAP_TOGGLE_TRACKING: {
        return {
          ...state,
          positionTracking: !state.positionTracking
        };
      }
      case MAP_SET_COORDS: {
        const userCoords = { ...action?.payload?.position?.coords };
        return {
          ...state,
          userCoords: {
            lat: userCoords.latitude,
            long: userCoords.longitude,
            accuracy: userCoords.accuracy,
            heading: userCoords.heading
          },
          userHeading: userCoords.heading
        };
      }
      case MAP_TOGGLE_PANNED: {
        return {
          ...state,
          panned: !state.panned
        };
      }
      case TOGGLE_BASIC_PICKER_LAYER: {
        let newState = JSON.parse(JSON.stringify({ ...state.simplePickerLayers }));

        for (const layerNameProperty in action.payload) {
          //if exists, toggle
          if (newState[layerNameProperty]) {
            newState[layerNameProperty] = !newState[layerNameProperty];
          } else {
            // doesn't exist, getting turned on
            newState[layerNameProperty] = true;
          }
        }

        return {
          ...state,
          simplePickerLayers: JSON.parse(JSON.stringify({ ...newState }))
        };
      }
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
      case MAP_TOGGLE_BASEMAP: {
        return {
          ...state,
          baseMapToggle: !state.baseMapToggle
        };
      }
      case MAP_TOGGLE_HD: {
        return {
          ...state,
          HDToggle: !state.HDToggle
        };
      }
      case MAP_DELETE_LAYER_AND_TABLE: {
        const newLayersState = JSON.parse(JSON.stringify({ ...state.layers }));
        delete newLayersState[action.payload.recordSetID];
        const newTablesState = JSON.parse(JSON.stringify({ ...state.recordTables }));
        delete newTablesState[action.payload.recordSetID];

        return {
          ...state,
          layers: JSON.parse(JSON.stringify({ ...newLayersState })),
          recordTables: JSON.parse(JSON.stringify({ ...newTablesState }))
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
      case WHATS_HERE_IAPP_ROWS_SUCCESS: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            iappRows: action.payload.rows
          }
        }
      }
      default:
        return state;
    }
  };
}

const selectMap: (state) => MapState = (state) => state.Map;

export { createMapReducer, selectMap };
