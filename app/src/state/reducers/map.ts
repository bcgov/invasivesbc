import { createNextState, nanoid } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import {
  ACTIVITY_PAGE_MAP_EXTENT_TOGGLE,
  CSV_LINK_CLICKED,
  CUSTOM_LAYER_DRAWN,
  DRAW_CUSTOM_LAYER,
  FILTERS_PREPPED_FOR_VECTOR_ENDPOINT,
  IAPP_EXTENT_FILTER_SUCCESS,
  IAPP_PAN_AND_ZOOM,
  INIT_SERVER_BOUNDARIES_GET,
  MAIN_MAP_MOVE,
  MAP_DELETE_LAYER_AND_TABLE,
  MAP_LABEL_EXTENT_FILTER_SUCCESS,
  MAP_SET_COORDS,
  MAP_TOGGLE_ACCURACY,
  MAP_TOGGLE_LEGENDS,
  MAP_TOGGLE_PANNED,
  MAP_TOGGLE_TRACKING,
  MAP_TOGGLE_TRACKING_OFF,
  MAP_TOGGLE_TRACKING_ON,
  PAGE_OR_LIMIT_UPDATE,
  PAN_AND_ZOOM_TO_ACTIVITY,
  RECORD_SET_TO_EXCEL_FAILURE,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  REMOVE_CLIENT_BOUNDARY,
  SET_CURRENT_OPEN_SET,
  SET_TOO_MANY_LABELS_DIALOG,
  TOGGLE_BASIC_PICKER_LAYER,
  TOGGLE_CUSTOMIZE_LAYERS,
  TOGGLE_DRAWN_LAYER,
  TOGGLE_KML_LAYER,
  TOGGLE_QUICK_PAN_TO_RECORD,
  TOGGLE_WMS_LAYER,
  URL_CHANGE,
  USER_HOVERED_RECORD
} from 'state/actions';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import GeoShapes from 'constants/geoShapes';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetId, RecordSetType } from 'interfaces/UserRecordSet';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { SortFilter } from 'interfaces/filterParams';
import TileCache from 'state/actions/cache/TileCache';
import MapActions from 'state/actions/map';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import IappActions from 'state/actions/activity/Iapp';
import Activity from 'state/actions/activity/Activity';
import RecordCache from 'state/actions/cache/RecordCache';
import { RECORD_COLOURS } from 'constants/colors';
import IRecordTable from 'interfaces/recordTable';

enum LeafletWhosEditingEnum {
  ACTIVITY = 'ACTIVITY',
  WHATSHERE = 'WHATSHERE',
  BOUNDARY = 'BOUNDARY',
  NONE = 'NONE'
}

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

interface MapState {
  [MIGRATION_VERSION_KEY]: number;
  baseMapLayer: string | null;
  availableBaseMapLayers: string[];
  availableOverlayLayers: string[];
  enabledOverlayLayers: string[];
  CanTriggerCSV: boolean;
  IAPPBoundsPolygon: any;
  IAPPGeoJSON: any;
  IAPPGeoJSONDict: object;
  accuracyToggle: boolean;
  activitiesGeoJSON: any;
  activitiesGeoJSONDict: object;
  activityPageMapExtentToggle: boolean;
  activity_center: [number, number];
  activity_zoom: number;
  clientBoundaries: any[];
  currentOpenSet: string | null;
  customizeLayersToggle: boolean;
  drawingCustomLayer: boolean;
  drawingCustomLayerName: string;
  error: boolean;
  initialized: boolean;
  labelBoundsPolygon: any;
  layers: any[];
  legendsPopup: any;
  linkToCSV: string | null;
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
  recordSetForCSV: number | null;
  recordTables: Record<PropertyKey, IRecordTable>;
  serverBoundaries: any[];
  simplePickerLayers2: any[];
  simplePickerLayers: object | undefined;
  tooManyLabelsDialog: any;
  userCoords: any;
  userRecordOnHoverRecordID: any;
  userRecordOnHoverRecordRow: any;
  userRecordOnHoverRecordType: any;
  viewFilters: boolean;
  whatsHere: {
    toggle: boolean;
    feature: any | null;
    limit: number;
    page: number;

    clickedActivity: any | null;
    clickedActivityDescription: string | null;
    clickedIAPP: any | null;

    loadingActivities: boolean;
    loadingIAPP: boolean;

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
  };
  tileCacheMode: boolean;
}

