import {
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
  ACTIVITY_PAGE_MAP_EXTENT_TOGGLE,
  CSV_LINK_CLICKED,
  CUSTOM_LAYER_DRAWN,
  DRAW_CUSTOM_LAYER,
  FILTER_STATE_UPDATE,
  IAPP_EXTENT_FILTER_SUCCESS,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  IAPP_TABLE_ROWS_GET_SUCCESS,
  INIT_SERVER_BOUNDARIES_GET,
  LAYER_STATE_UPDATE,
  LEAFLET_SET_WHOS_EDITING,
  MAIN_MAP_MOVE,
  MAP_DELETE_LAYER_AND_TABLE,
  MAP_LABEL_EXTENT_FILTER_SUCCESS,
  MAP_SET_COORDS,
  MAP_SET_WHATS_HERE_PAGE_LIMIT,
  MAP_SET_WHATS_HERE_SECTION,
  MAP_TOGGLE_ACCURACY,
  MAP_TOGGLE_BASEMAP,
  MAP_TOGGLE_HD,
  MAP_TOGGLE_LEGENDS,
  MAP_TOGGLE_PANNED,
  MAP_TOGGLE_TRACKING,
  MAP_TOGGLE_WHATS_HERE,
  MAP_WHATS_HERE_FEATURE,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED,
  MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
  OVERLAY_MENU_TOGGLE,
  PAGE_OR_LIMIT_UPDATE,
  RECORDSETS_TOGGLE_VIEW_FILTER,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_UPDATE_FILTER,
  RECORD_SET_TO_EXCEL_FAILURE,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  REMOVE_CLIENT_BOUNDARY,
  SET_CURRENT_OPEN_SET,
  SET_TOO_MANY_LABELS_DIALOG,
  TOGGLE_BASIC_PICKER_LAYER,
  TOGGLE_CUSTOMIZE_LAYERS,
  TOGGLE_QUICK_PAN_TO_RECORD,
  URL_CHANGE,
  USER_CLICKED_RECORD,
  USER_HOVERED_RECORD,
  USER_SETTINGS_DELETE_KML_SUCCESS,
  USER_TOUCHED_RECORD,
  WHATS_HERE_ACTIVITY_ROWS_SUCCESS,
  WHATS_HERE_IAPP_ROWS_SUCCESS,
  WHATS_HERE_PAGE_ACTIVITY,
  WHATS_HERE_PAGE_POI,
  WHATS_HERE_SORT_FILTER_UPDATE
} from '../actions';

import { createNextState } from '@reduxjs/toolkit';
import { immerable } from 'immer';
import { AppConfig } from '../config';
import { getUuid } from './userSettings';

export enum LeafletWhosEditingEnum {
  ACTIVITY = 'ACTIVITY',
  WHATSHERE = 'WHATSHERE',
  BOUNDARY = 'BOUNDARY',
  NONE = 'NONE'
}

class MapState {
  [immerable] = true;
  CanTriggerCSV: boolean;
  HDToggle: boolean;
  IAPPBoundsPolygon: any;
  IAPPGeoJSON: any;
  IAPPGeoJSONDict: any;
  LeafletWhosEditing: LeafletWhosEditingEnum;
  accuracyToggle: boolean;
  activitiesGeoJSON: any;
  activitiesGeoJSONDict: any;
  activityPageMapExtentToggle: boolean;
  activity_center: L.LatLngExpression;
  activity_zoom: number;
  baseMapToggle: boolean;
  clientBoundaries: any[];
  currentOpenSet: string;
  customizeLayersToggle: boolean;
  drawingCustomLayer: boolean;
  error: boolean;
  initialized: boolean;
  labelBoundsPolygon: any;
  layers: any[];
  legendsPopup: any;
  linkToCSV: string;
  map_center: L.LatLngExpression;
  map_zoom: number;
  panned: boolean;
  positionTracking: boolean;
  quickPanToRecord: boolean;
  recordSetForCSV: number;
  recordTables: object;
  serverBoundaries: any[];
  simplePickerLayers2: any[];
  simplePickerLayers: object;
  tooManyLabelsDialog: any;
  userCoords: any;
  userHeading: number;
  userRecordOnClickMenuOpen?: boolean;
  userRecordOnClickRecordID?: string;
  userRecordOnClickRecordRow?: any;
  userRecordOnClickRecordType?: string;
  userRecordOnHoverMenuOpen: boolean;
  userRecordOnHoverRecordID: any;
  userRecordOnHoverRecordRow: any;
  userRecordOnHoverRecordType: any;
  viewFilters: boolean;
  whatsHere: any;
  workingLayerName: string;

