import { bboxPolygon, buffer } from '@turf/turf';
import { Feature } from 'geojson';
import { all, call, debounce, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  getRecordFilterObjectFromStateForAPI,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_ACTIVITIES_TABLE_GET_ROWS,
  handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_IAPP_TABLE_ROWS_GET_REQUEST,
  handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY,
  handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT
} from './map/dataAccess';
import {
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_IAPP_TABLE_ROWS_GET_ONLINE
} from './map/online';
import {
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE,
  handle_ACTIVITIES_TABLE_ROWS_GET_OFFLINE
} from './map/offline';
import {
  ACTIVITY_UPDATE_GEO_REQUEST,
  FILTER_PREP_FOR_VECTOR_ENDPOINT,
  IAPP_EXTENT_FILTER_REQUEST,
  IAPP_EXTENT_FILTER_SUCCESS,
  INIT_SERVER_BOUNDARIES_GET,
  MAP_LABEL_EXTENT_FILTER_REQUEST,
  MAP_LABEL_EXTENT_FILTER_SUCCESS,
  MAP_ON_SHAPE_CREATE,
  MAP_ON_SHAPE_UPDATE,
  PAGE_OR_LIMIT_UPDATE,
  RECORD_SET_TO_EXCEL_FAILURE,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  RECORDSET_SET_SORT,
  REFETCH_SERVER_BOUNDARIES,
  REMOVE_SERVER_BOUNDARY,
  SET_CURRENT_OPEN_SET,
  URL_CHANGE
} from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';
import { selectMap } from 'state/reducers/map';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { TRACKING_SAGA_HANDLERS } from 'state/sagas/map/tracking';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import Prompt from 'state/actions/prompts/Prompt';
import { RecordSetId, RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import Activity from 'state/actions/activity/Activity';
import { RootState } from 'state/reducers/rootReducer';
import TileCache from 'state/actions/cache/TileCache';
import { LAYER_ELIGIBILITY_UPDATE } from 'state/sagas/map/layer-eligibility';
import { RECORD_COLOURS } from 'constants/colors';
import { IRemoveFilter, IUpdateFilter } from 'state/actions/userSettings/RecordSet';
import { selectNetworkConnected, selectNetworkState } from 'state/reducers/network';
import UserRecord from 'interfaces/UserRecord';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import IappActions from 'state/actions/activity/Iapp';
import IappRecord from 'interfaces/IappRecord';
import NetworkActions from 'state/actions/network/NetworkActions';
import MapActions from 'state/actions/map';
import GeoShapes from 'constants/geoShapes';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import { normalizeToPolygonCoordinates } from 'utils/geometryHelpers';
import { GEO_TRACKING_FEATURE } from 'UI/Features/LegacyMap/helpers/functional/constants';

function* handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS() {
  yield put(MapActions.initRequest());
}

function* handle_MAP_INIT_REQUEST() {
  yield put(MapActions.initForRecordset());
  yield call(refetchServerBoundaries);
}

function* refetchServerBoundaries() {
  const serverShapesServerResponse = yield InvasivesAPI_Call('GET', '/admin-defined-shapes/');
  if (serverShapesServerResponse?.ok) {
    const shapes = serverShapesServerResponse.data.result;
    yield put({ type: INIT_SERVER_BOUNDARIES_GET, payload: { data: shapes } });
  }
}

function* handle_WHATS_HERE_FEATURE(whatsHereFeature: PayloadAction<Feature>) {
  const { connected } = yield select(selectNetworkState);
  if (connected) {
    // get all the toggled on recordsets
    const tableFilters = [
      {
        id: '0.81778552637744651712083357942',
        filterType: 'spatialFilterDrawn',
        operator: 'CONTAINED IN',
        filter: '0.652479498272151712093656568',
        geojson: whatsHereFeature.payload
      }
    ];

    const activitiesfilterObj = {
      selectColumns: ['activity_id'],
      tableFilters,
      limit: 200000
    };
    const iappfilterObj = {
      selectColumns: ['site_id'],
      tableFilters,
      limit: 200000
    };
    const [activitiesNetworkReturn, iappNetworkReturn] = yield all([
      yield call(InvasivesAPI_Call, 'POST', `/api/v2/activities/`, {
        filterObjects: [activitiesfilterObj]
      }),
      yield call(InvasivesAPI_Call, 'POST', `/api/v2/iapp/`, {
        filterObjects: [iappfilterObj]
      })
    ]);
    if (activitiesNetworkReturn?.ok && iappNetworkReturn?.ok) {
      const activityReturn = activitiesNetworkReturn?.data?.data?.result ?? activitiesNetworkReturn?.data?.result ?? [];
      const activitiesServerIDList: string[] = activityReturn.map((row: UserRecord) => row.activity_id);

      const iappReturn = iappNetworkReturn?.data?.data?.result ?? iappNetworkReturn?.data?.result ?? [];
      const iappServerIDList: string[] = iappReturn.map((row: Record<PropertyKey, any>) => row.site_id);

      const { activity, iapp } = yield parseRecordSetsForWhatsHere(activitiesServerIDList, iappServerIDList);

      yield put(WhatsHere.server_filtered_ids_fetched(activity, iapp));
      return;
    }
  }
  // Get IDs from Offline Caches
  const service = yield RecordCacheServiceFactory.getPlatformInstance();
  const overlappingRecords: string[] = yield service.getRecordIdsOverlappingFeature(whatsHereFeature.payload);
  const { activity, iapp } = yield parseRecordSetsForWhatsHere(overlappingRecords, overlappingRecords);
  yield put(WhatsHere.server_filtered_ids_fetched(activity, iapp));
}

/**
 * @desc Compares list of IDs against Ids in a Recordset
 * @param activity Activity Records to check
 * @param iapp IAPP Records to check
 * @returns {{activity: string[], iapp: string[]}} IDs That are contained in an active Recordset on the map
 */
function* parseRecordSetsForWhatsHere(activity, iapp) {
  const recordSets = (yield select(selectUserSettings)).recordSets as Record<PropertyKey, UserRecordSet>;
  const toggledActivityLayers: Array<Array<string | number>> = [];
  const toggledIappLayers: Array<Array<string | number>> = [];

  Object.values(recordSets).forEach((recordSet) => {
    const { recordSetType, mapToggle } = recordSet;
    if (recordSetType === RecordSetType.Activity && mapToggle) {
      toggledActivityLayers.push(recordSet.idList);
    } else if (recordSetType === RecordSetType.IAPP && mapToggle) {
      toggledIappLayers.push(recordSet.idList);
    }
  });

  const localActivityIDs = toggledActivityLayers.flatMap((idList) => idList);
  const localIappIds = toggledIappLayers.flatMap((idList) => idList);

  const iappIds = localIappIds.filter((l) => iapp.includes(l) || activity.includes(l.toString()));
  const activityIds = localActivityIDs.filter((l) => activity.includes(l));

  return {
    activity: activityIds,
    iapp: iappIds
  };
}

function* whatsHereSaga() {
  yield all([
    takeEvery(WhatsHere.init_get_activities, handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY),
    takeEvery(WhatsHere.map_feature, handle_WHATS_HERE_FEATURE)
  ]);
}

function* handle_WHATS_HERE_IAPP_ROWS_REQUEST() {
  const mapState = yield select(selectMap);
  const connected = yield select(selectNetworkConnected);
  const { whatsHere } = mapState;
  const startRecord = whatsHere.IAPPLimit * (whatsHere.IAPPPage + 1) - whatsHere.IAPPLimit;
  const endRecord = whatsHere.IAPPLimit * (whatsHere.IAPPPage + 1);
  const slicedIDs = whatsHere.IAPPIDs.slice(startRecord, endRecord);

  const filterObject = {
    selectColumns: ['site_id', 'jurisdictions_flattened', 'map_symbol', 'min_survey', 'reported_area', 'geojson'],
    limit: 200000,
    ids_to_filter: slicedIDs
  };

  if (slicedIDs.length === 0) {
    yield put(WhatsHere.iapp_rows_success([]));
    return;
  }
  let records: IappRecord[];
  if (buildTimeConfig.MOBILE && !connected) {
    const service = yield RecordCacheServiceFactory.getPlatformInstance();
    records = yield service.getPaginatedCachedIappRecords(
      whatsHere.IAPPIDs.map((id) => id.toString()),
      whatsHere.IAPPPage,
      whatsHere.IAPPLimit
    );
  } else {
    const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/iapp/`, {
      filterObjects: [filterObject]
    });
    if (networkReturn?.ok) {
      records = networkReturn.data.result;
    } else {
      const service = yield RecordCacheServiceFactory.getPlatformInstance();
      records = yield service.getPaginatedCachedIappRecords(
        whatsHere.IAPPIDs.map((id) => id.toString()),
        whatsHere.IAPPPage,
        whatsHere.IAPPLimit
      );
    }
  }
  const mappedToWhatsHereColumns = records.map((iappRecord) => ({
    id: iappRecord.site_id,
    site_id: iappRecord.site_id,
    jurisdiction_code: iappRecord.jurisdictions_flattened,
    species_code: iappRecord.map_symbol,
    earliest_survey: new Date(iappRecord.min_survey).toDateString(),
    geometry: iappRecord.geojson
  }));
  yield put(WhatsHere.iapp_rows_success(mappedToWhatsHereColumns));
}

function* handle_WHATS_HERE_PAGE_POI() {
  yield put(WhatsHere.iapp_rows_request());
}

function* handle_WHATS_HERE_ACTIVITY_ROWS_REQUEST() {
  const mapState = yield select(selectMap);
  const connected = yield select(selectNetworkConnected);

  const { whatsHere } = mapState;
  const startRecord = whatsHere.ActivityLimit * (whatsHere.ActivityPage + 1) - whatsHere.ActivityLimit;
  const endRecord = whatsHere.ActivityLimit * (whatsHere.ActivityPage + 1);
  const slicedIDs = whatsHere.ActivityIDs.slice(startRecord, endRecord);
  const filterObject = {
    selectColumns: [
      'activity_id',
      'short_id',
      'activity_payload',
      'activity_type',
      'jurisdiction_display',
      'map_symbol'
    ],
    limit: 200000,
    ids_to_filter: slicedIDs
  };
  if (slicedIDs.length === 0) {
    yield put(WhatsHere.activity_rows_success([]));
    return;
  }

  let records: UserRecord[];
  if (buildTimeConfig.MOBILE && !connected) {
    const service = yield RecordCacheServiceFactory.getPlatformInstance();
    records = yield service.getPaginatedCachedActivityRecords(
      whatsHere.ActivityIDs,
      whatsHere.ActivityPage,
      whatsHere.ActivityLimit
    );
  } else {
    const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
      filterObjects: [filterObject]
    });
    if (networkReturn?.ok) {
      records = networkReturn.data.result;
    } else {
      const service = yield RecordCacheServiceFactory.getPlatformInstance();
      records = yield service.getPaginatedCachedActivityRecords(
        whatsHere.ActivityIDs,
        whatsHere.ActivityPage,
        whatsHere.ActivityLimit
      );
    }
  }
  const mappedToWhatsHereColumns = records.map((activityRecord) => {
    // Differentiate the Cached records from the API called ones
    const shortHand = activityRecord.activity_payload ? activityRecord.activity_payload : activityRecord;
    return {
      id: activityRecord.activity_id,
      short_id: activityRecord.short_id,
      activity_type: activityRecord.activity_type,
      jurisdiction_code: activityRecord.jurisdiction_display,
      species_code: activityRecord.map_symbol,
      reported_area: shortHand.form_data.activity_data.reported_area,
      geometry: shortHand.geometry?.[0],
      created: new Date(shortHand.form_data.activity_data.activity_date_time).toDateString()
    };
  });
  yield put(WhatsHere.activity_rows_success(mappedToWhatsHereColumns));
}

function* handle_WHATS_HERE_PAGE_ACTIVITY() {
  yield put(WhatsHere.activity_rows_request());
}

function* handle_RECORD_SET_TO_EXCEL_REQUEST(action) {
  const userSettings = yield select(selectUserSettings);
  const set = userSettings?.recordSets?.[action.payload.id];
  const clientBoundaries = yield select((state) => state.Map.clientBoundaries);
  try {
    let conditionallyUnnestedURL;
    if (set.recordSetType === 'IAPP') {
      const currentState = yield select((state) => state.UserSettings);

      const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.id, currentState, clientBoundaries);
      if (filterObject == null) {
        yield put({
          type: RECORD_SET_TO_EXCEL_FAILURE
        });
        return;
      }
      filterObject.limit = 200000;
      filterObject.isCSV = true;
      filterObject.CSVType = action.payload.CSVType;

      const networkReturn = yield InvasivesAPI_Call(
        'POST',
        `/api/v2/iapp/`,
        {
          filterObjects: [filterObject]
        },
        null,
        'text'
      );

      conditionallyUnnestedURL = networkReturn?.data?.result ? networkReturn.data.result : networkReturn?.data;
    } else {
      const currentState = yield select((state) => state.UserSettings);

      const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.id, currentState, clientBoundaries);
      if (filterObject == null) {
        yield put({
          type: RECORD_SET_TO_EXCEL_FAILURE
        });
        return;
      }
      filterObject.limit = 200000;
      filterObject.isCSV = true;
      filterObject.CSVType = action.payload.CSVType;

      const networkReturn = yield InvasivesAPI_Call(
        'POST',
        `/api/v2/activities/`,
        {
          filterObjects: [filterObject]
        },
        null,
        'text'
      );

      conditionallyUnnestedURL = networkReturn?.data?.result ? networkReturn.data.result : networkReturn?.data;
    }
    yield put({
      type: RECORD_SET_TO_EXCEL_SUCCESS,
      payload: {
        link: conditionallyUnnestedURL,
        id: action.payload.id
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: RECORD_SET_TO_EXCEL_FAILURE
    });
  }
}

function* handle_WHATS_HERE_SORT_FILTER_UPDATE(record: PayloadAction<Record<PropertyKey, any>>) {
  const { recordType } = record.payload;
  if (recordType === RecordSetType.IAPP) {
    yield put(WhatsHere.iapp_rows_request());
  } else if (recordType === RecordSetType.Activity) {
    yield put(WhatsHere.activity_rows_request());
  }
}

function* handle_MAP_LABEL_EXTENT_FILTER_REQUEST(action) {
  const bbox = [action.payload.minX, action.payload.minY, action.payload.maxX, action.payload.maxY];
  const bounds = bboxPolygon(bbox as any);

  yield put({
    type: MAP_LABEL_EXTENT_FILTER_SUCCESS,
    payload: {
      bounds: bounds
    }
  });
}

function* handle_IAPP_EXTENT_FILTER_REQUEST(action) {
  const bbox = [action.payload.minX, action.payload.minY, action.payload.maxX, action.payload.maxY];
  const bounds = bboxPolygon(bbox as any);

  yield put({
    type: IAPP_EXTENT_FILTER_SUCCESS,
    payload: {
      bounds: bounds
    }
  });
}

function* handle_URL_CHANGE(action) {
  const url = action.payload.url;
  const isRecordSet = url.split(':')?.[0]?.includes('/Records/List/Local');
  if (isRecordSet) {
    const id = url.split(':')[1].split('/')[0];
    yield put({
      type: SET_CURRENT_OPEN_SET,
      payload: {
        set: id
      }
    });

    let recordSetsState = yield select(selectUserSettings);
    let recordSetType = recordSetsState.recordSets?.[id]?.recordSetType;
    if (recordSetType === undefined) {
      yield take(UserSettings.InitState.getSuccess);
      recordSetsState = yield select(selectUserSettings);
      recordSetType = recordSetsState.recordSets?.[id]?.recordSetType;
    }
    const mapState = yield select(selectMap);
    const page = mapState.recordTables?.[id]?.page || 0;
    const limit = mapState.recordTables?.[id]?.limit || 20;

    const actionArg = {
      recordSetID: id,
      tableFiltersHash: recordSetsState.recordSets?.[id]?.tableFiltersHash,
      page: page,
      limit: limit
    };

    if (recordSetType === RecordSetType.Activity) {
      yield put(Activity.getRows(actionArg));
    } else if (recordSetType === RecordSetType.IAPP) {
      yield put(IappActions.getRows(actionArg));
    }
  }
}

function* handle_UserFilterChange(action: PayloadAction<IRemoveFilter | IUpdateFilter>) {
  const recordSetsState = yield select(selectUserSettings);
  const map = yield select(selectMap);
  const currentSet = map?.currentOpenSet;
  const recordSetType = recordSetsState.recordSets?.[action.payload.setID]?.recordSetType;

  if (
    recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash !==
    recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersPreviousHash
  )
    yield put({
      type: FILTER_PREP_FOR_VECTOR_ENDPOINT,
      payload: {
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
      }
    });
  const actionArg = {
    recordSetID: action.payload.setID,
    tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
    page: 0,
    limit: 20
  };
  if (recordSetType === RecordSetType.Activity) {
    if (currentSet === action.payload.setID) yield put(Activity.getRows(actionArg));
    yield put(
      Activity.getIdsForRecordset({
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
      })
    );
  } else {
    if (currentSet === action.payload.setID) yield put(IappActions.getRows(actionArg));
    yield put(
      IappActions.getIdsForRecordset({
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
      })
    );
  }
}

function* handle_PAGE_OR_LIMIT_UPDATE(action) {
  const recordSetsState = yield select(selectUserSettings);
  const recordSetType = recordSetsState.recordSets?.[action.payload.setID]?.recordSetType;
  const mapState = yield select(selectMap);

  const page = !Number.isNaN(action.payload.page)
    ? action.payload.page
    : mapState.recordTables?.[action.payload.recordSetID]?.page;
  const limit = !Number.isNaN(action.payload.limit)
    ? action.payload.limit
    : mapState.recordTables?.[action.payload.recordSetID]?.limit;

  const actionArg = {
    recordSetID: action.payload.setID,
    tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
    page: page,
    limit: limit
  };

  if (recordSetType === RecordSetType.Activity) {
    yield put(Activity.getRows(actionArg));
  } else if (recordSetType === RecordSetType.IAPP) {
    yield put(IappActions.getRows(actionArg));
  }
}

function* handle_MAP_INIT_FOR_RECORDSETS() {
  interface ActionType {
    type: string;
    payload: any;
  }

  const userSettingsState = yield select(selectUserSettings);
  const recordSets = Object.keys(userSettingsState.recordSets);

  // current layers
  const layers = yield select((state) => state.Map.layers);
  const layerIDs = layers.map((layer) => layer.recordSetID);

  // current but unintialized:
  const currentUninitializedLayers = layers
    .filter((layer) => !layer.loading)
    .map((layer) => {
      return { recordSetID: layer.recordSetID, recordSetType: layer.type };
    });

  // in record set but not in layers
  const newLayerIDs = recordSets.filter((recordSet) => !layerIDs.includes(recordSet));
  const newUninitializedLayers = newLayerIDs.map((layer) => {
    return { recordSetID: layer, recordSetType: userSettingsState.recordSets[layer].recordSetType };
  });
  // combined:
  const allUninitializedLayers = [...currentUninitializedLayers, ...newUninitializedLayers];

  const actionsToPut: ActionType[] = [];
  allUninitializedLayers.forEach((layer) => {
    if (layer.recordSetID !== RecordSetId.OfflineActivities) {
      actionsToPut.push({
        type: FILTER_PREP_FOR_VECTOR_ENDPOINT,
        payload: { recordSetID: layer.recordSetID, tableFiltersHash: 'init' }
      });
    }
    if (layer.recordSetType === RecordSetType.Activity) {
      actionsToPut.push(Activity.getIdsForRecordset({ recordSetID: layer.recordSetID, tableFiltersHash: 'init' }));
    } else if (layer.recordSetType === RecordSetType.IAPP) {
      actionsToPut.push(IappActions.getIdsForRecordset({ recordSetID: layer.recordSetID, tableFiltersHash: 'init' }));
    }
  });
  yield all(actionsToPut.map((action) => put(action)));
}

function* handle_REMOVE_CUSTOM_LAYER(action) {
  // remove from record sets applied
  const state = yield select(selectUserSettings);
  const recordSets = state?.recordSets;
  const recordSetIDs = Object.keys(recordSets);
  const recordSetsWithIDs = recordSetIDs.map((recordSetID) => {
    return { ...recordSets[recordSetID], recordSetID: recordSetID };
  });

  const filteredSets = recordSetsWithIDs.filter((set) => {
    return set?.tableFilters?.filter((filter) => {
      return filter?.filter === action?.payload?.id;
    });
  });

  const actions = filteredSets.map((filteredSet) => {
    const filter = filteredSet?.tableFilters.filter((filter) => {
      return filter.filter === action.payload.id;
    })?.[0];
    return UserSettings.RecordSet.removeFilter({
      filterID: filter?.id,
      filterType: 'tableFilter',
      setID: filteredSet.recordSetID
    });
  });

  yield all(
    actions.map((action) => {
      if (action.payload.filterID) {
        return put(action);
      }
    })
  );
}

function* handle_REMOVE_SERVER_BOUNDARY(action) {
  yield put(UserSettings.KML.delete(action.payload.id));
}

function* handle_MAP_ON_SHAPE_CREATE(action) {
  const callback = (width: number) => {
    const newGeo = buffer(action.payload.geometry, width / 10000) ?? action.payload;
    if (appModeUrl && /Activity/.test(appModeUrl) && !whatsHereToggle) {
      return [{ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [newGeo] } }];
    }
  };

  const appModeUrl = yield select((state: any) => state.AppMode.url);
  const whatsHereToggle = yield select((state: any) => state.Map.whatsHere.toggle);
  const { isTracking, type } = yield select((state) => state.Map.track_me_draw_geo);

  const isGeoTrackingLineString = isTracking && type === GeoShapes.LineString;
  const isLineString = action?.payload?.geometry?.type === GeoShapes.LineString;
  const hasCoordinates = action?.payload?.geometry?.coordinates?.length > 0;
  const noUserError = action?.payload?.properties?.user_error !== 'true';

  if (isLineString && hasCoordinates && noUserError) {
    if (!isGeoTrackingLineString && action.payload.id === GEO_TRACKING_FEATURE) return; // no prompt for polygon
    yield put(
      Prompt.number({
        title: 'Buffer needed',
        prompt: 'Enter width in meters for line to be buffered:',
        min: 0.001,
        acceptFloats: true,
        callback,
        label: 'Meters'
      })
    );
  }
}

function* handle_MAP_ON_SHAPE_UPDATE(action) {
  try {
    const { url } = yield select((state) => state.AppMode);
    const { drawingCustomLayer, whatsHere, tileCacheMode } = yield select((state: RootState) => state.Map);
    const { isTracking, type } = yield select((state) => state.Map.track_me_draw_geo);
    const { id, geometry } = action.payload;

    if (drawingCustomLayer) {
      yield put(UserSettings.Boundaries.drawCustomLayer(action.payload));
      return;
    }

    const callback = (width: number) => {
      const newGeo = buffer(action.payload.geometry, width / 10000) ?? action.payload;
      if (isActivityPage && !whatsHere.toggle) {
        return [{ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [newGeo] } }];
      }
    };
    const isActivityPage = url && /Activity/.test(url);
    const isGeoTrackingFeature = id === GEO_TRACKING_FEATURE;

    if (isActivityPage && !whatsHere.toggle) {
      if (isGeoTrackingFeature && type === GeoShapes.Polygon) {
        geometry.type = type;
        geometry.coordinates = normalizeToPolygonCoordinates(geometry.coordinates);
      } else if (type === GeoShapes.LineString && action?.payload?.geometry?.type === GeoShapes.LineString) {
        yield put(
          Prompt.number({
            title: 'Buffer needed',
            prompt: 'Enter width in meters for line to be buffered:',
            min: 0.001,
            acceptFloats: true,
            callback,
            label: 'Meters'
          })
        );
        return;
      } else if (isTracking) {
        yield put(GeoTracking.exitDrawing());
      }

      yield put({
        type: ACTIVITY_UPDATE_GEO_REQUEST,
        payload: { geometry: [action.payload] }
      });
      return;
    }

    if (tileCacheMode) {
      yield put(TileCache.setTileCacheShape({ geometry }));
    }
  } catch (error) {
    console.error('Error in handle_MAP_ON_SHAPE_UPDATE:', error);
  }
}

function* handle_WHATS_HERE_SERVER_FILTERED_IDS_FETCHED() {
  yield all([put(WhatsHere.iapp_rows_request()), put(WhatsHere.activity_rows_request())]);
}

function* handle_RECORDSET_ROTATE_COLOUR(action: PayloadAction<string>) {
  const userSettingsState = yield select(selectUserSettings);
  const recordSet = userSettingsState.recordSets[action.payload];
  const currentIndex = RECORD_COLOURS.indexOf(recordSet?.color);
  const nextIndex = (currentIndex + 1) % RECORD_COLOURS.length;
  yield put(UserSettings.RecordSet.set({ color: RECORD_COLOURS[nextIndex] }, action.payload));
}

function* handle_RECORDSET_TOGGLE_LABEL_VISIBILITY(action: PayloadAction<string>) {
  const userSettingsState = yield select(selectUserSettings);
  const recordSet = userSettingsState.recordSets[action.payload];
  yield put(UserSettings.RecordSet.set({ labelToggle: !recordSet?.labelToggle }, action.payload));
}

function* handle_RECORDSET_TOGGLE_VISIBILITY(action: PayloadAction<string>) {
  const userSettingsState = yield select(selectUserSettings);
  const recordSet = userSettingsState.recordSets[action.payload];
  yield put(UserSettings.RecordSet.set({ mapToggle: !recordSet?.mapToggle }, action.payload));
}

function* handle_RECORDSET_SET_SORT(action) {
  const userSettingsState = yield select(selectUserSettings);
  const recordSetType = userSettingsState.recordSets?.[action.payload.setID]?.recordSetType;
  const tableFiltersHash = userSettingsState.recordSets?.[action.payload.setID]?.tableFiltersHash;
  const actionArg = { recordSetID: action.payload.setID, limit: 20, page: 0, tableFiltersHash: tableFiltersHash };
  if (recordSetType === RecordSetType.Activity) {
    yield put(Activity.getRows(actionArg));
  } else if (recordSetType === RecordSetType.IAPP) {
    yield put(IappActions.getRows(actionArg));
  }
}

function* handle_ACTIVITIES_TABLE_GET_ROWS_REQUEST(action) {
  if (action.payload.recordSetID === RecordSetId.OfflineActivities) yield put(Activity.getRowsOffline(action.payload));
  else yield put(Activity.getRowsOnline(action.payload));
}

function* activitiesPageSaga() {
  yield all([
    fork(whatsHereSaga),
    debounce(500, UserSettings.RecordSet.updateFilter, handle_UserFilterChange),
    takeEvery(UserSettings.RecordSet.clearFilters, handle_UserFilterChange),
    takeEvery(UserSettings.RecordSet.removeFilter, handle_UserFilterChange),

    takeEvery(UserSettings.Boundaries.removeCustomLayer, handle_REMOVE_CUSTOM_LAYER),

    takeEvery(RECORDSET_SET_SORT, handle_RECORDSET_SET_SORT),

    //Conditions where we may want to redraw the Map layers, fetch IDLists, so on
    takeEvery(NetworkActions.online, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(UserSettings.RecordSet.add, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(UserSettings.SiteLists.createRecordsetsFromSiteList, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(MapActions.initForRecordset, handle_MAP_INIT_FOR_RECORDSETS),

    takeEvery(REFETCH_SERVER_BOUNDARIES, refetchServerBoundaries),
    takeEvery(WhatsHere.server_filtered_ids_fetched, handle_WHATS_HERE_SERVER_FILTERED_IDS_FETCHED),
    takeEvery(UserSettings.RecordSet.cycleColourById, handle_RECORDSET_ROTATE_COLOUR),
    takeEvery(UserSettings.RecordSet.toggleVisibility, handle_RECORDSET_TOGGLE_VISIBILITY),
    takeEvery(UserSettings.RecordSet.toggleLabelVisibility, handle_RECORDSET_TOGGLE_LABEL_VISIBILITY),
    takeEvery(REMOVE_SERVER_BOUNDARY, handle_REMOVE_SERVER_BOUNDARY),
    takeEvery(PAGE_OR_LIMIT_UPDATE, handle_PAGE_OR_LIMIT_UPDATE),
    takeEvery(UserSettings.InitState.getSuccess, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(MapActions.initRequest, handle_MAP_INIT_REQUEST),
    takeEvery(FILTER_PREP_FOR_VECTOR_ENDPOINT, handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT),
    takeEvery(Activity.getIdsForRecordset, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(Activity.getIdsForRecordsetOnline, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE),
    takeEvery(IappActions.getIdsForRecordset, handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(IappActions.getIdsForRecordsetOnline, handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE),

    takeLatest(Activity.getRows, handle_ACTIVITIES_TABLE_GET_ROWS),
    takeEvery(Activity.getRowsRequest, handle_ACTIVITIES_TABLE_GET_ROWS_REQUEST),
    takeEvery(Activity.getRowsOnline, handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE),
    takeEvery(Activity.getRowsOffline, handle_ACTIVITIES_TABLE_ROWS_GET_OFFLINE),
    takeEvery(Activity.Offline.getIdsForRecordset, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE),

    takeEvery(IappActions.getRows, handle_IAPP_TABLE_ROWS_GET_REQUEST),
    takeEvery(IappActions.getRowsRequest, handle_IAPP_TABLE_ROWS_GET_ONLINE),
    takeEvery(WhatsHere.iapp_rows_request, handle_WHATS_HERE_IAPP_ROWS_REQUEST),
    takeEvery(WhatsHere.page_poi, handle_WHATS_HERE_PAGE_POI),
    takeEvery(WhatsHere.sort_filter_update, handle_WHATS_HERE_SORT_FILTER_UPDATE),
    takeEvery(WhatsHere.page_activity, handle_WHATS_HERE_PAGE_ACTIVITY),
    takeEvery(WhatsHere.activity_rows_request, handle_WHATS_HERE_ACTIVITY_ROWS_REQUEST),
    takeEvery(RECORD_SET_TO_EXCEL_REQUEST, handle_RECORD_SET_TO_EXCEL_REQUEST),
    takeEvery(MAP_LABEL_EXTENT_FILTER_REQUEST, handle_MAP_LABEL_EXTENT_FILTER_REQUEST),
    takeEvery(IAPP_EXTENT_FILTER_REQUEST, handle_IAPP_EXTENT_FILTER_REQUEST),
    takeEvery(URL_CHANGE, handle_URL_CHANGE),
    takeEvery(MAP_ON_SHAPE_CREATE, handle_MAP_ON_SHAPE_CREATE),
    takeEvery(MAP_ON_SHAPE_UPDATE, handle_MAP_ON_SHAPE_UPDATE),
    ...TRACKING_SAGA_HANDLERS,
    ...LAYER_ELIGIBILITY_UPDATE
  ]);
}

export default activitiesPageSaga;
export { handle_ACTIVITIES_TABLE_GET_ROWS_REQUEST };