const initialState: MapState = {
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,

  activity_center: [53, -127],
  activity_zoom: 7,

  map_center: [55, -128],
  map_zoom: 5,

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
  drawingCustomLayerName: '',
  error: false,
  initialized: false,
  labelBoundsPolygon: undefined,
  layers: [],
  legendsPopup: undefined,
  linkToCSV: '',
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
  userRecordOnHoverRecordID: undefined,
  userRecordOnHoverRecordRow: undefined,
  userRecordOnHoverRecordType: undefined,
  viewFilters: true,
  whatsHere: {
    toggle: false,
    limit: 5,
    page: 0,
    feature: null,

    clickedActivity: null,
    clickedActivityDescription: null,
    clickedIAPP: null,

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
    IAPPSortDirection: SortFilter.Desc
  }
};

function createMapReducer(): (MapState, AnyAction) => MapState {
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
      if (UserSettings.RecordSet.requestRemoval.fulfilled.match(action)) {
        const index = draftState.layers.findIndex((layer) => layer.recordSetID === action.meta.arg.setId);
        if (index !== -1) {
          draftState.layers.splice(index, 1);
        }
      } else if (UserSettings.RecordSet.set.match(action)) {
        const layerIndex = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.setName);
        Object.keys(action.payload.updatedSet).forEach((key) => {
          if (['color', 'mapToggle', 'drawOrder', 'labelToggle'].includes(key)) {
            draftState.layers[layerIndex].layerState[key] = action.payload.updatedSet[key];
          }
        });
      } else if (
        UserSettings.RecordSet.updateFilter.match(action) ||
        UserSettings.RecordSet.removeFilter.match(action)
      ) {
        draftState.recordTables[action.payload.setID].page = 0;
      } else if (UserSettings.KML.deleteSuccess.match(action)) {
        const index = draftState.serverBoundaries.findIndex((sb) => sb.id === action.payload);
        draftState.serverBoundaries.splice(index, 1);
      } else if (MapActions.toggleOverlay.match(action)) {
        if (draftState.enabledOverlayLayers.includes(action.payload)) {
          draftState.enabledOverlayLayers.splice(draftState.enabledOverlayLayers.indexOf(action.payload), 1);
        } else {
          draftState.enabledOverlayLayers.push(action.payload);
        }
      } else if (MapActions.chooseBaseMap.match(action)) {
        draftState.baseMapLayer = action.payload;
      } else if (MapActions.updateAvailableBaseMaps.match(action)) {
        draftState.availableBaseMapLayers = action.payload;

        // if there was no previously-selected base map layer or if the currently-selected layer became unavailable,
        // then select another
        if (draftState.availableBaseMapLayers.length > 0) {
          if (!draftState.baseMapLayer || !draftState.availableBaseMapLayers.includes(draftState.baseMapLayer)) {
            draftState.baseMapLayer = draftState.availableBaseMapLayers[0];
          }
        }
      } else if (MapActions.updateAvailableOverlays.match(action)) {
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
      } else if (UserSettings.InitState.getSuccess.match(action)) {
        Object.keys(action.payload.recordSets).forEach((setID) => {
          if (setID !== RecordSetId.OfflineActivities) {
            let layerIndex = draftState.layers.findIndex((layer) => layer.recordSetID === setID);
            if (!draftState.layers[layerIndex]) {
              draftState.layers.push({ recordSetID: setID, type: action.payload.recordSets[setID].recordSetType });
              layerIndex = draftState.layers.findIndex((layer) => layer.recordSetID === setID);
            }
            draftState.layers[layerIndex].layerState = {};
            Object.assign(draftState.layers[layerIndex].layerState, action.payload.recordSets[setID]);
          }
        });
      } else if (WhatsHere.map_init_get_poi_ids_fetched.match(action)) {
        Object.assign(draftState.whatsHere, {
          IAPPIDs: action.payload ?? [],
          iappRows: [],
          IAPPPage: 0,
          IAPPLimit: 15
        });
      } else if (WhatsHere.map_init_get_activity_ids_fetched.match(action)) {
        Object.assign(draftState.whatsHere, {
          ActivityIDs: [...action.payload],
          activityRows: [],
          ActivityPage: 0,
          ActivityLimit: 15
        });
      } else if (WhatsHere.map_feature.match(action)) {
        Object.assign(draftState.whatsHere, {
          clickedActivity: null,
          clickedActivityDescription: null,
          clickedIAPP: null,
          loadingActivities: true,
          loadingIAPP: true,
          feature: action.payload,
          toggle: state.whatsHere.toggle,
          limit: 5,
          page: 0,
          IAPPPage: 0,
          ActivityPage: 0
        });
      } else if (WhatsHere.clear_whats_here.match(action)) {
        Object.assign(draftState.whatsHere, {
          clickedActivity: null,
          clickedActivityDescription: null,
          clickedIAPP: null,
          loadingActivities: false,
          loadingIAPP: false,
          feature: null,
          limit: 5,
          page: 0,
          ActivityIDs: [],
          activityRows: [],
          ActivityPage: 0,
          ActivityLimit: 15,
          IAPPIDs: [],
          iappRows: [],
          IAPPPage: 0,
          IAPPLimit: 15
        });
      } else if (WhatsHere.server_filtered_ids_fetched.match(action)) {
        const { iapp, activities } = action.payload;
        const toggledOnActivityLayers = draftState.layers.filter(
          ({ type, layerState }) => type === RecordSetType.Activity && layerState.mapToggle
        );
        const toggledOnIAPPLayers = draftState.layers.filter(
          ({ type, layerState }) => type === RecordSetType.IAPP && layerState.mapToggle
        );

        const localActivityIDs = toggledOnActivityLayers.flatMap((layer) => layer.IDList ?? []);
        const localIappIds = toggledOnIAPPLayers.flatMap((layer) => layer.IDList ?? []);

        const iappIds = localIappIds.filter((l) => iapp.includes(l) || iapp.includes(l.toString()));
        const activityIds = localActivityIDs.filter((l) => activities.includes(l));
        draftState.whatsHere.ActivityIDs = Array.from(new Set(activityIds));
        draftState.whatsHere.IAPPIDs = Array.from(new Set(iappIds));
      } else if (RecordCache.requestCaching.fulfilled.match(action)) {
        const index = draftState.layers.findIndex((layer) => layer.recordSetID === action.meta.arg.setId);
        if (index !== -1) {
          draftState.layers[index].layerState.cacheMetadataStatus = action.payload.status;
        }
      } else if (WhatsHere.sort_filter_update.match(action)) {
        const { field, direction } = action.payload;
        if (action.payload.type === RecordSetType.IAPP) {
          Object.assign(draftState.whatsHere, {
            IAPPPage: 0,
            IAPPSortField: field,
            IAPPSortDirection: direction
          });
        } else {
          Object.assign(draftState.whatsHere, {
            ActivityPage: 0,
            ActivitySortField: action.payload.field,
            ActivitySortDirection: action.payload.direction
          });
        }
      } else if (WhatsHere.toggle.match(action)) {
        if (draftState.whatsHere.toggle) {
          Object.assign(draftState.whatsHere, {
            loadingActivities: false,
            loadingIAPP: false
          });
        } else {
          Object.assign(draftState.whatsHere, {
            feature: null,
            iappRows: [],
            activityRows: [],
            limit: 5,
            page: 0
          });
        }
        draftState.whatsHere.toggle = !draftState.whatsHere.toggle;
      } else if (WhatsHere.map_change_tab.match(action)) {
        Object.assign(draftState.whatsHere, {
          page: 0,
          limit: 5
        });
      } else if (WhatsHere.set_highlighted_iapp.match(action)) {
        draftState.userRecordOnHoverRecordRow = {
          id: action.payload,
          geometry: state?.whatsHere?.iappRows.filter((row) => row.site_id === action.payload)[0].geometry
        };
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
      } else if (GeoTracking.start.match(action)) {
        draftState.track_me_draw_geo = {
          isTracking: true,
          type: action.payload.type ?? null,
          drawingShape: true
        };
      } else if (GeoTracking.stop.match(action)) {
        draftState.track_me_draw_geo = {
          isTracking: false,
          type: null,
          drawingShape: false
        };
      } else if (GeoTracking.pause.match(action)) {
        draftState.track_me_draw_geo.drawingShape = false;
      } else if (GeoTracking.resume.match(action)) {
        draftState.track_me_draw_geo.drawingShape = true;
      } else if (IappActions.getRows.match(action) || Activity.getRows.match(action)) {
        const { recordSetID, page, limit, tableFiltersHash } = action.payload;
        draftState.recordTables[recordSetID] ??= {};
        Object.assign(draftState.recordTables[recordSetID], {
          loading: true,
          page: page,
          limit: limit,
          tableFiltersHash: tableFiltersHash
        });
      } else if (IappActions.getRowsSuccess.match(action)) {
        // the hash, page, and limit all need to line up
        const { recordSetID, tableFiltersHash, limit, page, rows } = action.payload;
        const recordTable = draftState.recordTables?.[recordSetID];
        if (recordTable?.tableFiltersHash !== tableFiltersHash) {
          console.warn('hash mismatch', draftState.recordTables?.[recordSetID]?.tableFiltersHash, tableFiltersHash);
          return;
        }
        if (Number(recordTable?.limit) !== Number(limit)) {
          console.warn('limit mismatch', draftState.recordTables?.[recordSetID]?.limit, limit);
          return;
        }
        if (Number(recordTable?.page) !== Number(action.payload.page)) {
          console.warn('page mismatch', draftState.recordTables?.[recordSetID]?.page, page);
          return;
        }
        if (recordTable) {
          draftState.recordTables[recordSetID].rows = rows;
        } else {
          draftState.recordTables[recordSetID] = { rows };
        } // set defaults
        draftState.recordTables[recordSetID].loading = false;
      } else if (Activity.getRowsSuccess.match(action)) {
        // the hash, page, and limit all need to line up
        const { recordSetID, tableFiltersHash, limit, page, rows } = action.payload;
        const recordTable = draftState.recordTables?.[recordSetID];
        if (recordTable?.tableFiltersHash !== tableFiltersHash) {
          console.warn('hash mismatch', recordTable?.tableFiltersHash, tableFiltersHash);
          return;
        }
        if (Number(recordTable?.limit) !== Number(limit)) {
          console.warn('limit mismatch', recordTable?.limit, limit);
          return;
        }
        if (Number(recordTable?.page) !== Number(page)) {
          console.warn('page mismatch', recordTable?.page, page);
          return;
        }
        if (draftState.recordTables?.[recordSetID]) {
          draftState.recordTables[recordSetID].rows = rows;
        } else {
          draftState.recordTables[recordSetID] = { rows };
        } // set defaults
        draftState.recordTables[action.payload.recordSetID].loading = false;
      } else if (Activity.Offline.getIdsForRecordsetSuccess.match(action)) {
        const index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);

        if (!draftState.layers[index]) {
          draftState.layers.push({ recordSetID: action.payload.recordSetID, type: RecordSetType.Activity });
        }

        if (draftState.layers[index] && 'IDList' in draftState.layers[index]) {
          draftState.layers[index].IDList = action.payload?.IDList ?? [];
          draftState.layers[index].loading = false;
        } else {
          draftState.layers[index] = {
            ...draftState.layers[index],
            IDList: action.payload?.IDList ?? [],
            loading: false
          };
        }
      } else if (UserSettings.RecordSet.hideFilters.match(action)) {
        draftState.viewFilters = !draftState.viewFilters;
      } else if (Activity.getIdsForRecordset.match(action)) {
        let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        if (!draftState.layers[index]) {
          draftState.layers.push({ recordSetID: action.payload.recordSetID, type: RecordSetType.Activity });
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        }
        draftState.layers[index].tableFiltersHash = action.payload.tableFiltersHash;
        draftState.layers[index].loading = true;
        if (!draftState.layers[index].layerState) {
          draftState.layers[index].layerState = {
            color: RECORD_COLOURS[0],
            drawOrder: 0,
            mapToggle: false
          };
        }
      } else if (Activity.getIdsForRecordsetSuccess.match(action)) {
        let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        if (!draftState.layers[index]) {
          draftState.layers.push({ recordSetID: action.payload.recordSetID, type: RecordSetType.Activity });
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        }

        if (action.payload.tableFiltersHash !== draftState.layers[index]?.tableFiltersHash) return;
        draftState.layers[index].IDList = action.payload?.IDList ?? [];
        draftState.layers[index].loading = false;
      } else if (IappActions.getIdsForRecordset.match(action)) {
        let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        if (!draftState.layers[index]) {
          draftState.layers.push({ recordSetID: action.payload.recordSetID, type: RecordSetType.IAPP });
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        }
        draftState.layers[index].tableFiltersHash = action.payload.tableFiltersHash;
        draftState.layers[index].loading = true;
        if (!draftState.layers[index].layerState) {
          draftState.layers[index].layerState = {
            color: RECORD_COLOURS[0],
            drawOrder: 0,
            mapToggle: false
          };
        }
      } else if (IappActions.getIdsForRecordsetSuccess.match(action)) {
        let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        if (!draftState.layers[index]) draftState.layers.push({ recordSetID: action.payload.recordSetID });
        index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);

        if (action.payload.tableFiltersHash !== draftState.layers[index]?.tableFiltersHash) return;

        draftState.layers[index].IDList = action.payload.IDList;
        draftState.layers[index].loading = false;
      } else {
        switch (action.type) {
          case TOGGLE_WMS_LAYER: {
            const index = draftState.simplePickerLayers2.findIndex((layer) => layer.url === action.payload.layer.url);
            draftState.simplePickerLayers2[index].toggle = !draftState.simplePickerLayers2[index]?.toggle;
            break;
          }
          case TOGGLE_DRAWN_LAYER: {
            const index = draftState.clientBoundaries.findIndex((layer) => layer.id === action.payload.layer.id);
            draftState.clientBoundaries[index].toggle = !draftState.clientBoundaries[index]?.toggle;
            break;
          }
          case FILTERS_PREPPED_FOR_VECTOR_ENDPOINT: {
            let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
            if (!draftState.layers[index]) {
              draftState.layers.push({
                recordSetID: action.payload.recordSetID,
                type: action.payload.recordSetType
              });
            }
            index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);

            draftState.layers[index].filterObject = action.payload.filterObject;
            draftState.layers[index].tableFiltersHash = action.payload.tableFiltersHash;
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
              id: nanoid(),
              geojson: action.payload,
              toggle: true,
              title: draftState.drawingCustomLayerName
            });
            draftState.drawingCustomLayerName = '';
            break;
          }
          case DRAW_CUSTOM_LAYER: {
            draftState.drawingCustomLayer = true;
            draftState.drawingCustomLayerName = action.payload.name;
            break;
          }

          case IAPP_EXTENT_FILTER_SUCCESS: {
            draftState.IAPPBoundsPolygon = action.payload.bounds;
            break;
          }
          case INIT_SERVER_BOUNDARIES_GET: {
            draftState.serverBoundaries =
              action.payload.data?.map((incomingItem) => {
                const returnVal = { ...incomingItem };
                const existingToggleVal = draftState.serverBoundaries.find((oldItem) => {
                  oldItem.id === incomingItem;
                })?.toggle;
                returnVal.toggle =
                  existingToggleVal !== null && existingToggleVal !== undefined ? existingToggleVal : false;
                return returnVal;
              }) ?? [];
            break;
          }
          case TOGGLE_KML_LAYER: {
            const index = draftState.serverBoundaries.findIndex((layer) => layer.id === action.payload.layer.id);
            draftState.serverBoundaries[index].toggle = !draftState.serverBoundaries[index].toggle;
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
          case PAGE_OR_LIMIT_UPDATE: {
            draftState.recordTables[action.payload.setID].page = action.payload.page;
            draftState.recordTables[action.payload.setID].limit = action.payload.limit;
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
                if (draftState.simplePickerLayers == undefined) {
                  draftState.simplePickerLayers = [];
                }
                draftState.simplePickerLayers[layerNameProperty] = !state.simplePickerLayers[layerNameProperty];
              } else {
                // doesn't exist, getting turned on
                if (draftState.simplePickerLayers == undefined) {
                  draftState.simplePickerLayers = [];
                }
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
            if (action.payload?.pathname === '/') {
              // draftState.panelOpen = false;
            }
            if (!action?.payload?.url?.includes('WhatsHere')) {
              draftState.whatsHere.toggle = false;
              draftState.whatsHere.feature = null;
            }
            break;
          }
          case USER_HOVERED_RECORD: {
            draftState.userRecordOnHoverRecordType = action.payload.recordType;
            draftState.userRecordOnHoverRecordID = action.payload.id;
            draftState.userRecordOnHoverRecordRow = action.payload.row;
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
export type { LeafletWhosEditingEnum, MapState };
export { DEFAULT_LOCAL_LAYERS };