  constructor() {
    this.CanTriggerCSV = true;
    this.HDToggle = false;
    this.IAPPBoundsPolygon = null;
    this.LeafletWhosEditing = LeafletWhosEditingEnum.NONE;
    this.accuracyToggle = false;
    this.activityPageMapExtentToggle = false;
    this.activity_center = [53, -127];
    this.activity_zoom = 5;
    this.baseMapToggle = false;
    this.clientBoundaries =
      localStorage.getItem('CLIENT_BOUNDARIES') !== null
        ? (JSON.parse(localStorage.getItem('CLIENT_BOUNDARIES')) as Array<any>)
        : [];
    this.currentOpenSet = null;
    this.customizeLayersToggle = false;
    this.drawingCustomLayer = false;
    this.layers = [];
    this.initialized = false;
    this.labelBoundsPolygon = null;
    this.legendsPopup = false;
    this.linkToCSV = null;
    this.map_center = [53, -127];
    this.map_zoom = 5;
    this.panned = true;
    this.positionTracking = false;
    this.quickPanToRecord = false;
    this.quickPanToRecord = false;
    this.recordSetForCSV = null;
    this.recordTables = {};
    this.serverBoundaries = [];
    this.simplePickerLayers = [];
    this.simplePickerLayers2 = [
      {
        title: 'Regional Districts',
        type: 'wms',
        url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONAL_DISTRICTS_SVW/ows'
      },
      {
        title: 'BC Parks',
        type: 'wms',
        url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_PARKS/ows'
      },
      {
        title: 'Conservancy Areas',
        type: 'wms',
        url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_BC_PROTECTED_AREAS_CONSERVANCY/ows'
      },
      {
        title: 'Municipality Boundaries',
        type: 'wms',
        url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_NR_MUNICIPALITIES_SP/ows'
      }
    ];
    this.tooManyLabelsDialog = { dialogActions: [], dialogOpen: false, dialogTitle: '', dialogContentText: null };
    this.userHeading = null;
    this.userRecordOnClickMenuOpen = false;
    this.viewFilters = true;
    this.whatsHere = {
      ActivityIDs: [],
      ActivityLimit: 5,
      ActivityPage: 0,
      ActivitySortDirection: 'desc',
      ActivitySortField: 'created',
      IAPPIDs: [],
      IAPPLimit: 5,
      IAPPPage: 0,
      IAPPSortDirection: 'desc',
      IAPPSortField: 'earliest_survey',
      activityRows: [],
      feature: null,
      highlightedType: null,
      iappRows: [],
      limit: 5,
      page: 0,
      section: 'position',
      toggle: false
    };
    this.workingLayerName = null;
  }
}
const initialState = new MapState();

