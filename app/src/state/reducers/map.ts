import { createNextState, nanoid } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { Feature, Point, Polygon } from 'geojson';
import {
  ACTIVITY_PAGE_MAP_EXTENT_TOGGLE,
  CSV_LINK_CLICKED,
  FILTERS_PREPPED_FOR_VECTOR_ENDPOINT,
  IAPP_EXTENT_FILTER_SUCCESS,
  IAPP_PAN_AND_ZOOM,
  INIT_SERVER_BOUNDARIES_GET,
  MAIN_MAP_MOVE,
  MAP_DELETE_LAYER_AND_TABLE,
  MAP_LABEL_EXTENT_FILTER_SUCCESS,
  MAP_SET_COORDS,
  PAGE_OR_LIMIT_UPDATE,
  PAN_AND_ZOOM_TO_ACTIVITY,
  RECORD_SET_TO_EXCEL_FAILURE,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  SET_TOO_MANY_LABELS_DIALOG,
  TOGGLE_CUSTOMIZE_LAYERS
} from 'state/actions';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import GeoShapes from 'constants/geoShapes';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetId, RecordSetType } from 'interfaces/UserRecordSet';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { SortFilter } from 'interfaces/filterParams';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import IappActions from 'state/actions/activity/Iapp';
import Activity from 'state/actions/activity/Activity';
import RecordCache from 'state/actions/cache/RecordCache';
import { RECORD_COLOURS } from 'constants/colors';
import IRecordTable from 'interfaces/recordTable';
import { GeoTrackingStatus } from 'constants/geoTrackingStatus';
import MapActions from 'state/actions/map';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import AppActions from 'state/actions/appActions/appActions';

enum LeafletWhosEditingEnum {
  ACTIVITY = 'ACTIVITY',
  WHATSHERE = 'WHATSHERE',
  BOUNDARY = 'BOUNDARY',
  NONE = 'NONE'
}

interface MapState {
  [MIGRATION_VERSION_KEY]: number;
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
  linkToCSV: string | null;
  map_center: [number, number];
  map_zoom: number;
  panned: boolean;
  positionTracking: boolean;
  track_me_draw_geo: {
    status: GeoTrackingStatus;
    shapeType: GeoShapes | null;
    isEditingShape: boolean;
  };
  quickPanToRecord: boolean;
  readableIdentifier?: string;
  recordSetForCSV: number | null;
  recordTables: Record<PropertyKey, IRecordTable>;
  serverBoundaries: any[];
  tooManyLabelsDialog: any;
  userCoords: any;
  userRecordOnHoverRecordID?: string | number;
  userRecordOnHoverRecordGeometry?: Feature | Polygon | Point;
  userRecordOnHoverRecordType?: RecordSetType;
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
  planMyTripDrawMode: boolean;
}

