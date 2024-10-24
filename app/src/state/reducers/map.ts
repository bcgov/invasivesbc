import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import {
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
  ACTIVITY_PAGE_MAP_EXTENT_TOGGLE,
  CSV_LINK_CLICKED,
  CUSTOM_LAYER_DRAWN,
  DRAW_CUSTOM_LAYER,
  FILTERS_PREPPED_FOR_VECTOR_ENDPOINT,
  IAPP_EXTENT_FILTER_SUCCESS,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  IAPP_PAN_AND_ZOOM,
  IAPP_TABLE_ROWS_GET_REQUEST,
  IAPP_TABLE_ROWS_GET_SUCCESS,
  INIT_SERVER_BOUNDARIES_GET,
  MAIN_MAP_MOVE,
  MAP_CHOOSE_BASEMAP,
  MAP_DELETE_LAYER_AND_TABLE,
  MAP_LABEL_EXTENT_FILTER_SUCCESS,
  MAP_MODE_SET,
  MAP_SET_COORDS,
  MAP_TOGGLE_ACCURACY,
  MAP_TOGGLE_GEOJSON_CACHE,
  MAP_TOGGLE_LEGENDS,
  MAP_TOGGLE_OVERLAY,
  MAP_TOGGLE_PANNED,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_START,
  MAP_TOGGLE_TRACKING,
  MAP_TOGGLE_TRACKING_OFF,
  MAP_TOGGLE_TRACKING_ON,
  MAP_UPDATE_AVAILABLE_BASEMAPS,
  MAP_UPDATE_AVAILABLE_OVERLAYS,
  OVERLAY_MENU_TOGGLE,
  PAGE_OR_LIMIT_UPDATE,
  PAN_AND_ZOOM_TO_ACTIVITY,
  RECORD_SET_TO_EXCEL_FAILURE,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_UPDATE_FILTER,
  RECORDSETS_TOGGLE_VIEW_FILTER,
  REMOVE_CLIENT_BOUNDARY,
  SET_CURRENT_OPEN_SET,
  SET_TOO_MANY_LABELS_DIALOG,
  TOGGLE_BASIC_PICKER_LAYER,
  TOGGLE_CUSTOMIZE_LAYERS,
  TOGGLE_DRAWN_LAYER,
  TOGGLE_KML_LAYER,
  TOGGLE_LAYER_PICKER_OPEN,
  TOGGLE_QUICK_PAN_TO_RECORD,
  TOGGLE_WMS_LAYER,
  URL_CHANGE,
  USER_CLICKED_RECORD,
  USER_HOVERED_RECORD,
  USER_TOUCHED_RECORD
} from '../actions';
import { AppConfig } from '../config';
import { getUuid } from './userSettings';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import GeoShapes from 'constants/geoShapes';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { SortFilter } from 'interfaces/filterParams';
import TileCache from 'state/actions/cache/TileCache';

export enum LeafletWhosEditingEnum {
  ACTIVITY = 'ACTIVITY',
  WHATSHERE = 'WHATSHERE',
  BOUNDARY = 'BOUNDARY',
  NONE = 'NONE'
}

export const ACTIVITY_GEOJSON_SOURCE_KEYS = ['s3', 'draft', 'supplemental'];

const DEFAULT_LOCAL_LAYERS = [
  {
    title: 'Regional Districts',
    type: 'wms',
    url: 'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP',
    toggle: false,
    opacity: 0.4
  },
  {
    title: 'BC Parks',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
    toggle: false
  },
  {
    title: 'Conservancy Areas',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_TANTALIS.TA_CONSERVANCY_AREAS_SVW',
    toggle: false
  },
  {
    title: 'Municipality Boundaries',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP',
    toggle: false
  },
  {
    title: 'Cut blocks',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_FOREST_VEGETATION.VEG_CONSOLIDATED_CUT_BLOCKS_SP',
    toggle: false,
    opacity: 0.5
  },
  {
    title: 'BC Major Watersheds',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS',
    toggle: false
  },
  {
    title: 'Freshwater Atlas Rivers',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_BASEMAPPING.FWA_RIVERS_POLY',
    toggle: false
  },
  {
    title: 'Freshwater Lakes',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP',
    toggle: false
  },
  {
    title: 'Freshwater Atlas Stream Network',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP',
    toggle: false
  },
  {
    title: 'Water Licenses Drinking Water',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SP',
    toggle: false
  },
  {
    title: 'Water Rights Licenses',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV',
    toggle: false
  },
  {
    title: 'Water Wells',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
    toggle: false
  },
  {
    title: 'Digital Road Atlas (DRA) - Master Partially-Attributed Roads',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP',
    toggle: false
  },
  {
    title: 'MOTI RFI',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&raster-opacity=0.5&layers=' +
      'WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP',
    toggle: false
  },
  {
    title: 'PMBC Parcel Cadastre - Private',
    type: 'wms',
    url:
      'https://openmaps.gov.bc.ca/geo/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&style=5899&OWNER_TYPE=Private&raster-opacity=0.5&styles=5903&layers=' +
      'WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW',
    toggle: false,
    opacity: 0.6
  }
].sort((a, b) => (a.title < b.title ? -1 : 1));