function createMapReducer(configuration: AppConfig): (MapState, AnyAction) => MapState {
  return (state = initialState, action) => {
    /* MW:
       Using immer produce() (exported as createNextState from redux-toolkit) so we can modify draftState directly and 
       not do the usual return {...state, ...newState} which is error prone, hard to read when there is a lot of 
       nesting, and also leads to extra renders because more of the state object is new every time and so then many 
       references update not just whats new.  Also saves us from doing JSON.parse(JSON.stringify(state.whatever)) to avoid 
       reference copying when we don't want it.

       If we were starting from scratch a consideration would possibly be using redux toolkits createReducer (produce is built 
       in) and builder.addCase instead of switches, although I assume you lose fallthrough cases then.
      */
    return createNextState(state, (draftState) => {
      switch (action.type) {
        case ACTIVITIES_GEOJSON_GET_SUCCESS: {
          //TODO:  Delete this when other refs to it are gone:
          draftState.activitiesGeoJSON = { type: 'FeatureCollection', features: [] }; //action.payload.activitiesGeoJSON;

          //Everything should point to this now instead:
          draftState.activitiesGeoJSONDict = {};
          action.payload.activitiesGeoJSON.features.forEach((feature) => {
            if (!feature.properties.id) console.log('no id', feature);
            if (feature?.properties?.id) {
              draftState.activitiesGeoJSONDict[feature.properties.id] = feature;
            }
          });

          if (
            draftState.layers?.filter((layer) => layer.type === 'Activity' && layer.IDList?.length !== undefined)
              .length > 0
          ) {
            const activityLayersToRegen = draftState.layers?.filter(
              (layer) => layer.type === 'Activity' && layer.IDList?.length !== undefined
            );
            activityLayersToRegen.map((layer) => {
              GeoJSONFilterSetForLayer(draftState, state, 'Activity', layer.recordSetID, layer.IDList);
            });
          }
          break;
        }
        case ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS: {
          let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
          if (!draftState.layers[index]) draftState.layers.push({ recordSetID: action.payload.recordSetID });
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
          draftState.layers[index].IDList = action.payload.IDList;
          draftState.layers[index].loaded = true;

          //if (draftState.activitiesGeoJSON?.features?.length > 0) {
          if (draftState.activitiesGeoJSONDict !== undefined) {
            GeoJSONFilterSetForLayer(draftState, state, 'Activity', action.payload.recordSetID, action.payload.IDList);
          } else {
            console.log('%cno fastmap!!!', 'color: yellow');
          }
          break;
        }
        case IAPP_TABLE_ROWS_GET_SUCCESS:
        case ACTIVITIES_TABLE_ROWS_GET_SUCCESS: {
          if (draftState.recordTables?.[action.payload.recordSetID]) {
            draftState.recordTables[action.payload.recordSetID].rows = action.payload.rows;
          } else {
            draftState.recordTables[action.payload.recordSetID] = {};
            draftState.recordTables[action.payload.recordSetID].rows = action.payload.rows;
          } // set defaults
          if (!draftState.recordTables?.[action.payload.recordSetID]?.page)
            draftState.recordTables[action.payload.recordSetID].page = 0;
          if (!draftState.recordTables?.[action.payload.recordSetID]?.limit)
            draftState.recordTables[action.payload.recordSetID].limit = 20;
          break;
        }
        case ACTIVITY_PAGE_MAP_EXTENT_TOGGLE: {
          draftState.activityPageMapExtentToggle = !state.activityPageMapExtentToggle;
          break;
        }
        case CSV_LINK_CLICKED: {
          draftState.linkToCSV = null;
          draftState.recordSetForCSV = null;
          break;
        }
        case CUSTOM_LAYER_DRAWN: {
          draftState.drawingCustomLayer = false;
          draftState.clientBoundaries.push({
            id: getUuid(),
            title: draftState?.workingLayerName,
            geojson: action.payload.feature
          });
          draftState.workingLayerName = null;
          break;
        }
        case DRAW_CUSTOM_LAYER: {
          draftState.drawingCustomLayer = true;
          draftState.workingLayerName = action.payload.name;
          break;
        }
        case FILTER_STATE_UPDATE: {
          for (const x in action.payload) {
            const index = draftState.layers.findIndex((layer: any) => layer.recordSetID === x);
            draftState.layers[index].filters = { ...action.payload?.[x]?.filters };
            draftState.layers[index].loaded = false;
          }
          break;
        }
        case IAPP_EXTENT_FILTER_SUCCESS: {
          draftState.IAPPBoundsPolygon = action.payload.bounds;
          break;
        }
        case IAPP_GEOJSON_GET_SUCCESS: {
          //TODO:  Delete this when other refs to it are gone:
          draftState.IAPPGeoJSON = { type: 'FeatureCollection', features: [] }; //action.payload.IAPPGeoJSON;

          //Everything should point to this now instead:
          draftState.IAPPGeoJSONDict = {};
          action.payload.IAPPGeoJSON.features.map((feature) => {
            if (!feature.properties.site_id) console.log('no site_id', feature);
            if (feature?.properties?.site_id) {
              draftState.IAPPGeoJSONDict[feature.properties.site_id] = feature;
            }
          });

          if (
            draftState.layers?.filter((layer) => layer.type === 'IAPP' && layer.IDList?.length !== undefined).length > 0
          ) {
            const IAPPLayersToRegen = draftState.layers?.filter(
              (layer) => layer.type === 'IAPP' && layer.IDList?.length !== undefined
            );
            IAPPLayersToRegen.map((layer) => {
              GeoJSONFilterSetForLayer(draftState, state, 'IAPP', layer.recordSetID, layer.IDList);
            });
          }
          break;
        }
        case IAPP_GET_IDS_FOR_RECORDSET_SUCCESS: {
          let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
          if (!draftState.layers[index]) draftState.layers.push({ recordSetID: action.payload.recordSetID });
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
          draftState.layers[index].IDList = action.payload.IDList;
          draftState.layers[index].loaded = true;

          if (draftState.IAPPGeoJSON?.features?.length > 0) {
            GeoJSONFilterSetForLayer(draftState, state, 'IAPP', action.payload.recordSetID, action.payload.IDList);
          }
          break;
        }
        case INIT_SERVER_BOUNDARIES_GET: {
          //draftState.layers[action.payload.setID].loaded = false;
          draftState.serverBoundaries = action.payload.data;
          break;
        }
        case LAYER_STATE_UPDATE: {
          for (const x in action.payload) {
            let index = draftState.layers.findIndex((layer: any) => layer.recordSetID === x);
            if (draftState.layers?.[index]?.layerState) {
              draftState.layers[index].layerState = action.payload[x]?.layerState;
              draftState.layers[index].type = action.payload[x]?.type;
            } else {
              draftState.layers.push({
                recordSetID: x,
                layerState: action.payload[x]?.layerState,
                type: action.payload[x]?.type
              });
            }
          }
          break;
        }
        case LEAFLET_SET_WHOS_EDITING: {
          draftState.LeafletWhosEditing = action.payload.LeafletWhosEditing;
          break;
        }
        case MAIN_MAP_MOVE: {
          if (action.payload.tab === 'Current Activity') {
            draftState.activity_zoom = action.payload.zoom;
            draftState.activity_center = action.payload.center;
          } else {
            draftState.map_zoom = action.payload.zoom;
            draftState.map_center = action.payload.center;
            draftState.panned = false;
          }
          break;
        }
        case MAP_DELETE_LAYER_AND_TABLE: {
          const index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
          delete draftState.layers[index];
          delete draftState.recordTables[action.payload.recordSetID];
          break;
        }
        case MAP_LABEL_EXTENT_FILTER_SUCCESS: {
          draftState.labelBoundsPolygon = action.payload.bounds;
          break;
        }
        case MAP_SET_COORDS: {
          const userCoords = { ...action?.payload?.position?.coords };
          draftState.userCoords = {
            lat: userCoords.latitude,
            long: userCoords.longitude,
            accuracy: userCoords.accuracy,
            heading: userCoords.heading
          };
          draftState.userHeading = userCoords.heading;
          break;
        }
        case MAP_SET_WHATS_HERE_PAGE_LIMIT: {
          draftState.whatsHere.page = action.payload.page;
          draftState.whatsHere.limit = action.payload.limit;
          break;
        }
        case MAP_SET_WHATS_HERE_SECTION: {
          draftState.whatsHere.section = action.payload.section;
          draftState.whatsHere.page = 0;
          draftState.whatsHere.limit = 5;
          break;
        }
        case MAP_TOGGLE_ACCURACY: {
          draftState.accuracyToggle = !state.accuracyToggle;
          break;
        }
        case MAP_TOGGLE_BASEMAP: {
          draftState.baseMapToggle = !state.baseMapToggle;
          break;
        }
        case MAP_TOGGLE_HD: {
          draftState.HDToggle = !state.HDToggle;
          break;
        }
        case MAP_TOGGLE_LEGENDS: {
          draftState.legendsPopup = !state.legendsPopup;
          break;
        }
        case MAP_TOGGLE_PANNED: {
          draftState.panned = !state.panned;
          break;
        }
        case MAP_TOGGLE_TRACKING: {
          draftState.positionTracking = !state.positionTracking;
          break;
        }
        case MAP_TOGGLE_WHATS_HERE: {
          if(draftState.whatsHere.toggle) {
            draftState.whatsHere.loadingActivities = false
            draftState.whatsHere.loadingIAPP = false
          }
          draftState.whatsHere.toggle = !state.whatsHere.toggle;
          draftState.whatsHere.feature = null;
          draftState.whatsHere.iappRows = [];
          draftState.whatsHere.activityRows = [];
          draftState.whatsHere.limit = 5;
          draftState.whatsHere.page = 0;
          break;
        }
        case MAP_WHATS_HERE_FEATURE: {
          draftState.whatsHere.loadingActivities = true;
          draftState.whatsHere.loadingIAPP = true;
          draftState.whatsHere.feature = action.payload.feature;
          draftState.whatsHere.toggle = state.whatsHere.toggle;
          break;
        }
        case MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED: {
          draftState.whatsHere.ActivityIDs = [...action.payload.IDs];
          draftState.whatsHere.activityRows = [];
          draftState.whatsHere.ActivityPage = 0;
          draftState.whatsHere.ActivityLimit = 5;
          break;
        }
        case MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED: {
          draftState.whatsHere.IAPPIDs = [...action.payload.IDs];
          draftState.whatsHere.iappRows = [];
          draftState.whatsHere.IAPPPage = 0;
          draftState.whatsHere.IAPPLimit = 5;
          break;
        }
        case MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY: {
          draftState.whatsHere.highlightedType = 'Activity';
          draftState.whatsHere.highlightedURLID = action.payload.id;
          draftState.whatsHere.highlightedIAPP = null;
          draftState.whatsHere.highlightedACTIVITY = action.payload.short_id;
          draftState.whatsHere.highlightedGeo = state?.whatsHere?.activityRows.filter((row) => {
            return row.short_id === action.payload.short_id;
          })[0];
          break;
        }
        case MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP: {
          draftState.whatsHere.highlightedType = 'IAPP';
          draftState.whatsHere.highlightedURLID = action.payload.id;
          draftState.whatsHere.highlightedIAPP = action.payload.id;
          draftState.whatsHere.highlightedACTIVITY = null;
          draftState.whatsHere.highlightedGeo = state?.whatsHere?.iappRows.filter((row) => {
            return row.site_id === action.payload.id;
          })[0];
          break;
        }
        case OVERLAY_MENU_TOGGLE: {
          draftState.userRecordOnClickMenuOpen = false;
          break;
        }
        case PAGE_OR_LIMIT_UPDATE: {
          draftState.recordTables[action.payload.setID].page = action.payload.page;
          draftState.recordTables[action.payload.setID].limit = action.payload.limit;
          break;
        }
        case RECORDSETS_TOGGLE_VIEW_FILTER: {
          draftState.viewFilters = !draftState.viewFilters;
          break;
        }
        case RECORDSET_REMOVE_FILTER: {
          draftState.recordTables[action.payload.setID].page = 0;
          break;
        }
        case RECORDSET_UPDATE_FILTER: {
          draftState.recordTables[action.payload.setID].page = 0;
          break;
        }
        case RECORD_SET_TO_EXCEL_FAILURE: {
          draftState.CanTriggerCSV = true;
          break;
        }
        case RECORD_SET_TO_EXCEL_REQUEST: {
          draftState.CanTriggerCSV = false;
          break;
        }
        case RECORD_SET_TO_EXCEL_SUCCESS: {
          draftState.CanTriggerCSV = true;
          draftState.linkToCSV = action.payload.link;
          draftState.recordSetForCSV = action.payload.id;
          break;
        }
        case REMOVE_CLIENT_BOUNDARY: {
          const index = draftState.clientBoundaries.findIndex((cb) => cb.id === action.payload.id);
          draftState.clientBoundaries.splice(index, 1);
          break;
        }
        case SET_CURRENT_OPEN_SET: {
          draftState.currentOpenSet = action.payload.set;
          break;
        }
        case SET_TOO_MANY_LABELS_DIALOG: {
          draftState.tooManyLabelsDialog = action.payload.dialog;
          break;
        }
        case TOGGLE_BASIC_PICKER_LAYER: {
          for (const layerNameProperty in action.payload) {
            //if exists, toggle
            if (state.simplePickerLayers[layerNameProperty]) {
              draftState.simplePickerLayers[layerNameProperty] = !state.simplePickerLayers[layerNameProperty];
            } else {
              // doesn't exist, getting turned on
              draftState.simplePickerLayers[layerNameProperty] = true;
            }
          }
          break;
        }
        case TOGGLE_CUSTOMIZE_LAYERS: {
          draftState.customizeLayersToggle = !draftState.customizeLayersToggle;
          break;
        }
        case TOGGLE_QUICK_PAN_TO_RECORD: {
          draftState.quickPanToRecord = !state.quickPanToRecord;
          break;
        }
        case URL_CHANGE: {
          draftState.userRecordOnClickMenuOpen = false;
          break;
        }
        case USER_CLICKED_RECORD: {
          draftState.userRecordOnClickMenuOpen = true;
          draftState.userRecordOnClickRecordType = action.payload.recordType;
          draftState.userRecordOnClickRecordID = action.payload.id;
          draftState.userRecordOnClickRecordRow = action.payload.row;
          break;
        }
        case USER_HOVERED_RECORD: {
          draftState.userRecordOnHoverMenuOpen = true;
          draftState.userRecordOnHoverRecordType = action.payload.recordType;
          draftState.userRecordOnHoverRecordID = action.payload.id;
          draftState.userRecordOnHoverRecordRow = action.payload.row;
          break;
        }
        case USER_SETTINGS_DELETE_KML_SUCCESS: {
          const index = draftState.serverBoundaries.findIndex((sb) => sb.id === action.payload.server_id);
          draftState.serverBoundaries.splice(index, 1);
          break;
        }
        case USER_TOUCHED_RECORD: {
          draftState.userRecordOnHoverMenuOpen = true;
          draftState.userRecordOnHoverRecordType = action.payload.recordType;
          draftState.userRecordOnHoverRecordID = action.payload.id;
          draftState.userRecordOnHoverRecordRow = action.payload.row;
          draftState.touchTime = Date.now();
          break;
        }
        case WHATS_HERE_ACTIVITY_ROWS_SUCCESS: {
          draftState.whatsHere.loadingActivities = false;
          draftState.whatsHere.activityRows = [...action.payload.data];
          break;
        }
        case WHATS_HERE_IAPP_ROWS_SUCCESS: {
          draftState.whatsHere.loadingIAPP = false;
          draftState.whatsHere.iappRows = [...action.payload.data];
          break;
        }
        case WHATS_HERE_PAGE_ACTIVITY: {
          draftState.whatsHere.ActivityPage = action.payload.page;
          draftState.whatsHere.ActivityLimit = action.payload.limit;
          break;
        }
        case WHATS_HERE_PAGE_POI: {
          draftState.whatsHere.IAPPPage = action.payload.page;
          draftState.whatsHere.IAPPLimit = action.payload.limit;
          break;
        }
        case WHATS_HERE_SORT_FILTER_UPDATE: {
          if (action.payload.recordType === 'IAPP') {
            draftState.whatsHere.IAPPPage = 0;
            draftState.whatsHere.IAPPSortField = action.payload.field;
            draftState.whatsHere.IAPPSortDirection = action.payload.direction;
          } else {
            draftState.whatsHere.ActivityPage = 0;
            draftState.whatsHere.ActivitySortField = action.payload.field;
            draftState.whatsHere.ActivitySortDirection = action.payload.direction;
          }
          break;
        }
        default:
          break;
      }
    }) as unknown as MapState;
  };
}

