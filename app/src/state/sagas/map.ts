import { area, buffer } from '@turf/turf';
import { Feature } from 'geojson';
import { actionChannel, all, call, debounce, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { buffers } from 'redux-saga';
import { Md5 } from 'ts-md5';
import {
  getIdsForRecordsetFromCache,
  handle_ACTIVITIES_TABLE_GET_ROWS,
  handle_IAPP_TABLE_ROWS_GET_REQUEST,
  handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY,
  handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT
} from './map/dataAccess';
import { handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE, handle_IAPP_TABLE_ROWS_GET_ONLINE } from './map/online';
import {
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE,
  handle_ACTIVITIES_TABLE_ROWS_GET_OFFLINE
} from './map/offline';
import { selectUserSettings } from 'state/reducers/userSettings';
import { selectMap } from 'state/reducers/map';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { TRACKING_SAGA_HANDLERS } from 'state/sagas/map/tracking';
import WhatsHere, { IGetIdsForRecordset } from 'state/actions/whatsHere/WhatsHere';
import Prompt from 'state/actions/prompts/Prompt';
import { RecordSetId, RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import Activity, { SwitchRecordSetPayload } from 'state/actions/activity/Activity';
import { RootState } from 'state/reducers/rootReducer';
import TileCache from 'state/actions/cache/TileCache';
import { RECORD_COLOURS } from 'constants/colors';
import EFilterType from 'constants/EFilterType';
import {
  IAddFilter,
  IRemoveFilter,
  ISetPageLimit,
  ISetSort,
  IUpdateFilter
} from 'state/actions/userSettings/RecordSet';
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
import { isPaused, isTracking } from 'utils/geoTrackingHelpers';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import AppActions from 'state/actions/appActions/appActions';
import DrawToolActions from 'state/actions/drawtool/drawToolActions';
import getIdsForRecordset from 'utils/getIdsForRecordset';
import { selectConfiguration } from 'state/reducers/configuration';
import Alerts from 'state/actions/alerts/Alerts';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';

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
    yield put(MapActions.initServerBoundaries(shapes));
  }
}