export interface MapState {
  [MIGRATION_VERSION_KEY]: number;
  baseMapLayer: string | null;
  availableBaseMapLayers: string[];
  availableOverlayLayers: string[];
  enabledOverlayLayers: string[];
  MapMode: string;
  CanTriggerCSV: boolean;
  IAPPBoundsPolygon: any;
  IAPPGeoJSON: any;
  IAPPGeoJSONDict: object;
  // LeafletWhosEditing: LeafletWhosEditingEnum;
  accuracyToggle: boolean;
  activitiesGeoJSON: any;
  activitiesGeoJSONDict: object;
  activityPageMapExtentToggle: boolean;
  activity_center: [number, number];
  activity_zoom: number;
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
  map_center: [number, number];
  map_zoom: number;
  panned: boolean;
  positionTracking: boolean;
  track_me_draw_geo: {
    isTracking: boolean;
    type: GeoShapes | null;
    drawingShape: boolean;
  };
  quickPanToRecord: boolean;
  recordSetForCSV: number;
  recordTables: object;
  serverBoundaries: any[];
  simplePickerLayers2: any[];
  simplePickerLayers: object;
  tooManyLabelsDialog: any;
  userCoords: any;
  userRecordOnClickMenuOpen: boolean;
  userRecordOnClickRecordID: string | null;
  userRecordOnClickRecordRow: any;
  userRecordOnClickRecordType: string | null;
  userRecordOnHoverMenuOpen: boolean;
  userRecordOnHoverRecordID: any;
  userRecordOnHoverRecordRow: any;
  userRecordOnHoverRecordType: any;
  viewFilters: boolean;
  whatsHere: {
    toggle: boolean;
    feature: any | null;
    limit: number;
    page: number;
    section: string;

    clickedActivity: any | null;
    clickedActivityDescription: string | null;
    clickedIAPP: any | null;
    clickedIAPPDescription: string | null;

    loadingActivities: boolean;
    loadingIAPP: boolean;

    highlightedType: 'IAPP' | 'Activity' | null;
    highlightedURLID: string | null;
    highlightedIAPP: string | null;
    highlightedACTIVITY: any | null;
    highlightedGeo: any | null;

    ActivityIDs: any[];
    activityRows: any[];
    ActivityPage: number;
    ActivityLimit: number;
    ActivitySortField: string;
    ActivitySortDirection: string;

    IAPPIDs: string[];
    iappRows: any[];
    IAPPPage: number;
    IAPPLimit: number;
    IAPPSortField: string;
    IAPPSortDirection: string;

    serverActivityIDs: any[];
    serverIAPPIDs: any[];
  };

  workingLayerName: string;
  layerPickerOpen: boolean;

  tileCacheMode: boolean;

  //
  //   constructor()
  //
  // {
  //   this.CanTriggerCSV = true;
  //   this.HDToggle = false;
  //   this.IAPPBoundsPolygon = null;
  //   this.LeafletWhosEditing = LeafletWhosEditingEnum.NONE;
  //   this.accuracyToggle = false;
  //   this.activityPageMapExtentToggle = false;
  //   this.activity_center = [53, -127];
  //   this.activity_zoom = 5;
  //   this.baseMapToggle = false;
  //   this.clientBoundaries =
  //     localStorage.getItem('CLIENT_BOUNDARIES') !== null
  //       ? (JSON.parse(localStorage.getItem('CLIENT_BOUNDARIES')) as Array<any>)
  //       : [];
  //   this.currentOpenSet = null;
  //   this.customizeLayersToggle = false;
  //   this.drawingCustomLayer = false;
  //   this.layerPickerOpen = false;
  //   this.layers = [];
  //   this.initialized = false;
  //   this.labelBoundsPolygon = null;
  //   this.legendsPopup = false;
  //   this.linkToCSV = null;
  //   this.map_center = [53, -127];
  //   this.map_zoom = 5;
  //   this.panned = true;
  //   this.positionTracking = false;
  //   this.quickPanToRecord = false;
  //   this.quickPanToRecord = false;
  //   this.recordSetForCSV = null;
  //   this.recordTables = {};
  //   this.serverBoundaries = ;
  //   this.simplePickerLayers = [];