const initialState: MapState = {
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,

  activity_center: [53, -127],
  activity_zoom: 7,

  map_center: [-128, 55],
  map_zoom: 5,

  CanTriggerCSV: true,

  accuracyToggle: false,

  IAPPBoundsPolygon: undefined,
  IAPPGeoJSON: undefined,
  IAPPGeoJSONDict: {},

  activitiesGeoJSON: undefined,
  activitiesGeoJSONDict: {},
  activityPageMapExtentToggle: false,

  clientBoundaries: [],
  currentOpenSet: null,
  customizeLayersToggle: false,
  drawingCustomLayer: false,
  drawingCustomLayerName: '',
  error: false,
  initialized: false,
  labelBoundsPolygon: undefined,
  layers: [],
  linkToCSV: '',
  panned: false,
  positionTracking: false,
  track_me_draw_geo: {
    status: GeoTrackingStatus.IDLE,
    shapeType: null,
    isEditingShape: false
  },
  quickPanToRecord: false,
  recordSetForCSV: 0,
  recordTables: {},

  serverBoundaries: [],
  tooManyLabelsDialog: null,

  planMyTripDrawMode: false,

  userCoords: null,
  userRecordOnHoverRecordID: undefined,
  userRecordOnHoverRecordGeometry: undefined,
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
        if (layerIndex === -1) return;
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
      } else if (UserSettings.InitState.getSuccess.match(action)) {
        Object.keys(action.payload.recordSets).forEach((setID) => {
          if (setID !== RecordSetId.OfflineActivities) {
            let layerIndex = draftState.layers.findIndex((layer) => layer.recordSetID === setID);
            if (layerIndex === -1) {
              draftState.layers.push({ recordSetID: setID, type: action.payload.recordSets[setID].recordSetType });
              layerIndex = draftState.layers.findIndex((layer) => layer.recordSetID === setID);
            }
            draftState.layers[layerIndex].layerState ??= {};
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
        draftState.whatsHere.ActivityIDs = Array.from(new Set(action.payload.activities));
        draftState.whatsHere.IAPPIDs = Array.from(new Set(action.payload.iapp));
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
      } else if (PlanMyTrip.setPlanMyTripDrawMode.match(action)) {
        draftState.planMyTripDrawMode = action.payload;
      } else if (GeoTracking.start.match(action)) {
        draftState.track_me_draw_geo = {
          ...draftState.track_me_draw_geo,
          status: GeoTrackingStatus.TRACKING_AND_DRAWING,
          shapeType: action.payload.type ?? null
        };
      } else if (GeoTracking.edit.match(action)) {
        draftState.track_me_draw_geo = {
          ...draftState.track_me_draw_geo,
          isEditingShape: action.payload
        };
      } else if (GeoTracking.exit.match(action)) {
        draftState.track_me_draw_geo = {
          status: GeoTrackingStatus.EXITED,
          shapeType: null,
          isEditingShape: false
        };
      } else if (GeoTracking.pause.match(action)) {
        draftState.track_me_draw_geo.status = GeoTrackingStatus.ONLY_TRACKING;
      } else if (GeoTracking.resume.match(action)) {
        draftState.track_me_draw_geo = {
          ...draftState.track_me_draw_geo,
          status: GeoTrackingStatus.TRACKING_AND_DRAWING,
          isEditingShape: false
        };
      } else if (GeoTracking.exitDrawing.match(action)) {
        draftState.track_me_draw_geo = {
          status: GeoTrackingStatus.EXITED,
          shapeType: draftState.track_me_draw_geo.shapeType,
          isEditingShape: false
        };
      } else if (GeoTracking.end.match(action)) {
        draftState.track_me_draw_geo = {
          status: GeoTrackingStatus.COMPLETED,
          shapeType: null,
          isEditingShape: false
        };
      } else if (IappActions.getRows.match(action) || Activity.getRows.match(action)) {
        const { recordSetID, page, limit, tableFiltersHash } = action.payload;
        draftState.recordTables[recordSetID] ??= {} as IRecordTable;
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
          draftState.recordTables[recordSetID] = { loading: false, limit, page, rows, tableFiltersHash };
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
          draftState.recordTables[recordSetID] = { loading: false, limit, page, rows, tableFiltersHash };
        } // set defaults
        draftState.recordTables[action.payload.recordSetID].loading = false;
      } else if (Activity.Offline.getIdsForRecordsetSuccess.match(action)) {
        let index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);

        if (index === -1) {
          draftState.layers.push({ recordSetID: action.payload.recordSetID, type: RecordSetType.Activity });
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        }
        draftState.layers[index] = {
          ...draftState.layers[index]
        };
        draftState.layers[index].loading = false;
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
        if (index === -1) {
          draftState.layers.push({ recordSetID: action.payload.recordSetID, type: RecordSetType.Activity });
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        }
        if (action.payload.tableFiltersHash !== draftState.layers[index]?.tableFiltersHash) return;

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
        if (index === -1) {
          draftState.layers.push({ recordSetID: action.payload.recordSetID });
          index = draftState.layers.findIndex((layer) => layer.recordSetID === action.payload.recordSetID);
        }

        if (action.payload.tableFiltersHash !== draftState.layers[index]?.tableFiltersHash) return;
        draftState.layers[index].loading = false;
      } else if (UserSettings.Map.setHoveredRecordset.match(action)) {
        draftState.userRecordOnHoverRecordType = action.payload.recordType;
        draftState.userRecordOnHoverRecordID = action.payload.id;
        draftState.userRecordOnHoverRecordGeometry = action.payload.geom;
        draftState.quickPanToRecord = !!action.payload?.quickPan;
        draftState.readableIdentifier = action.payload?.readableIdentifier;
      } else if (UserSettings.Map.markCoordinate.match(action)) {
        draftState.userRecordOnHoverRecordType = undefined;
        draftState.userRecordOnHoverRecordID = undefined;
        draftState.userRecordOnHoverRecordGeometry = action.payload.feature;
        draftState.quickPanToRecord = true;
        draftState.readableIdentifier = action.payload?.readableIdentifier;
      } else if (UserSettings.Boundaries.drawCustomLayerRequest.match(action)) {
        draftState.drawingCustomLayer = true;
        draftState.drawingCustomLayerName = action.payload;
      } else if (UserSettings.Boundaries.drawCustomLayer.match(action)) {
        draftState.drawingCustomLayer = false;
        draftState.clientBoundaries.push({
          id: nanoid(),
          geojson: action.payload,
          toggle: true,
          title: draftState.drawingCustomLayerName || nanoid()
        });
        draftState.drawingCustomLayerName = '';
      } else if (MapActions.trackLocationStart.match(action)) {
        draftState.positionTracking = true;
      } else if (MapActions.trackLocationStop.match(action)) {
        draftState.positionTracking = false;
      } else if (MapActions.trackLocationToggle.match(action)) {
        if (!draftState.positionTracking) {
          draftState.panned = true;
        }
        draftState.positionTracking = !draftState.positionTracking;
      } else if (UserSettings.Boundaries.removeCustomLayer.match(action)) {
        const index = draftState.clientBoundaries.findIndex((cb) => cb.id === action.payload);
        draftState.clientBoundaries.splice(index, 1);
      } else if (MapActions.accuracyToggle.match(action)) {
        draftState.accuracyToggle = !state.accuracyToggle;
      } else if (MapActions.panningOn.match(action)) {
        draftState.panned = true;
      } else if (MapActions.panningOff.match(action)) {
        draftState.panned = false;
      } else if (UserSettings.KML.toggle.match(action)) {
        const index = draftState.serverBoundaries.findIndex((layer) => layer.id === action.payload.id);
        if (action.payload?.on != undefined) {
          draftState.serverBoundaries[index].toggle = action.payload.on;
        } else {
          draftState.serverBoundaries[index].toggle = !draftState.serverBoundaries[index].toggle;
        }
      } else if (UserSettings.Boundaries.toggleCustomLayer.match(action)) {
        const index = draftState.clientBoundaries.findIndex((layer) => layer.id === action.payload.id);
        if (action.payload.on != undefined) {
          draftState.clientBoundaries[index].toggle = action.payload.on;
        } else {
          draftState.clientBoundaries[index].toggle = !draftState.clientBoundaries[index]?.toggle;
        }
      } else if (AppActions.urlChange.match(action)) {
        if (!action?.payload?.includes('/WhatsHere')) {
          draftState.whatsHere.toggle = false;
          draftState.whatsHere.feature = null;
        }
      } else if (MapActions.setCurrentOpenSet.match(action)) {
        draftState.currentOpenSet = action.payload.set;
      } else {
        switch (action.type) {
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

          case IAPP_EXTENT_FILTER_SUCCESS: {
            draftState.IAPPBoundsPolygon = action.payload.bounds;
            break;
          }
          case INIT_SERVER_BOUNDARIES_GET: {
            draftState.serverBoundaries =
              action.payload.data?.map((incomingItem) => {
                const returnVal = { ...incomingItem };
                const existingToggleVal = draftState.serverBoundaries.find(
                  (oldItem) => oldItem.id === incomingItem
                )?.toggle;
                returnVal.toggle =
                  existingToggleVal !== null && existingToggleVal !== undefined ? existingToggleVal : false;
                return returnVal;
              }) ?? [];
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
          case IAPP_PAN_AND_ZOOM:
          case PAN_AND_ZOOM_TO_ACTIVITY: {
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

          case SET_TOO_MANY_LABELS_DIALOG: {
            draftState.tooManyLabelsDialog = action.payload.dialog;
            break;
          }
          case TOGGLE_CUSTOMIZE_LAYERS: {
            draftState.customizeLayersToggle = !draftState.customizeLayersToggle;
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