const selectMap: (state) => MapState = (state) => state.Map;

export { createMapReducer, selectMap };

const GeoJSONFilterSetForLayer = (draftState, state, typeToFilter, recordSetID, IDList) => {
  if (
    !draftState.layers?.length ||
    (!draftState.activitiesGeoJSONDict && typeToFilter === 'Activity') ||
    (!draftState.IAPPGeoJSONDict && typeToFilter === 'IAPP')
  )
    return;
  let index = draftState.layers.findIndex((layer) => layer.recordSetID === recordSetID);
  const type = draftState.layers[index].type;

  if (index && type === typeToFilter && type === 'Activity') {
    let filtered = [];
    IDList.map((id) => {
      let f = draftState.activitiesGeoJSONDict[id];
      if (f !== undefined) {
        filtered.push(f);
      }
    });

    draftState.layers[index].geoJSON = {
      type: 'FeatureCollection',
      features: filtered
    };
  } else if (type === typeToFilter && type === 'IAPP') {
    let filtered = [];
    IDList.map((id) => {
      let f = draftState.IAPPGeoJSONDict[id];
      if (f !== undefined) {
        filtered.push(f);
      }
    });

    draftState.layers[index].geoJSON = {
      type: 'FeatureCollection',
      features: filtered
    };
  }
};