  //   this.tooManyLabelsDialog = { dialogActions: [], dialogOpen: false, dialogTitle: '', dialogContentText: null };
  //   this.userHeading = null;
  //   this.userRecordOnClickMenuOpen = false;
  //   this.viewFilters = true;
  //   this.whatsHere = {
  //     ActivityIDs: [],
  //     ActivityLimit: 5,
  //     ActivityPage: 0,
  //     ActivitySortDirection: 'desc',
  //     ActivitySortField: 'created',
  //     IAPPIDs: [],
  //     IAPPLimit: 5,
  //     IAPPPage: 0,
  //     IAPPSortDirection: 'desc',
  //     IAPPSortField: 'earliest_survey',
  //     activityRows: [],
  //     feature: null,
  //     highlightedType: null,
  //     iappRows: [],
  //     limit: 5,
  //     page: 0,
  //     section: 'invasivesbc',
  //     toggle: false
  //   };
  //   this.workingLayerName = null;
  // }
}

const initialState: MapState = {
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,

  activity_center: [53, -127],
  activity_zoom: 7,

  map_center: [55, -128],
  map_zoom: 5,

  userRecordOnClickMenuOpen: false,
  userRecordOnClickRecordID: null,
  userRecordOnClickRecordRow: null,
  userRecordOnClickRecordType: null,

  CanTriggerCSV: true,

  accuracyToggle: false,

  IAPPBoundsPolygon: undefined,
  IAPPGeoJSON: undefined,
  IAPPGeoJSONDict: {},

  activitiesGeoJSON: undefined,
  activitiesGeoJSONDict: {},
  activityPageMapExtentToggle: false,

  baseMapLayer: null,
  availableBaseMapLayers: [],

  availableOverlayLayers: [],
  enabledOverlayLayers: [],

  clientBoundaries: [],
  currentOpenSet: null,
  customizeLayersToggle: false,
  drawingCustomLayer: false,
  error: false,
  initialized: false,
  labelBoundsPolygon: undefined,
  layerPickerOpen: false,
  layers: [],
  legendsPopup: undefined,
  linkToCSV: '',
  MapMode: 'VECTOR_ENDPOINT',
  panned: false,
  positionTracking: false,
  track_me_draw_geo: {
    isTracking: false,
    type: null,
    drawingShape: false
  },
  quickPanToRecord: false,

  recordSetForCSV: 0,
  recordTables: {},

  serverBoundaries: [],
  simplePickerLayers: undefined,
  simplePickerLayers2: DEFAULT_LOCAL_LAYERS,
  tooManyLabelsDialog: null,

  tileCacheMode: false,

  userCoords: null,
  userRecordOnHoverMenuOpen: false,
  userRecordOnHoverRecordID: undefined,
  userRecordOnHoverRecordRow: undefined,
  userRecordOnHoverRecordType: undefined,
  viewFilters: true,
  whatsHere: {
    toggle: false,
    limit: 5,
    page: 0,
    feature: null,
    section: 'invasivesbc',

    clickedActivity: null,
    clickedActivityDescription: null,
    clickedIAPP: null,
    clickedIAPPDescription: null,

    highlightedType: null,
    highlightedURLID: null,
    highlightedIAPP: null,
    highlightedACTIVITY: null,
    highlightedGeo: null,

    loadingActivities: false,
    activityRows: [],
    ActivityIDs: [],
    ActivityPage: 0,
    ActivityLimit: 5,
    ActivitySortField: 'created',
    ActivitySortDirection: SortFilter.Desc,

    loadingIAPP: false,
    iappRows: [],
    IAPPIDs: [],
    IAPPPage: 0,
    IAPPLimit: 5,
    IAPPSortField: 'earliest_survey',
    IAPPSortDirection: SortFilter.Desc,

    serverActivityIDs: [],
    serverIAPPIDs: []
  },
  workingLayerName: ''
};

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
    return createNextState(state, (draftState: Draft<MapState>) => {
      if (UserSettings.RecordSet.remove.match(action)) {
        const index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload);
        draftState.layers.splice(index, 1);
      } else if (UserSettings.RecordSet.set.match(action)) {
        const layerIndex = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.setName);
        Object.keys(action.payload.updatedSet).map((key) => {
          if (['color', 'mapToggle', 'drawOrder', 'labelToggle'].includes(key)) {
            draftState.layers[layerIndex].layerState[key] = action.payload.updatedSet[key];
          }
        });
        if (draftState.layers[layerIndex].layerState.mapToggle === false) {
          draftState.layers[layerIndex].layerState.labelToggle = false;
        }
      } else if (UserSettings.KML.deleteSuccess.match(action)) {
        const index = draftState.serverBoundaries.findIndex((sb) => sb.id === action.payload);
        draftState.serverBoundaries.splice(index, 1);
      } else if (UserSettings.InitState.getSuccess.match(action)) {
        Object.keys(action.payload.recordSets).map((setID) => {
          let layerIndex = draftState.layers.findIndex((layer) => layer.recordSetID === setID);
          if (!draftState.layers[layerIndex]) {
            draftState.layers.push({ recordSetID: setID, type: action.payload.recordSets[setID].recordSetType });
            layerIndex = draftState.layers.findIndex((layer) => layer.recordSetID === setID);
          }
          draftState.layers[layerIndex].layerState = {};
          if (action.payload.recordSets[setID].colorScheme)
            draftState.layers[layerIndex].layerState.colorScheme = action.payload.recordSets[setID].colorScheme;
          if (action.payload.recordSets[setID].color)
            draftState.layers[layerIndex].layerState.color = action.payload.recordSets[setID].color;
          if (action.payload.recordSets[setID].mapToggle)
            draftState.layers[layerIndex].layerState.mapToggle = action.payload.recordSets[setID].mapToggle;
          if (action.payload.recordSets[setID].labelToggle)
            draftState.layers[layerIndex].layerState.labelToggle = action.payload.recordSets[setID].labelToggle;
          if (action.payload.recordSets[setID].drawOrder)
            draftState.layers[layerIndex].layerState.drawOrder = action.payload.recordSets[setID].drawOrder;
        });
      } else if (WhatsHere.map_init_get_poi_ids_fetched.match(action)) {
        draftState.whatsHere.IAPPIDs = action.payload ?? [];
        draftState.whatsHere.iappRows = [];
        draftState.whatsHere.IAPPPage = 0;
        draftState.whatsHere.IAPPLimit = 15;
      } else if (WhatsHere.map_init_get_activity_ids_fetched.match(action)) {
        draftState.whatsHere.ActivityIDs = [...action.payload];
        draftState.whatsHere.activityRows = [];
        draftState.whatsHere.ActivityPage = 0;
        draftState.whatsHere.ActivityLimit = 15;
      } else if (WhatsHere.map_feature.match(action)) {
        draftState.whatsHere.clickedActivity = null;
        draftState.whatsHere.clickedActivityDescription = null;
        draftState.whatsHere.clickedIAPP = null;
        draftState.whatsHere.clickedIAPPDescription = null;
        draftState.whatsHere.loadingActivities = true;
        draftState.whatsHere.loadingIAPP = true;
        draftState.whatsHere.feature = action.payload;
        draftState.whatsHere.toggle = state.whatsHere.toggle;
        draftState.whatsHere.limit = 5;
        draftState.whatsHere.page = 0;
      } else if (WhatsHere.server_filtered_ids_fetched.match(action)) {
        draftState.whatsHere.serverActivityIDs = action.payload.activities;
        draftState.whatsHere.serverIAPPIDs = action.payload.iapp;

        const toggledOnActivityLayers = draftState.layers.filter(
          (layer) => layer.type === RecordSetType.Activity && layer.layerState.mapToggle
        );

        const toggledOnIAPPLayers = draftState.layers.filter(
          (layer) => layer.type === RecordSetType.IAPP && layer.layerState.mapToggle
        );

        let localActivityIDs = [];

        toggledOnActivityLayers.map((layer) => {
          localActivityIDs = localActivityIDs.concat(layer.IDList);
        });

        let localIAPPIDs = [];

        toggledOnIAPPLayers.map((layer) => {
          localIAPPIDs = localIAPPIDs.concat(layer.IDList);
        });

        const iappIDs = [];
        const activityIDs = [];
        localIAPPIDs.map((l) => draftState.whatsHere.serverIAPPIDs.includes(l) && iappIDs.push(l));
        localActivityIDs.map((l) => draftState.whatsHere.serverActivityIDs.includes(l) && activityIDs.push(l));

        draftState.whatsHere.ActivityIDs = Array.from(new Set(activityIDs));
        draftState.whatsHere.IAPPIDs = Array.from(new Set(iappIDs));
      } else if (WhatsHere.sort_filter_update.match(action)) {
        if (action.payload.type === RecordSetType.IAPP) {
          draftState.whatsHere.IAPPPage = 0;
          draftState.whatsHere.IAPPSortField = action.payload.field;
          draftState.whatsHere.IAPPSortDirection = action.payload.direction;
        } else {
          draftState.whatsHere.ActivityPage = 0;
          draftState.whatsHere.ActivitySortField = action.payload.field;
          draftState.whatsHere.ActivitySortDirection = action.payload.direction;
        }
      } else if (WhatsHere.toggle.match(action)) {
        if (draftState.whatsHere.toggle) {
          draftState.whatsHere.loadingActivities = false;
          draftState.whatsHere.loadingIAPP = false;
        } else {
          draftState.whatsHere.toggle = !state.whatsHere.toggle;
          draftState.whatsHere.feature = null;
          draftState.whatsHere.iappRows = [];
          draftState.whatsHere.activityRows = [];
          draftState.whatsHere.limit = 5;
          draftState.whatsHere.page = 0;
        }
      } else if (WhatsHere.map_set_section.match(action)) {
        draftState.whatsHere.section = action.payload;
        draftState.whatsHere.page = 0;
        draftState.whatsHere.limit = 5;
      } else if (WhatsHere.set_highlighted_iapp.match(action)) {
        draftState.userRecordOnHoverRecordRow = {
          id: action.payload,
          geometry: state?.whatsHere?.iappRows.filter((row) => {
            return row.site_id === action.payload;
          })[0].geometry
        };
        draftState.userRecordOnHoverRecordType = RecordSetType.IAPP;
        // to delete:
        draftState.whatsHere.highlightedType = RecordSetType.IAPP;
        draftState.whatsHere.highlightedURLID = action.payload;
        draftState.whatsHere.highlightedIAPP = action.payload;
        draftState.whatsHere.highlightedACTIVITY = null;
        draftState.whatsHere.highlightedGeo = state?.whatsHere?.iappRows.filter((row) => {
          return row.site_id === action.payload;
        })[0];
      } else if (WhatsHere.set_highlighted_activity.match(action)) {
        draftState.userRecordOnHoverRecordRow = {
          id: action.payload.id,
          short_id: action.payload.short_id,
          geometry: [
            state?.whatsHere?.activityRows.filter((row) => {
              return row.short_id === action.payload.short_id;
            })[0].geometry
          ]
        };
        draftState.userRecordOnHoverRecordType = RecordSetType.Activity;
        draftState.whatsHere.highlightedType = RecordSetType.Activity;
        draftState.whatsHere.highlightedURLID = action.payload.id;
        draftState.whatsHere.highlightedIAPP = null;
        draftState.whatsHere.highlightedACTIVITY = action.payload.short_id;
        draftState.whatsHere.highlightedGeo = state?.whatsHere?.activityRows.filter((row) => {
          return row.short_id === action.payload.short_id;
        })[0];
      } else if (WhatsHere.iapp_rows_success.match(action)) {
        draftState.whatsHere.loadingIAPP = false;
        draftState.whatsHere.iappRows = [...action.payload];
      } else if (WhatsHere.activity_rows_success.match(action)) {
        draftState.whatsHere.loadingActivities = false;
        draftState.whatsHere.activityRows = [...action.payload];
      } else if (WhatsHere.id_clicked.match(action)) {
        if (action.payload.type === RecordSetType.Activity) {
          draftState.whatsHere.clickedActivity = action.payload.id;
          draftState.whatsHere.clickedActivityDescription = action.payload.description ?? null;
        } else if (action.payload.type === RecordSetType.IAPP) {
          draftState.whatsHere.clickedIAPP = action.payload.id;
          draftState.whatsHere.clickedIAPPDescription = action.payload.description ?? null;
        }
      } else if (WhatsHere.map_page_limit.match(action)) {
        draftState.whatsHere.page = action.payload.page;
        draftState.whatsHere.limit = action.payload.limit;
      } else if (WhatsHere.page_activity.match(action)) {
        draftState.whatsHere.ActivityPage = action.payload.page;
        draftState.whatsHere.ActivityLimit = action.payload.limit;
      } else if (WhatsHere.page_poi.match(action)) {
        draftState.whatsHere.IAPPPage = action.payload.page;
        draftState.whatsHere.IAPPLimit = action.payload.limit;
      } else if (TileCache.setMapTileCacheMode.match(action)) {
        draftState.tileCacheMode = action.payload;
      } else {
        switch (action.type) {
          case TOGGLE_LAYER_PICKER_OPEN:
            draftState.layerPickerOpen = !draftState.layerPickerOpen;
            break;
          case TOGGLE_WMS_LAYER:
            const index = draftState.simplePickerLayers2.findIndex((layer) => layer.url === action.payload.layer.url);
            draftState.simplePickerLayers2[index].toggle = !draftState.simplePickerLayers2[index]?.toggle;
            break;
          case TOGGLE_DRAWN_LAYER: {
            const index = draftState.clientBoundaries.findIndex((layer) => layer.id === action.payload.layer.id);
            draftState.clientBoundaries[index].toggle = !draftState.clientBoundaries[index]?.toggle;
            break;
          }
          case MAP_TOGGLE_GEOJSON_CACHE: {
            draftState.MapMode = draftState.MapMode === 'VECTOR_ENDPOINT' ? 'GEOJSON' : 'VECTOR_ENDPOINT';
            break;
          }
          case IAPP_TABLE_ROWS_GET_REQUEST:
          case ACTIVITIES_TABLE_ROWS_GET_REQUEST: {
            if (!draftState.recordTables?.[action.payload.recordSetID]) {
              draftState.recordTables[action.payload.recordSetID] = {};
            }
            draftState.recordTables[action.payload.recordSetID].loading = true;
            draftState.recordTables[action.payload.recordSetID].page = action.payload.page;
            draftState.recordTables[action.payload.recordSetID].limit = action.payload.limit;
            draftState.recordTables[action.payload.recordSetID].tableFiltersHash = action.payload.tableFiltersHash;
            break;
          }
          case ACTIVITIES_GEOJSON_GET_SUCCESS: {
            // Everything should point to this now instead:
            draftState.activitiesGeoJSONDict = {
              ...draftState.activitiesGeoJSONDict,
              ...action.payload.activitiesGeoJSONDict
            };

            if (
              draftState.layers?.filter(
                (layer) => layer.type === RecordSetType.Activity && layer.IDList?.length !== undefined
              ).length > 0
            ) {
              const activityLayersToRegen = draftState.layers?.filter(
                (layer) => layer.type === RecordSetType.Activity && layer.IDList?.length !== undefined
              );
              activityLayersToRegen.map((layer) => {
                GeoJSONFilterSetForLayer(draftState, state, RecordSetType.Activity, layer.recordSetID, layer.IDList);
              });
            }
            break;
          }
          case ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST: {
            let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
            if (!draftState.layers[index]) {
              draftState.layers.push({ recordSetID: action.payload.recordSetID, type: RecordSetType.Activity });
              index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
            }
            draftState.layers[index].tableFiltersHash = action.payload.tableFiltersHash;
            draftState.layers[index].loading = true;
            if (!draftState.layers[index].layerState) {
              draftState.layers[index].layerState = {
                color: 'blue',
                drawOrder: 0,
                mapToggle: false
              };
            }
            break;
          }
          case IAPP_GET_IDS_FOR_RECORDSET_REQUEST:
          case ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS: {
            let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
            if (!draftState.layers[index])
              draftState.layers.push({ recordSetID: action.payload.recordSetID, type: RecordSetType.Activity });
            index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);

            if (action.payload.tableFiltersHash !== draftState.layers[index]?.tableFiltersHash) {
              break;
            }
            draftState.layers[index].IDList = action.payload.IDList;
            if (draftState.MapMode === 'VECTOR_ENDPOINT') {
              draftState.layers[index].loading = false;
            }

            //if (draftState.activitiesGeoJSON?.features?.length > 0) {
            if (draftState.MapMode !== 'VECTOR_ENDPOINT' && draftState.activitiesGeoJSONDict !== undefined) {
              GeoJSONFilterSetForLayer(
                draftState,
                state,
                RecordSetType.Activity,
                action.payload.recordSetID,
                action.payload.IDList
              );
            }
            break;
          }
          case MAP_MODE_SET:
            draftState.MapMode = action.payload;
            switch (action.payload) {
              case 'VECTOR_ENDPOINT':
                draftState.activitiesGeoJSONDict = {};
                draftState.IAPPGeoJSONDict = {};
                draftState.layers = draftState.layers.map((layer) => {
                  delete layer.geoJSON;
                  return layer;
                });
                break;
            }
            break;
          case FILTERS_PREPPED_FOR_VECTOR_ENDPOINT: {
            let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
            if (!draftState.layers[index]) {
              draftState.layers.push({ recordSetID: action.payload.recordSetID, type: action.payload.recordSetType });
            }
            index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);

            draftState.layers[index].filterObject = action.payload.filterObject;
            draftState.layers[index].tableFiltersHash = action.payload.tableFiltersHash;
            break;
          }
          case IAPP_TABLE_ROWS_GET_SUCCESS:
          case ACTIVITIES_TABLE_ROWS_GET_SUCCESS: {
            // the hash, page, and limit all need to line up
            if (
              draftState.recordTables?.[action.payload.recordSetID]?.tableFiltersHash !==
              action.payload.tableFiltersHash
            ) {
              console.warn(
                'hash mismatch',
                draftState.recordTables?.[action.payload.recordSetID]?.tableFiltersHash,
                action.payload.tableFiltersHash
              );
              break;
            }
            if (Number(draftState.recordTables?.[action.payload.recordSetID]?.limit) !== Number(action.payload.limit)) {
              console.warn(
                'limit mismatch',
                draftState.recordTables?.[action.payload.recordSetID]?.limit,
                action.payload.limit
              );
              console.warn(
                'typeof',
                typeof draftState.recordTables?.[action.payload.recordSetID]?.limit,
                typeof action.payload.limit
              );
              break;
            }
            if (Number(draftState.recordTables?.[action.payload.recordSetID]?.page) !== Number(action.payload.page)) {
              console.warn(
                'page mismatch',
                draftState.recordTables?.[action.payload.recordSetID]?.page,
                action.payload.page
              );
              break;
            }
            if (draftState.recordTables?.[action.payload.recordSetID]) {
              draftState.recordTables[action.payload.recordSetID].rows = action.payload.rows;
            } else {
              draftState.recordTables[action.payload.recordSetID] = {};
              draftState.recordTables[action.payload.recordSetID].rows = action.payload.rows;
            } // set defaults
            draftState.recordTables[action.payload.recordSetID].loading = false;
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
              geojson: action.payload,
              toggle: true
            });
            draftState.workingLayerName = null;
            break;
          }
          case DRAW_CUSTOM_LAYER: {
            draftState.drawingCustomLayer = true;
            draftState.workingLayerName = action.payload.name;
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
              if (!feature.properties.site_id) console.warn('no site_id', feature);
              if (feature?.properties?.site_id) {
                draftState.IAPPGeoJSONDict[feature.properties.site_id] = feature;
              }
            });

            if (
              draftState.layers?.filter(
                (layer) => layer.type === RecordSetType.IAPP && layer.IDList?.length !== undefined
              ).length > 0
            ) {
              const IAPPLayersToRegen = draftState.layers?.filter(
                (layer) => layer.type === RecordSetType.IAPP && layer.IDList?.length !== undefined
              );
              IAPPLayersToRegen.map((layer) => {
                GeoJSONFilterSetForLayer(draftState, state, RecordSetType.IAPP, layer.recordSetID, layer.IDList);
              });
            }
            break;
          }
          case IAPP_GET_IDS_FOR_RECORDSET_SUCCESS: {
            let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
            if (!draftState.layers[index]) draftState.layers.push({ recordSetID: action.payload.recordSetID });
            index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
            if (action.payload.tableFiltersHash !== draftState.layers[index]?.tableFiltersHash) {
              break;
            }
            draftState.layers[index].IDList = action.payload.IDList;
            if (draftState.MapMode === 'VECTOR_ENDPOINT') {
              draftState.layers[index].loading = false;
            }

            if (
              draftState.MapMode != 'VECTOR_ENDPOINT' &&
              draftState.IAPPGeoJSONDict !== undefined &&
              Object.keys(draftState.IAPPGeoJSONDict).length > 0
            ) {
              GeoJSONFilterSetForLayer(
                draftState,
                state,
                RecordSetType.IAPP,
                action.payload.recordSetID,
                action.payload.IDList
              );
            }
            break;
          }
          case INIT_SERVER_BOUNDARIES_GET: {
            const withLocalToggles =
              action.payload.data?.map((incomingItem) => {
                const returnVal = { ...incomingItem };
                const existingToggleVal = draftState.serverBoundaries.find((oldItem) => {
                  oldItem.id === incomingItem;
                })?.toggle;
                returnVal.toggle =
                  existingToggleVal !== null && existingToggleVal !== undefined ? existingToggleVal : false;
                return returnVal;
              }) ?? [];
            draftState.serverBoundaries = withLocalToggles;
            const strippedOfShapes = draftState.serverBoundaries.map((item) => {
              const returnVal = { ...item };
              delete returnVal.geojson;
              return returnVal;
            });
            break;
          }
          case TOGGLE_KML_LAYER: {
            const index = draftState.serverBoundaries.findIndex((layer) => layer.id === action.payload.layer.id);
            draftState.serverBoundaries[index].toggle = !draftState.serverBoundaries[index].toggle;
            const strippedOfShapes = draftState.serverBoundaries.map((item) => {
              const returnVal = { ...item };
              delete returnVal.geojson;
              return returnVal;
            });
            break;
          }

          case MAIN_MAP_MOVE: {
            draftState.map_zoom = action.payload.zoom;
            draftState.map_center = action.payload.center;
            draftState.panned = false;
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
            break;
          }
          case MAP_TOGGLE_ACCURACY: {
            draftState.accuracyToggle = !state.accuracyToggle;
            break;
          }
          case MAP_CHOOSE_BASEMAP: {
            draftState.baseMapLayer = action.payload;
            break;
          }
          case MAP_TOGGLE_OVERLAY: {
            if (draftState.enabledOverlayLayers.includes(action.payload)) {
              draftState.enabledOverlayLayers.splice(draftState.enabledOverlayLayers.indexOf(action.payload), 1);
            } else {
              draftState.enabledOverlayLayers.push(action.payload);
            }
            break;
          }
          case MAP_UPDATE_AVAILABLE_BASEMAPS: {
            draftState.availableBaseMapLayers = action.payload;

            // if there was no previously-selected base map layer or if the currently-selected layer became unavailable,
            // then select another
            if (draftState.availableBaseMapLayers.length > 0) {
              if (!draftState.baseMapLayer || !draftState.availableBaseMapLayers.includes(draftState.baseMapLayer)) {
                draftState.baseMapLayer = draftState.availableBaseMapLayers[0];
              }
            }
            break;
          }
          case MAP_UPDATE_AVAILABLE_OVERLAYS: {
            draftState.availableOverlayLayers = action.payload;

            // if a currently-enabled layer was removed, disable it
            const removalList: string[] = [];

            for (const f of draftState.enabledOverlayLayers) {
              if (!action.payload.includes(f)) {
                removalList.push(f);
              }
            }

            for (const r of removalList) {
              draftState.enabledOverlayLayers.splice(draftState.enabledOverlayLayers.indexOf(r), 1);
            }

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
          case IAPP_PAN_AND_ZOOM:
          case PAN_AND_ZOOM_TO_ACTIVITY: {
            draftState.positionTracking = false;
            break;
          }
          case MAP_TOGGLE_TRACKING: {
            if (!state.positionTracking) {
              draftState.panned = true;
            }
            draftState.positionTracking = !state.positionTracking;
            break;
          }
          case MAP_TOGGLE_TRACKING_ON: {
            draftState.panned = true;
            draftState.positionTracking = true;
            break;
          }
          case MAP_TOGGLE_TRACKING_OFF: {
            draftState.positionTracking = false;
            break;
          }
          case MAP_TOGGLE_TRACK_ME_DRAW_GEO_START: {
            draftState.track_me_draw_geo = {
              isTracking: true,
              type: action.payload.type ?? null,
              drawingShape: true
            };
            break;
          }
          case MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE: {
            draftState.track_me_draw_geo = {
              isTracking: false,
              type: null,
              drawingShape: false
            };
            break;
          }
          case MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE: {
            draftState.track_me_draw_geo.drawingShape = false;
            break;
          }
          case MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME: {
            draftState.track_me_draw_geo.drawingShape = true;
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
            if (action.payload?.pathname === '/') {
              // draftState.panelOpen = false;
            }
            if (!action?.payload?.url?.includes('WhatsHere')) {
              draftState.whatsHere.toggle = false;
              draftState.whatsHere.feature = null;
            }
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
          case USER_TOUCHED_RECORD: {
            draftState.userRecordOnHoverMenuOpen = true;
            draftState.userRecordOnHoverRecordType = action.payload.recordType;
            draftState.userRecordOnHoverRecordID = action.payload.id;
            draftState.userRecordOnHoverRecordRow = action.payload.row;
            // draftState.touchTime = Date.now();
            break;
          }
          default:
            break;
        }
      }
    }) as unknown as MapState;
  };
}

