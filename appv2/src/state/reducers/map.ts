import { IGeneralDialog } from 'components/dialog/GeneralDialog';
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
  MAP_LABEL_EXTENT_FILTER_SUCCESS,
  SET_TOO_MANY_LABELS_DIALOG,
  IAPP_EXTENT_FILTER_SUCCESS,
  USER_CLICKED_RECORD,
  URL_CHANGE,
  OVERLAY_MENU_TOGGLE,
  RECORDSET_UPDATE_FILTER,
  RECORDSET_REMOVE_FILTER,
  RECORDSETS_TOGGLE_VIEW_FILTER,
  USER_HOVERED_RECORD,
  INIT_SERVER_BOUNDARIES_GET,
  TOGGLE_QUICK_PAN_TO_RECORD,
  USER_TOUCHED_RECORD,
  TOGGLE_CUSTOMIZE_LAYERS,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  CSV_LINK_CLICKED,
  RECORD_SET_TO_EXCEL_FAILURE,
  CUSTOM_LAYER_DRAWN,
  DRAW_CUSTOM_LAYER,
  REMOVE_CLIENT_BOUNDARY,
  USER_SETTINGS_DELETE_KML_SUCCESS,
  SET_CURRENT_OPEN_SET,
  SAVE_LAYER_LOCALSTATE
} from '../actions';

import { AppConfig } from '../config';
import { createNextState } from '@reduxjs/toolkit';
import { getUuid } from './userSettings';

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
  userRecordOnClickMenuOpen?: boolean;
  accuracyToggle: boolean;
  layers: [];
  whatsHere: any;
  simplePickerLayers: object;
  simplePickerLayers2: any[];
  recordTables: object;
  error: boolean;
  activitiesGeoJSON: any;
  IAPPGeoJSON: any;
  LeafletWhosEditing: LeafletWhosEditingEnum;
  legendsPopup: any;
  map_zoom: number;
  map_center: L.LatLngExpression;
  activity_zoom: number;
  activity_center: L.LatLngExpression;
  activityPageMapExtentToggle: boolean;
  labelBoundsPolygon: any;
  IAPPBoundsPolygon: any;
  tooManyLabelsDialog: IGeneralDialog;
  viewFilters: boolean;
  quickPanToRecord: boolean;
  userRecordOnHoverMenuOpen: boolean;
  userRecordOnHoverRecordType: any;
  userRecordOnHoverRecordID: any;
  userRecordOnHoverRecordRow: any;
  customizeLayersToggle: boolean;
  linkToCSV: string;
  CanTriggerCSV: boolean;
  recordSetForCSV: number;
  drawingCustomLayer: boolean;
  serverBoundaries: [];
  clientBoundaries: [];
  workingLayerName: string;
  currentOpenSet: string;

  constructor() {
    this.initialized = false;
    this.linkToCSV = null;
    this.CanTriggerCSV = true;
    this.recordSetForCSV = null;
    this.viewFilters = true;
    this.map_center = [53, -127];
    this.map_zoom = 5;
    this.activity_center = [53, -127];
    this.activity_zoom = 5;
    this.userHeading = null;
    this.drawingCustomLayer = false;
    this.simplePickerLayers2 = localStorage.getItem('SIMPLE_PICKER_LAYERS')
      ? JSON.parse(localStorage.getItem('SIMPLE_PICKER_LAYERS'))
      : [
          {
            title: 'Regional Districts',
            type: 'wms',
            url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONAL_DISTRICTS_SVW/ows',
            checked: false
          },
          {
            title: 'BC Parks',
            type: 'wms',
            url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_PARKS/ows',
            checked: false
          },
          {
            title: 'Conservancy Areas',
            type: 'wms',
            url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'Municipality Boundaries',
            type: 'wms',
            url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_NR_MUNICIPALITIES_SP/ows',
            checked: false
          },
          {
            title: 'BC Major Watersheds',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'Freshwater Atlas Rivers',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'Freshwater Lakes',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'Freshwater Atlas Stream Network',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'Water Licenses Drinking Water',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'Water Rights Licenses',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'Water Wells',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'Digital Road Atlas (DRA) - Master Partially-Attributed Roads',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          },
          {
            title: 'MOTI RFI',
            type: 'wms',
            // url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows',
            checked: false
          }
        ];
    this.baseMapToggle = false;
    this.HDToggle = false;
    this.activityPageMapExtentToggle = false;
    this.accuracyToggle = false;
    this.positionTracking = false;
    this.panned = true;
    this.LeafletWhosEditing = LeafletWhosEditingEnum.NONE;
    this.legendsPopup = false;
    this.labelBoundsPolygon = null;
    this.IAPPBoundsPolygon = null;
    this.userRecordOnClickMenuOpen = false;
    this.tooManyLabelsDialog = {
      dialogActions: [],
      dialogOpen: false,
      dialogTitle: '',
      dialogContentText: null
    };
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
      page: 0,
      highlightedType: null
    };
    this.quickPanToRecord = false;
    this.quickPanToRecord = false;
    this.customizeLayersToggle = false;
    this.clientBoundaries = localStorage.getItem('CLIENT_BOUNDARIES')
      ? JSON.parse(localStorage.getItem('CLIENT_BOUNDARIES'))
      : [];
    this.serverBoundaries = [];
    this.workingLayerName = null;
    this.currentOpenSet = null;
  }
}
const initialState = new MapState();