function* handle_WHATS_HERE_FEATURE(whatsHereFeature: PayloadAction<Feature>) {
  const METERS_IN_HECTARE = 10000;
  const MAX_HECTARES = 3000;
  const newGeom =
    whatsHereFeature.payload.geometry.type === GeoShapes.Polygon
      ? whatsHereFeature.payload
      : buffer(whatsHereFeature.payload, 5, { units: 'centimeters' });

  const isOversized = newGeom && area(newGeom) > METERS_IN_HECTARE * MAX_HECTARES;
  if (isOversized) {
    yield all([
      // Terminate process, end loading spinner/status
      yield put(WhatsHere.server_filtered_ids_fetched([], [])),
      yield put(
        Alerts.create({
          subject: AlertSubjects.Map,
          severity: AlertSeverity.Error,
          content: `Reduce area of search to <${MAX_HECTARES.toLocaleString()} Hectares`,
          autoClose: 4
        })
      )
    ]);
    return;
  }

  const { connected } = yield select(selectNetworkState);

  if (connected) {
    // get all the toggled on recordsets
    const tableFilters = [
      {
        id: '0.81778552637744651712083357942',
        filterType: EFilterType.Drawn,
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

function* handle_WHATS_HERE_SORT_FILTER_UPDATE(record: PayloadAction<Record<PropertyKey, any>>) {
  const { recordType } = record.payload;
  if (recordType === RecordSetType.IAPP) {
    yield put(WhatsHere.iapp_rows_request());
  } else if (recordType === RecordSetType.Activity) {
    yield put(WhatsHere.activity_rows_request());
  }
}

function* handle_SWITCH_RECORDSET(action: PayloadAction<SwitchRecordSetPayload>) {
  const { setId, type } = action.payload;
  if (type === 'Activity') {
    yield put(MapActions.setCurrentOpenSet(setId));

    let recordSetsState = yield select(selectUserSettings);
    let recordSetType = recordSetsState.recordSets?.[setId]?.recordSetType;
    if (recordSetType === undefined) {
      yield take(UserSettings.InitState.getSuccess);
      recordSetsState = yield select(selectUserSettings);
      recordSetType = recordSetsState.recordSets?.[setId]?.recordSetType;
    }
    const mapState = yield select(selectMap);
    const page = mapState.recordTables?.[setId]?.page || 0;
    const limit = mapState.recordTables?.[setId]?.limit || 20;

    const actionArg = {
      recordSetID: setId,
      tableFiltersHash: recordSetsState.recordSets?.[setId]?.tableFiltersHash,
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

function* handle_UserFilterChange(action: PayloadAction<{ setID: string | number; tableFiltersHash: string }>) {
  const { setID } = action.payload;
  const { recordSets } = yield select(selectUserSettings);
  const map = yield select(selectMap);

  const record = recordSets[setID];
  const currentSet = map?.currentOpenSet;
  const recordSetType = record?.recordSetType;

  yield put(
    AppActions.prepVectorFilters({
      recordSetID: setID,
      tableFiltersHash: record?.tableFiltersHash
    })
  );
  const actionArg = {
    recordSetID: setID,
    tableFiltersHash: record?.tableFiltersHash,
    page: 0,
    limit: 20
  };

  if (currentSet !== setID) return;
  switch (recordSetType) {
    case RecordSetType.Activity:
      yield put(Activity.getRows(actionArg));
      break;
    case RecordSetType.IAPP:
      yield put(IappActions.getRows(actionArg));
      break;
  }
  yield put(WhatsHere.getIdsForRecordset(actionArg));
}

function* handle_PAGE_OR_LIMIT_UPDATE(action: PayloadAction<ISetPageLimit>) {
  const { setID, page, limit } = action.payload;
  const recordSetsState = yield select(selectUserSettings);
  const recordSetType = recordSetsState.recordSets?.[setID]?.recordSetType;

  const actionArg = {
    recordSetID: action.payload.setID,
    tableFiltersHash: recordSetsState.recordSets?.[setID]?.tableFiltersHash,
    page: page,
    limit: limit
  };

  if (recordSetType === RecordSetType.Activity) {
    yield put(Activity.getRows(actionArg));
  } else if (recordSetType === RecordSetType.IAPP) {
    yield put(IappActions.getRows(actionArg));
  }
}

/**
 * @desc Waits for the new recordset to get its IDList then begins downloading records for it.
 */
function* handle_DOWNLOAD_NEW_TRIP_RECORDSET(action: PayloadAction<UserRecordSet>) {
  yield call(handle_MAP_INIT_FOR_RECORDSETS);
  const connected = yield select(selectNetworkConnected);

  if (!connected) return;
  const recordId = action.payload.id;
  const desiredAction = WhatsHere.getIdsForRecordsetSuccess.type;

  // Wait for Recordsets to have valid IDList
  yield take((incAction) => incAction.type === desiredAction && incAction.payload.recordSetID === recordId);
  yield put(PlanMyTrip.Recordset.download(recordId));
}

function* handle_MAP_INIT_FOR_RECORDSETS() {
  const INIT_TABLE_HASH = 'init';
  const uninitializedLayers: Array<{ recordSetID: string; recordSetType: RecordSetType }> = [];

  const { recordSets } = yield select(selectUserSettings);
  const { layers } = yield select(selectMap);
  const layerIds: Array<string> = layers.map((l) => l?.recordSetID);
  // Check for Layers not initialized
  Object.keys(recordSets)
    .filter((k) => !layerIds.includes(k))
    .forEach((k) => uninitializedLayers.push({ recordSetID: k, recordSetType: recordSets[k].recordSetType }));
  layers
    .filter((l) => !Object.hasOwn(l, 'loading'))
    .forEach((l) => uninitializedLayers.push({ recordSetID: l.recordSetID, recordSetType: l.type }));

  for (const { recordSetID } of uninitializedLayers) {
    const payload = { recordSetID, tableFiltersHash: INIT_TABLE_HASH };

    if (recordSetID === RecordSetId.OfflineActivities) {
      const { mapToggle, labelToggle } = recordSets[RecordSetId.OfflineActivities];
      yield put(AppActions.prepOfflineActivityLayer({ mapToggle, labelToggle }));
    } else {
      yield put(AppActions.prepVectorFilters(payload));
    }
    yield put(WhatsHere.getIdsForRecordset(payload));
  }
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

function* handle_REMOVE_SERVER_BOUNDARY(action: PayloadAction<string>) {
  yield put(UserSettings.KML.toggle(action.payload, false));
  try {
    const networkReturn = yield InvasivesAPI_Call('DELETE', `/api/admin-defined-shapes/`, {
      server_id: action.payload
    });

    if (networkReturn?.ok) {
      yield put(UserSettings.KML.deleteSuccess(action.payload));
    }
  } catch (e) {
    console.error(e);
    yield put(UserSettings.KML.deleteFailure(action.payload));
  }
}

function* handle_MAP_ON_SHAPE_CREATE(action: PayloadAction<Feature>) {
  const appModeUrl = yield select((state: RootState) => state.AppMode.url);
  const whatsHereToggle = yield select((state: RootState) => state.Map.whatsHere.toggle);
  const { status, shapeType } = yield select((state) => state.Map.track_me_draw_geo);

  const geometry = action.payload.geometry;
  const isLineString = geometry?.type === GeoShapes.LineString;
  const isPolygonOrPoint = [GeoShapes.Polygon, GeoShapes.Point, GeoShapes.MultiPolygon].includes(
    geometry?.type as GeoShapes
  );
  const hasCoordinates = 'coordinates' in geometry && geometry?.coordinates?.length > 0;
  const noUserError = action?.payload?.properties?.user_error !== 'true';

  if (isPolygonOrPoint && hasCoordinates && noUserError) {
    const isActivityPage = appModeUrl && /(Activity|HookForm)/.test(appModeUrl);
    if (isActivityPage && !whatsHereToggle) {
      yield put(DrawToolActions.updateGeo([action.payload]));
      return;
    }
  }

  if (isLineString && hasCoordinates && noUserError) {
    const isGeoTrackingLineString = isTracking(status) && shapeType === GeoShapes.LineString;
    if (!isGeoTrackingLineString && action.payload.id === GEO_TRACKING_FEATURE) return;

    yield put(
      Prompt.number({
        title: 'Buffer needed',
        prompt: 'Enter width in meters for line to be buffered:',
        min: 0.001,
        acceptFloats: true,
        callback: (width: number) => {
          const newGeo = (buffer(geometry, width / 10000) ?? geometry) as Feature;
          if (appModeUrl && /(Activity|HookForm)/.test(appModeUrl) && !whatsHereToggle) {
            return [DrawToolActions.updateGeo([newGeo])];
          }
        },
        label: 'Meters'
      })
    );
  }
}

function* handle_MAP_ON_SHAPE_UPDATE(action: PayloadAction<Feature>) {
  try {
    const { url } = yield select((state) => state.AppMode);
    const { drawingCustomLayer, whatsHere, tileCacheMode } = yield select((state: RootState) => state.Map);
    const { status, shapeType } = yield select((state) => state.Map.track_me_draw_geo);
    const { id, geometry } = action.payload;

    const isActivityPage = url && /(Activity|HookForm)/.test(url);
    const isGeoTrackingFeature = id === GEO_TRACKING_FEATURE;

    if (drawingCustomLayer) {
      yield put(UserSettings.Boundaries.drawCustomLayer(action.payload));
      return;
    }

    if (isActivityPage && !whatsHere.toggle) {
      if (isGeoTrackingFeature) {
        if (isPaused(status)) {
          // don't do anything, just call DrawToolActions.updateGeo()
        } else if (shapeType === GeoShapes.Polygon && 'coordinates' in geometry) {
          geometry.type = shapeType;
          geometry.coordinates = normalizeToPolygonCoordinates(geometry.coordinates);
        }
      } else if (shapeType === GeoShapes.LineString && geometry?.type === GeoShapes.LineString) {
        yield put(
          Prompt.number({
            title: 'Buffer needed',
            prompt: 'Enter width in meters for line to be buffered:',
            min: 0.001,
            acceptFloats: true,
            callback: (width: number) => {
              const newGeo = (buffer(geometry, width / 10000) ?? geometry) as Feature;
              return [DrawToolActions.updateGeo([newGeo])];
            },
            label: 'Meters'
          })
        );
        return;
      } else if (isTracking(status)) {
        yield put(GeoTracking.exitDrawing());
      }
      yield put(DrawToolActions.updateGeo([action.payload]));
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

function* handle_RECORDSET_SET_SORT(action: PayloadAction<ISetSort>) {
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
  if (action.payload.recordSetID === RecordSetId.OfflineActivities) {
    yield put(Activity.getRowsOffline(action.payload));
  } else {
    yield put(Activity.getRowsOnline(action.payload));
  }
}
function* handle_GET_RECORDSET_IDS(action: PayloadAction<IGetIdsForRecordset>) {
  const { API_BASE } = yield select(selectConfiguration);
  const currentState = yield select((state) => state.UserSettings);
  const workingOffline = yield select((state) => state.Auth.workingOffline);
  const connected = yield select((state) => state.Network.connected);
  const userIsOffline = workingOffline || !connected;

  // Delegate errant Offline actions
  if (action.payload.recordSetID === RecordSetId.OfflineActivities) {
    yield handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE(action);
    return;
  }
  // Attempt to retrieve Records from API
  try {
    if (!userIsOffline) {
      const ids = yield getIdsForRecordset(currentState.recordSets[action.payload.recordSetID], { API_BASE });
      yield put(WhatsHere.getIdsForRecordsetSuccess({ idList: ids, ...action.payload }));
      return; // Exit out, we don't need to scan for Cached Records
    }
  } catch (e) {
    console.error('[handle_GET_RECORDSET_IDS]:', e);
  }
  // If Online attempt fails, or user is currently offline, delegate to Cache
  if (buildTimeConfig.MOBILE) {
    yield getIdsForRecordsetFromCache(action.payload);
  }
}

/**
 * @desc Channel to run handle_GET_RECORDSET_IDS requests synchronously.
 *       Prevents spamming API and getting Out of Memory crashes on Mobile
 */
function* createQueueWorker(channel) {
  while (true) {
    const action = yield take(channel);
    yield call(handle_GET_RECORDSET_IDS, action);
  }
}

function* handle_updateTableFiltersHash(action: PayloadAction<IRemoveFilter | IUpdateFilter | IAddFilter>) {
  const { setID } = action.payload;
  const { recordSets } = yield select(selectUserSettings);
  const tableFiltersNotBlank = recordSets[setID]?.tableFilters.filter((filter) => !!filter.filter);

  const newTableFiltersHash = Md5.hashStr(JSON.stringify(tableFiltersNotBlank));
  const currentHash = recordSets[setID]?.tableFiltersHash;

  if (newTableFiltersHash !== currentHash) {
    yield put(UserSettings.RecordSet.updateTableFiltersHash({ setID, tableFiltersHash: newTableFiltersHash }));
  }
}
function* activitiesPageSaga() {
  yield all([
    fork(whatsHereSaga),
    // On changes to recordsets filters, update the hash.
    debounce(500, UserSettings.RecordSet.updateFilter, handle_updateTableFiltersHash),
    takeEvery(UserSettings.RecordSet.clearFilters, handle_updateTableFiltersHash),
    takeEvery(UserSettings.RecordSet.removeFilter, handle_updateTableFiltersHash),
    takeEvery(UserSettings.RecordSet.addFilter, handle_updateTableFiltersHash),

    takeEvery(UserSettings.RecordSet.updateTableFiltersHash, handle_UserFilterChange),
    takeEvery(UserSettings.Boundaries.removeCustomLayer, handle_REMOVE_CUSTOM_LAYER),

    takeEvery(UserSettings.RecordSet.setSort, handle_RECORDSET_SET_SORT),

    //Conditions where we may want to redraw the Map layers, fetch IDLists, so on
    takeEvery(NetworkActions.online, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(UserSettings.RecordSet.add, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(PlanMyTrip.Recordset.create, handle_DOWNLOAD_NEW_TRIP_RECORDSET),
    takeEvery(UserSettings.SiteLists.createRecordsetsFromSiteList, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(MapActions.initForRecordset, handle_MAP_INIT_FOR_RECORDSETS),

    takeEvery(MapActions.refetchServerBoundaries, refetchServerBoundaries),
    takeEvery(WhatsHere.server_filtered_ids_fetched, handle_WHATS_HERE_SERVER_FILTERED_IDS_FETCHED),
    takeEvery(UserSettings.RecordSet.cycleColourById, handle_RECORDSET_ROTATE_COLOUR),
    takeEvery(UserSettings.RecordSet.toggleVisibility, handle_RECORDSET_TOGGLE_VISIBILITY),
    takeEvery(UserSettings.RecordSet.toggleLabelVisibility, handle_RECORDSET_TOGGLE_LABEL_VISIBILITY),
    takeEvery(UserSettings.KML.delete, handle_REMOVE_SERVER_BOUNDARY),
    takeEvery(UserSettings.RecordSet.setPageLimit, handle_PAGE_OR_LIMIT_UPDATE),
    takeEvery(UserSettings.InitState.getSuccess, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(MapActions.initRequest, handle_MAP_INIT_REQUEST),
    takeEvery(AppActions.prepVectorFilters, handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT),

    fork(createQueueWorker, yield actionChannel([WhatsHere.getIdsForRecordset], buffers.expanding())),

    takeLatest(Activity.getRows, handle_ACTIVITIES_TABLE_GET_ROWS),
    takeEvery(Activity.getRowsRequest, handle_ACTIVITIES_TABLE_GET_ROWS_REQUEST),
    takeEvery(Activity.getRowsOnline, handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE),
    takeEvery(Activity.getRowsOffline, handle_ACTIVITIES_TABLE_ROWS_GET_OFFLINE),
    takeEvery(Activity.Offline.getIdsForRecordset, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE),
    takeEvery(Activity.switchRecordSet, handle_SWITCH_RECORDSET),

    takeEvery(IappActions.getRows, handle_IAPP_TABLE_ROWS_GET_REQUEST),
    takeEvery(IappActions.getRowsRequest, handle_IAPP_TABLE_ROWS_GET_ONLINE),
    takeEvery(WhatsHere.iapp_rows_request, handle_WHATS_HERE_IAPP_ROWS_REQUEST),
    takeEvery(WhatsHere.page_poi, handle_WHATS_HERE_PAGE_POI),
    takeEvery(WhatsHere.sort_filter_update, handle_WHATS_HERE_SORT_FILTER_UPDATE),
    takeEvery(WhatsHere.page_activity, handle_WHATS_HERE_PAGE_ACTIVITY),
    takeEvery(WhatsHere.activity_rows_request, handle_WHATS_HERE_ACTIVITY_ROWS_REQUEST),
    takeEvery(DrawToolActions.createShape, handle_MAP_ON_SHAPE_CREATE),
    takeEvery(DrawToolActions.updateShape, handle_MAP_ON_SHAPE_UPDATE),
    ...TRACKING_SAGA_HANDLERS
  ]);
}

export default activitiesPageSaga;
export { handle_ACTIVITIES_TABLE_GET_ROWS_REQUEST };