const selectMap: (state) => MapState = (state) => state.Map;

export { createMapReducer, selectMap };

const GeoJSONFilterSetForLayer = (draftState, state, typeToFilter, recordSetID, IDList) => {
  if (
    !draftState.layers?.length ||
    (!(Object.keys(draftState.activitiesGeoJSONDict).length === ACTIVITY_GEOJSON_SOURCE_KEYS.length) &&
      typeToFilter === RecordSetType.Activity) ||
    (!draftState.IAPPGeoJSONDict && typeToFilter === RecordSetType.Activity)
  )
    return;
  const index = draftState.layers.findIndex((layer) => layer.recordSetID === recordSetID);
  const type = draftState.layers[index].type;

  if (index !== undefined && type === typeToFilter && type === RecordSetType.Activity) {
    const filtered = [];
    IDList.map((id) => {
      for (const source of ACTIVITY_GEOJSON_SOURCE_KEYS) {
        if (draftState.activitiesGeoJSONDict.hasOwnProperty(source)) {
          const f = draftState.activitiesGeoJSONDict[source][id];
          if (f !== undefined) {
            filtered.push(f);
          }
        }
      }
    });

    draftState.layers[index].geoJSON = {
      type: 'FeatureCollection',
      features: filtered
    };
    draftState.layers[index].loading = false;
  } else if (type === typeToFilter && type === RecordSetType.IAPP) {
    const filtered = [];
    IDList.map((id) => {
      const f = draftState.IAPPGeoJSONDict[id];
      if (f !== undefined && f !== null && f.geometry !== null) {
        filtered.push(f);
      }
    });

    draftState.layers[index].geoJSON = {
      type: 'FeatureCollection',
      features: filtered
    };
    draftState.layers[index].loading = false;
  }
};