function createMapReducer(configuration: AppConfig): (MapState, AnyAction) => MapState {
  return (state = initialState, action) => {
    switch (action.type) {
      //splitting extent vars to two pairs solves render loop
      case RECORDSETS_TOGGLE_VIEW_FILTER: {
        const nextState = createNextState(state, (draftState) => {
          draftState.viewFilters = !draftState.viewFilters;
        });
        return nextState;
      }
      case CUSTOM_LAYER_DRAWN: {
        const nextState = createNextState(state, (draftState) => {
          draftState.drawingCustomLayer = false;
          draftState.clientBoundaries = [
            ...state.clientBoundaries,
            {
              id: getUuid(),
              title: state?.workingLayerName,
              geojson: action.payload.feature
            }
          ];
          draftState.workingLayerName = null;
        });
        return nextState;
      }
      case DRAW_CUSTOM_LAYER: {
        const nextState = createNextState(state, (draftState) => {
          draftState.drawingCustomLayer = true;
          draftState.workingLayerName = action.payload.name;
        });
        return nextState;
      }
      case REMOVE_CLIENT_BOUNDARY: {
        const nextState = createNextState(state, (draftState) => {
          const index = draftState.clientBoundaries.findIndex((cb) => cb.id === action.payload.id);
          draftState.clientBoundaries.splice(index, 1);
        });
        return nextState;
      }
      case USER_SETTINGS_DELETE_KML_SUCCESS: {
        const nextState = createNextState(state, (draftState) => {
          const index = draftState.serverBoundaries.findIndex((sb) => sb.id === action.payload.server_id);
          draftState.serverBoundaries.splice(index, 1);
        });
        return nextState;
      }
      case RECORD_SET_TO_EXCEL_REQUEST: {
        return {
          ...state,
          CanTriggerCSV: false
        };
      }
      case RECORD_SET_TO_EXCEL_SUCCESS: {
        return {
          ...state,
          CanTriggerCSV: true,
          linkToCSV: action.payload.link,
          recordSetForCSV: action.payload.id
        };
      }
      case CSV_LINK_CLICKED: {
        return {
          ...state,
          linkToCSV: null,
          recordSetForCSV: null
        };
      }
      case RECORD_SET_TO_EXCEL_FAILURE: {
        return {
          ...state,
          CanTriggerCSV: true
        };
      }
      case USER_CLICKED_RECORD: {
        const nextState = createNextState(state, (draftState) => {
          draftState.userRecordOnClickMenuOpen = true;
          draftState.userRecordOnClickRecordType = action.payload.recordType;
          draftState.userRecordOnClickRecordID = action.payload.id;
          draftState.userRecordOnClickRecordRow = action.payload.row;
        });
        return nextState;
      }
      case USER_HOVERED_RECORD: {
        const nextState = createNextState(state, (draftState) => {
          draftState.userRecordOnHoverMenuOpen = true;
          draftState.userRecordOnHoverRecordType = action.payload.recordType;
          draftState.userRecordOnHoverRecordID = action.payload.id;
          draftState.userRecordOnHoverRecordRow = action.payload.row;
        });
        return nextState;
      }
      case TOGGLE_QUICK_PAN_TO_RECORD: {
        const nextState = createNextState(state, (draftState) => {
          draftState.quickPanToRecord = !state.quickPanToRecord;
        });
        return nextState;
      }
      case USER_TOUCHED_RECORD: {
        const nextState = createNextState(state, (draftState) => {
          draftState.userRecordOnHoverMenuOpen = true;
          draftState.userRecordOnHoverRecordType = action.payload.recordType;
          draftState.userRecordOnHoverRecordID = action.payload.id;
          draftState.userRecordOnHoverRecordRow = action.payload.row;
          draftState.touchTime = Date.now();
        });
        return nextState;
      }
      case URL_CHANGE: {
        return {
          ...state,
          userRecordOnClickMenuOpen: false
        };
      }
      case SET_CURRENT_OPEN_SET: {
        return {
          ...state,
          currentOpenSet: action.payload.set
        };
      }
      case OVERLAY_MENU_TOGGLE: {
        return {
          ...state,
          userRecordOnClickMenuOpen: false
        };
      }
      case MAIN_MAP_MOVE: {
        if (action.payload.tab === 'Current Activity') {
          return {
            ...state,
            activity_zoom: action.payload.zoom,
            activity_center: action.payload.center
          };
        } else {
          return {
            ...state,
            map_zoom: action.payload.zoom,
            map_center: action.payload.center,
            panned: false
          };
        }
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
            highlightedType: 'IAPP',
            highlightedURLID: action.payload.id,
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
            highlightedType: 'Activity',
            highlightedURLID: action.payload.id,
            highlightedIAPP: null,
            highlightedACTIVITY: action.payload.short_id,
            highlightedGeo: state?.whatsHere?.activityRows.filter((row) => {
              return row.short_id === action.payload.short_id;
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
      // case TOGGLE_BASIC_PICKER_LAYER: {
      //   let newState = JSON.parse(JSON.stringify({ ...state.simplePickerLayers }));

      //   for (const layerNameProperty in action.payload) {
      //     //if exists, toggle
      //     if (newState[layerNameProperty]) {
      //       newState[layerNameProperty] = !newState[layerNameProperty];
      //     } else {
      //       // doesn't exist, getting turned on
      //       newState[layerNameProperty] = true;
      //     }
      //   }

      //   return {
      //     ...state,
      //     simplePickerLayers: JSON.parse(JSON.stringify({ ...newState }))
      //   };
      // }
      case LAYER_STATE_UPDATE: {
        const nextState = createNextState(state, (draftState) => {
          for (const x in action.payload) {
            let index = draftState?.layers?.findIndex((layer) => layer.recordSetID === x);
            if (draftState.layers?.[index]?.layerState) {
              draftState.layers[index].layerState = action.payload[x]?.layerState;
              draftState.layers[index].type = action.payload[x]?.type;
            } else {
              if(!draftState.layers) draftState.layers = [];
              draftState.layers.push({recordSetID: x})
              index = draftState.layers.findIndex((layer) => layer.recordSetID === x);
              draftState.layers[index].layerState = action.payload[x]?.layerState;
              draftState.layers[index].type = action.payload[x]?.type;
            }
          }
        });
        return nextState;
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
        const nextState = createNextState(state, (draftState) => {
          delete draftState.layers[action.payload.recordSetID];
          delete draftState.recordTables[action.payload.recordSetID];
        }
       )
       return nextState;
      }
      case FILTER_STATE_UPDATE: {
        const nextState = createNextState(state, (draftState) => {
          for (const x in action.payload) {
            draftState.layers[x].filters = { ...action.payload?.[x]?.filters };
            draftState.layers[x].loaded = false;
          }
        });
        return nextState;
      }
      case RECORDSET_UPDATE_FILTER: {
        const nextState = createNextState(state, (draftState) => {
          draftState.recordTables[action.payload.setID].page = 0;
        });
        return nextState;
      }
      case RECORDSET_REMOVE_FILTER: {
        const nextState = createNextState(state, (draftState) => {
          draftState.recordTables[action.payload.setID].page = 0;
        });
        return nextState;
      }
      case INIT_SERVER_BOUNDARIES_GET: {
        const nextState = createNextState(state, (draftState) => {
          //draftState.layers[action.payload.setID].loaded = false;
          draftState.serverBoundaries = action.payload.data;
        });
        return nextState;
      }
      // case TOGGLE_CUSTOMIZE_LAYERS: {
      //   const nextState = createNextState(state, (draftState) => {
      //     draftState.customizeLayersToggle = !draftState.customizeLayersToggle;
      //   });
      //   return nextState;
      // }
      case PAGE_OR_LIMIT_UPDATE: {
        const id = action.payload.setID;
        return {
          ...state,
          recordTables: {
            ...state.recordTables,
            [id]: {
              ...state.recordTables?.[id],
              page: action.payload.page,
              limit: action.payload.limit
            }
          }
        };
      }
      case ACTIVITIES_GEOJSON_GET_SUCCESS: {
        const nextState = createNextState(state, (draftState) => {
          draftState.activitiesGeoJSON = action.payload.activitiesGeoJSON;
        })
        return nextState;
      }
      case ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS: {
        const nextState = createNextState(state, (draftState) => {
          if(!draftState.layers) draftState.layers = [];
          let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
          if(!draftState.layers[index]) draftState.layers.push({recordSetID: action.payload.recordSetID})
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);

          draftState.layers[index].IDList = action.payload.IDList;
          draftState.layers[index].loaded = true;

 



          draftState.layers[index].geoJSON = {type: 'FeatureCollection', features: draftState.activitiesGeoJSON.features.filter((feature) => {
           // if(feature.properties.id === '335cf60a-52b6-4bef-87b8-4cf05b61fe5d')
           // console.log(!state.layers[index].geoJSON?.features?.map((f) => f.properties.id)?.includes(feature.properties.id))
            return action.payload.IDList.includes(feature.properties.id) && 
            !state.layers[index].geoJSON?.features?.map((f) => f.properties.id)?.includes(feature.properties.id);
          })}

        })
        return nextState;
      }
      case IAPP_GET_IDS_FOR_RECORDSET_SUCCESS: {
        /*
        const nextState = createNextState(state, (draftState) => {

          if(!draftState.layers) draftState.layers = {};
          if(!draftState.layers[action.payload.recordSetID]) draftState.layers[action.payload.recordSetID] = {};
          draftState.layers[action.payload.recordSetID].IDList = [...action.payload.IDList];
          draftState.layers[action.payload.recordSetID].loaded = true;

          draftState.layers[action.payload.recordSetID].geoJSON = {type: 'FeatureCollection', features: draftState.IAPPGeoJSON.features.filter((feature) => {
            return action.payload.IDList.includes(feature.properties.site_id);
          })}
        })
        return nextState;
        */
       return state;
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
          labelBoundsPolygon: action.payload.bounds
        };
      }
      case IAPP_EXTENT_FILTER_SUCCESS: {
        return {
          ...state,
          IAPPBoundsPolygon: action.payload.bounds
        };
      }
      case SET_TOO_MANY_LABELS_DIALOG: {
        return {
          ...state,
          tooManyLabelsDialog: action.payload.dialog
        };
      }
      case SAVE_LAYER_LOCALSTATE: {
        return {
          ...state,
          simplePickerLayers2: action.payload.layers
        };
      }
      default:
        return state;
    }
  };
}

const selectMap: (state) => MapState = (state) => state.Map;

export { createMapReducer, selectMap };
