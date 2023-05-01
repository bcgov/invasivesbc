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
  LEAFLET_SET_WHOS_EDITING,
  TOGGLE_BASIC_PICKER_LAYER,
  MAP_TOGGLE_WHATS_HERE,
  MAP_WHATS_HERE_FEATURE,
  WHATS_HERE_IAPP_ROWS_SUCCESS,
  MAP_SET_WHATS_HERE_PAGE_LIMIT,
  MAP_SET_WHATS_HERE_SECTION,
  WHATS_HERE_ACTIVITY_ROWS_SUCCESS,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
  MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED,
  WHATS_HERE_PAGE_POI,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED,
  WHATS_HERE_PAGE_ACTIVITY,
  MAIN_MAP_MOVE,
  ACTIVITY_PAGE_MAP_EXTENT_TOGGLE,
  WHATS_HERE_SORT_FILTER_UPDATE,
  MAP_TOGGLE_LEGENDS,
  MAP_LABEL_EXTENT_FILTER_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

export enum LeafletWhosEditingEnum {
  ACTIVITY = 'ACTIVITY',
  WHATSHERE = 'WHATSHERE',
  BOUNDARY = 'BOUNDARY',
  NONE = 'NONE'
}

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
  LeafletWhosEditing: LeafletWhosEditingEnum;
  legendsPopup: any;
  zoom: number;
  center: L.LatLngExpression;
  activityPageMapExtentToggle: boolean;
  boundsPolygon: any;

  constructor() {
    this.initialized = false;
    this.center = [53, -127];
    this.zoom = 5;
    this.userHeading = null;
    this.baseMapToggle = false;
    this.HDToggle = false;
    this.activityPageMapExtentToggle = false;
    this.accuracyToggle = false;
    this.positionTracking = false;
    this.panned = true;
    this.LeafletWhosEditing = LeafletWhosEditingEnum.NONE;
    this.legendsPopup = false;
    this.boundsPolygon = null;
    this.whatsHere = {
      toggle: false,
      feature: null,
      section: 'position',
      iappRows: [],
      activityRows: [],
      IAPPPage: 0,
      IAPPLimit: 5,
      ActivityPage: 0,
      ActivityLimit: 5,
      IAPPSortField: 'earliest_survey',
      IAPPSortDirection: 'desc',
      ActivitySortField: 'created',
      ActivitySortDirection: 'desc',
      IAPPIDs: [],
      ActivityIDs: [],
      limit: 5,
      page: 0
    };
  }
}
const initialState = new MapState();

function createMapReducer(configuration: AppConfig): (MapState, AnyAction) => MapState {
  return (state = initialState, action) => {
    switch (action.type) {
      case MAIN_MAP_MOVE: {
        return {
          ...state,
          zoom: action.payload.zoom,
          center: action.payload.center
        };
      }
      case ACTIVITY_PAGE_MAP_EXTENT_TOGGLE: {
        return {
          ...state,
          activityPageMapExtentToggle: !state.activityPageMapExtentToggle
        };
      }
      case LEAFLET_SET_WHOS_EDITING: {
        return {
          ...state,
          LeafletWhosEditing: action.payload.LeafletWhosEditing
        };
      }
      case MAP_WHATS_HERE_FEATURE: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            toggle: state.whatsHere.toggle,
            feature: action.payload.feature
          }
        };
      }
      case MAP_TOGGLE_WHATS_HERE: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            toggle: !state.whatsHere.toggle,
            feature: null,
            iappRows: [],
            activityRows: [],
            limit: 5,
            page: 0
          }
        };
      }
      case MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            IAPPIDs: [...action.payload.IDs],
            iappRows: [],
            IAPPPage: 0,
            IAPPLimit: 5
          }
        };
      }
      case MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            ActivityIDs: [...action.payload.IDs],
            activityRows: [],
            ActivityPage: 0,
            ActivityLimit: 5
          }
        };
      }
      case WHATS_HERE_SORT_FILTER_UPDATE: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            IAPPPage: action.payload.recordType === 'IAPP' ? 0 : state.whatsHere.IAPPPage,
            ActivityPage: action.payload.recordType === 'Activity' ? 0 : state.whatsHere.ActivityPage,
            IAPPSortField: action.payload.recordType === 'IAPP' ? action.payload.field : state.whatsHere.IAPPSortField,
            IAPPSortDirection:
              action.payload.recordType === 'IAPP'
                ? state.whatsHere.IAPPSortDirection === 'desc'
                  ? 'asc'
                  : 'desc'
                : state.whatsHere.IAPPSortDirection,
            ActivitySortField:
              action.payload.recordType === 'Activity' ? action.payload.field : state.whatsHere.ActivitySortField,
            ActivitySortDirection:
              action.payload.recordType === 'Activity'
                ? state.whatsHere.ActivitySortDirection === 'desc'
                  ? 'asc'
                  : 'desc'
                : state.whatsHere.ActivitySortDirection
          }
        };
      }
      case MAP_SET_WHATS_HERE_PAGE_LIMIT: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            page: action.payload.page,
            limit: action.payload.limit
          }
        };
      }
      case WHATS_HERE_PAGE_POI: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            IAPPPage: action.payload.page,
            IAPPLimit: action.payload.limit
          }
        };
      }
      case WHATS_HERE_PAGE_ACTIVITY: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            ActivityPage: action.payload.page,
            ActivityLimit: action.payload.limit
          }
        };
      }
      case MAP_SET_WHATS_HERE_SECTION: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            section: action.payload.section,
            page: 0,
            limit: 5
          }
        };
      }
      case MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            highlightedIAPP: action.payload.id,
            highlightedACTIVITY: null,
            highlightedGeo: state?.whatsHere?.iappRows.filter((row) => {
              return row.site_id === action.payload.id;
            })[0]
          }
        };
      }
      case MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            highlightedIAPP: null,
            highlightedACTIVITY: action.payload.id,
            highlightedGeo: state?.whatsHere?.activityRows.filter((row) => {
              return row.short_id === action.payload.id;
            })[0]
          }
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
      case MAP_TOGGLE_LEGENDS: {
        return {
          ...state,
          legendsPopup: !state.legendsPopup
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
            iappRows: [...action.payload.data]
          }
        };
      }
      case WHATS_HERE_ACTIVITY_ROWS_SUCCESS: {
        return {
          ...state,
          whatsHere: {
            ...state.whatsHere,
            activityRows: [...action.payload.data]
          }
        };
      }
      case MAP_LABEL_EXTENT_FILTER_SUCCESS: {
        return {
          ...state,
          boundsPolygon: action.payload.bounds
        };
      }
      default:
        return state;
    }
  };
}

const selectMap: (state) => MapState = (state) => state.Map;

export { createMapReducer, selectMap };
