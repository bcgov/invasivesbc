import * as turf from '@turf/turf';
import { all, call, debounce, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { getSearchCriteriaFromFilters } from '../../utils/miscYankedFromComponents';
import {
  ACTIVITIES_GEOJSON_GET_ONLINE,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GEOJSON_REFETCH_ONLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  ACTIVITY_UPDATE_GEO_REQUEST,
  CUSTOM_LAYER_DRAWN,
  DRAW_CUSTOM_LAYER,
  FILTER_PREP_FOR_VECTOR_ENDPOINT,
  IAPP_EXTENT_FILTER_REQUEST,
  IAPP_EXTENT_FILTER_SUCCESS,
  IAPP_GEOJSON_GET_ONLINE,
  IAPP_GEOJSON_GET_REQUEST,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  IAPP_TABLE_ROWS_GET_ONLINE,
  IAPP_TABLE_ROWS_GET_REQUEST,
  INIT_SERVER_BOUNDARIES_GET,
  MAP_INIT_FOR_RECORDSET,
  MAP_INIT_REQUEST,
  MAP_LABEL_EXTENT_FILTER_REQUEST,
  MAP_LABEL_EXTENT_FILTER_SUCCESS,
  MAP_ON_SHAPE_CREATE,
  MAP_ON_SHAPE_UPDATE,
  MAP_TOGGLE_GEOJSON_CACHE,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY,
  PAGE_OR_LIMIT_UPDATE,
  RECORD_SET_TO_EXCEL_FAILURE,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  RECORDSET_CLEAR_FILTERS,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_SET_SORT,
  RECORDSET_UPDATE_FILTER,
  REFETCH_SERVER_BOUNDARIES,
  REMOVE_CLIENT_BOUNDARY,
  REMOVE_SERVER_BOUNDARY,
  SET_CURRENT_OPEN_SET,
  TOGGLE_PANEL,
  URL_CHANGE
} from '../actions';
import {
  getRecordFilterObjectFromStateForAPI,
  handle_ACTIVITIES_GEOJSON_GET_REQUEST,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  handle_IAPP_GEOJSON_GET_REQUEST,
  handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_IAPP_TABLE_ROWS_GET_REQUEST,
  handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY,
  handle_MAP_WHATS_HERE_INIT_GET_POI,
  handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT
} from './map/dataAccess';
import {
  handle_ACTIVITIES_GEOJSON_GET_ONLINE,
  handle_ACTIVITIES_GEOJSON_REFETCH_ONLINE,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  handle_IAPP_GEOJSON_GET_ONLINE,
  handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_IAPP_TABLE_ROWS_GET_ONLINE
} from './map/online';
import { selectUserSettings } from 'state/reducers/userSettings';
import { ACTIVITY_GEOJSON_SOURCE_KEYS, selectMap } from 'state/reducers/map';
import { selectAuth } from 'state/reducers/auth';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { TRACKING_SAGA_HANDLERS } from 'state/sagas/map/tracking';
import { BASE_LAYER_HANDLERS } from 'state/sagas/map/base-layers';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import Prompt from 'state/actions/prompts/Prompt';
import { RecordSetType } from 'interfaces/UserRecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { SortFilter } from 'interfaces/filterParams';
import Activity from 'state/actions/activity/Activity';

function* handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS(action) {
  yield put({ type: MAP_INIT_REQUEST, payload: {} });
}

function* handle_MAP_INIT_REQUEST(action) {
  const authState = yield select(selectAuth);
  const mapState = yield select(selectMap);
  const sets = {};
  const filterCriteria = yield getSearchCriteriaFromFilters([], sets, '2', false, [], 0, 100000);
  const IAPP_filter = yield getSearchCriteriaFromFilters([], sets, '3', true, [], 0, 100);
  if (mapState.MapMode !== 'VECTOR_ENDPOINT') {
    yield put(Activity.GeoJson.get(filterCriteria));
    yield put({
      type: IAPP_GEOJSON_GET_REQUEST,
      payload: {
        IAPPFilterCriteria: { ...IAPP_filter, limit: 200000 }
      }
    });
  }

  yield call(refetchServerBoundaries);
  yield put({ type: MAP_INIT_FOR_RECORDSET });
}

function* refetchServerBoundaries() {
  const serverShapesServerResponse = yield InvasivesAPI_Call('GET', '/admin-defined-shapes/');
  const shapes = serverShapesServerResponse.data.result;
  yield put({ type: INIT_SERVER_BOUNDARIES_GET, payload: { data: shapes } });
}

function* getPOIIDsOnline(feature, filterCriteria) {}

function* handle_WHATS_HERE_FEATURE(action) {
  let mapState = yield select(selectMap);

  let layersLoading = true;
  while (layersLoading) {
    mapState = yield select(selectMap);

    const toggledOnActivityLayers = mapState.layers.filter((layer) => {
      return layer.layerState.mapToggle && layer.type === RecordSetType.Activity;
    });

    const activityLayersLoading = toggledOnActivityLayers.filter((layer) => {
      return layer.loading;
    });

    const toggledOnIAPPLayers = mapState.layers.filter((layer) => {
      return layer.layerState.mapToggle && layer.type === RecordSetType.IAPP;
    });

    const IAPPLayersLoading = toggledOnIAPPLayers.filter((layer) => {
      return layer.loading;
    });

    if (activityLayersLoading.length === 0 && IAPPLayersLoading.length === 0) {
      layersLoading = false;
    } else {
      const actionsToTake = [];
      if (activityLayersLoading.length > 0) {
        actionsToTake.push(
          activityLayersLoading.map((layer) => {
            return ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS;
          })
        );
      }
      if (IAPPLayersLoading.length > 0) {
        actionsToTake.push(
          IAPPLayersLoading.map((layer) => {
            return IAPP_GET_IDS_FOR_RECORDSET_SUCCESS;
          })
        );
      }
      yield all(actionsToTake.map((action) => take(action)));
    }
  }
  if (mapState.MapMode === 'VECTOR_ENDPOINT') {
    // get all the toggled on recordsets

    const activitiesfilterObj = {
      selectColumns: ['activity_id'],
      tableFilters: [
        {
          id: '0.81778552637744651712083357942',
          filterType: 'spatialFilterDrawn',
          operator: 'CONTAINED IN',
          filter: '0.652479498272151712093656568',
          geojson: action.payload
        }
      ],
      limit: 200000
    };

    const activitiesNetworkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
      filterObjects: [activitiesfilterObj]
    });

    let activitiesServerIDList = [];
    if (activitiesNetworkReturn.data.result || activitiesNetworkReturn.data?.data?.result) {
      const list = activitiesNetworkReturn.data?.data?.result
        ? activitiesNetworkReturn.data?.data?.result
        : activitiesNetworkReturn.data?.result;
      activitiesServerIDList = list.map((row) => {
        return row.activity_id;
      });
    }

    const iappfilterObj = {
      selectColumns: ['site_id'],
      tableFilters: [
        {
          id: '0.81778552637744651712083357942',
          filterType: 'spatialFilterDrawn',
          operator: 'CONTAINED IN',
          filter: '0.652479498272151712093656568',
          geojson: action.payload
        }
      ],
      limit: 200000
    };

    const iappNetworkReturn = yield InvasivesAPI_Call('POST', `/api/v2/iapp/`, {
      filterObjects: [iappfilterObj]
    });

    let iappServerIDList = [];

    if (iappNetworkReturn.data.result || iappNetworkReturn.data?.data?.result) {
      const list = iappNetworkReturn.data?.data?.result
        ? iappNetworkReturn.data?.data?.result
        : iappNetworkReturn.data?.result;
      iappServerIDList = list.map((row) => {
        return row.site_id;
      });
    }

    yield put(WhatsHere.server_filtered_ids_fetched(activitiesServerIDList, iappServerIDList));
  }

  if (!(mapState.MapMode === 'VECTOR_ENDPOINT')) {
    if (!mapState.activitiesGeoJSONDict) {
      yield take(ACTIVITIES_GEOJSON_GET_SUCCESS);
    }
    mapState = yield select(selectMap);
    if (!mapState.IAPPGeoJSONDict) {
      yield take(IAPP_GEOJSON_GET_SUCCESS);
    }

    yield put(WhatsHere.map_init_get_activity());
    yield put(WhatsHere.map_init_get_poi());
  }
}

function* whatsHereSaga() {
  yield all([
    takeEvery(WhatsHere.map_init_get_poi, handle_MAP_WHATS_HERE_INIT_GET_POI),
    takeEvery(MAP_WHATS_HERE_INIT_GET_ACTIVITY, handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY),
    takeEvery(WhatsHere.map_feature, handle_WHATS_HERE_FEATURE)
  ]);
}

function* handle_WHATS_HERE_IAPP_ROWS_REQUEST(action) {
  const mapState = yield select(selectMap);
  if (mapState.MapMode === 'VECTOR_ENDPOINT') {
    const startRecord =
      mapState?.whatsHere?.IAPPLimit * (mapState?.whatsHere?.IAPPPage + 1) - mapState?.whatsHere?.IAPPLimit;
    const endRecord = mapState?.whatsHere?.IAPPLimit * (mapState?.whatsHere?.IAPPPage + 1);
    const slicedIDs = mapState.whatsHere.IAPPIDs.slice(startRecord, endRecord);

    const filterObject = {
      selectColumns: ['site_id', 'jurisdictions_flattened', 'map_symbol', 'min_survey', 'reported_area', 'geojson'],
      limit: 200000,
      ids_to_filter: slicedIDs
    };

    if (slicedIDs.length === 0) {
      yield put(WhatsHere.iapp_rows_success([]));
      return;
    }

    const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/iapp/`, {
      filterObjects: [filterObject]
    });

    const mappedToWhatsHereColumns = networkReturn.data.result.map((iappRecord) => {
      return {
        id: iappRecord.site_id,
        site_id: iappRecord.site_id,
        jurisdiction_code: iappRecord.jurisdictions_flattened,
        species_code: iappRecord.map_symbol,
        earliest_survey: new Date(iappRecord.min_survey).toDateString(),
        geometry: iappRecord.geojson
      };
    });
    yield put(WhatsHere.iapp_rows_success(mappedToWhatsHereColumns));
  }
  if (!(mapState.MapMode === 'VECTOR_ENDPOINT')) {
    try {
      const startRecord =
        mapState?.whatsHere?.IAPPLimit * (mapState?.whatsHere?.IAPPPage + 1) - mapState?.whatsHere?.IAPPLimit;
      const endRecord = mapState?.whatsHere?.IAPPLimit * (mapState?.whatsHere?.IAPPPage + 1);
      const sorted = mapState?.whatsHere?.IAPPIDs.map((site_id) => mapState?.IAPPGeoJSONDict[site_id]).sort((a, b) => {
        if (mapState?.whatsHere?.IAPPSortDirection === SortFilter.Desc) {
          return a?.properties[mapState?.whatsHere?.IAPPSortField] > b?.properties[mapState?.whatsHere?.IAPPSortField]
            ? 1
            : -1;
        } else {
          return a?.properties[mapState?.whatsHere?.IAPPSortField] < b?.properties[mapState?.whatsHere?.IAPPSortField]
            ? 1
            : -1;
        }
      });
      /*const slice = mapState?.whatsHere?.ActivityIDs?.slice(startRecord, endRecord);
       */
      const sliceWithData = sorted.slice(startRecord, endRecord);

      const mappedToWhatsHereColumns = sliceWithData.map((iappRecord) => {
        return {
          id: iappRecord?.properties.site_id,
          site_id: iappRecord?.properties.site_id,
          jurisdiction_code: iappRecord?.properties.jurisdictions,
          species_code: iappRecord?.properties.species_on_site,
          earliest_survey: iappRecord?.properties.earliest_survey,
          geometry: iappRecord?.geometry,
          reported_area: iappRecord?.properties.reported_area
        };
      });

      yield put(WhatsHere.iapp_rows_success(mappedToWhatsHereColumns));
    } catch (e) {
      console.error(e);
    }
  }
}

function* handle_WHATS_HERE_PAGE_POI(action) {
  yield put(WhatsHere.iapp_rows_request());
}

function* handle_WHATS_HERE_ACTIVITY_ROWS_REQUEST(action) {
  const mapState = yield select(selectMap);
  if (mapState.MapMode === 'VECTOR_ENDPOINT') {
    const startRecord =
      mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1) - mapState?.whatsHere?.ActivityLimit;
    const endRecord = mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1);
    const slicedIDs = mapState.whatsHere.ActivityIDs.slice(startRecord, endRecord);

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

    const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
      filterObjects: [filterObject]
    });

    const mappedToWhatsHereColumns = networkReturn.data.result.map((activityRecord) => {
      return {
        id: activityRecord.activity_id,
        short_id: activityRecord.short_id,
        activity_type: activityRecord.activity_type,
        jurisdiction_code: activityRecord.jurisdiction_display,
        species_code: activityRecord.map_symbol,
        reported_area: activityRecord.activity_payload.form_data.activity_data.reported_area,
        geometry: activityRecord.activity_payload.geometry?.[0],
        created: new Date(activityRecord.activity_payload.form_data.activity_data.activity_date_time).toDateString()
      };
    });
    yield put(WhatsHere.activity_rows_success(mappedToWhatsHereColumns));
  }

  if (!(mapState.MapMode === 'VECTOR_ENDPOINT')) {
    try {
      const mapState = yield select(selectMap);
      const startRecord =
        mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1) -
        mapState?.whatsHere?.ActivityLimit;
      const endRecord = mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1);

      const sorted = mapState?.whatsHere?.ActivityIDs.map((id) => {
        for (const source of ACTIVITY_GEOJSON_SOURCE_KEYS) {
          if (mapState.activitiesGeoJSONDict[source] !== undefined) {
            if (mapState.activitiesGeoJSONDict[source][id]) {
              return mapState.activitiesGeoJSONDict[source][id];
            }
          }
        }
        return null;
      }).sort((a, b) => {
        if (mapState?.whatsHere?.ActivitySortDirection === SortFilter.Desc) {
          return a?.properties[mapState?.whatsHere?.ActivitySortField] >
            b?.properties[mapState?.whatsHere?.ActivitySortField]
            ? 1
            : -1;
        } else {
          return a?.properties[mapState?.whatsHere?.ActivitySortField] <
            b?.properties[mapState?.whatsHere?.ActivitySortField]
            ? 1
            : -1;
        }
      });
      /*const slice = mapState?.whatsHere?.ActivityIDs?.slice(startRecord, endRecord);
       */
      const sliceWithData = sorted.slice(startRecord, endRecord);
      const mappedToWhatsHereColumns = sliceWithData.map((activityRecord) => {
        const jurisdiction_code = [];
        activityRecord?.properties?.jurisdiction?.forEach((item) => {
          jurisdiction_code.push(item.jurisdiction_code + ' (' + item.percent_covered + '%)');
        });

        const species_code = [];
        switch (activityRecord?.properties?.type) {
          case 'Observation':
            activityRecord?.properties?.species_positive?.forEach((s) => {
              if (s !== null) species_code.push(s);
            });
            activityRecord?.properties?.species_negative?.forEach((s) => {
              if (s !== null) species_code.push(s);
            });
            break;
          case 'Biocontrol':
          case 'Treatment':
            if (
              activityRecord?.properties.species_treated &&
              activityRecord?.properties.species_treated.length > 0 &&
              activityRecord?.properties.species_treated[0] !== null
            ) {
              const treatmentTemp = activityRecord?.properties.species_treated;
              if (treatmentTemp) {
                treatmentTemp.forEach((s) => {
                  species_code.push(s);
                });
              }
            }
            break;
          case 'Monitoring':
            if (
              activityRecord?.properties.species_treated &&
              activityRecord?.properties.species_treated.length > 0 &&
              activityRecord?.properties.species_treated[0] !== null
            ) {
              const monitoringTemp = activityRecord?.properties.species_treated;
              if (monitoringTemp) {
                monitoringTemp.forEach((s) => {
                  species_code.push(s);
                });
              }
            }
            break;
        }

        return {
          id: activityRecord?.properties?.id,
          short_id: activityRecord?.properties?.short_id,
          activity_type: activityRecord?.properties?.type,
          reported_area: activityRecord?.properties?.reported_area ? activityRecord?.properties?.reported_area : 0,
          created: activityRecord?.properties?.created,
          jurisdiction_code: jurisdiction_code,
          species_code: species_code,
          geometry: activityRecord?.geometry
        };
      });
      yield put(WhatsHere.activity_rows_success(mappedToWhatsHereColumns));
    } catch (e) {
      console.error(e);
    }
  }
}

function* handle_WHATS_HERE_PAGE_ACTIVITY(action) {
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
      //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
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
      //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
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

function* handle_WHATS_HERE_SORT_FILTER_UPDATE(action) {
  switch (action.payload.recordType) {
    case RecordSetType.IAPP:
      yield put(WhatsHere.iapp_rows_request());
      break;
    default:
      yield put(WhatsHere.activity_rows_request());
      break;
  }
}

function* handle_MAP_LABEL_EXTENT_FILTER_REQUEST(action) {
  const bbox = [action.payload.minX, action.payload.minY, action.payload.maxX, action.payload.maxY];
  const bounds = turf.bboxPolygon(bbox as any);

  yield put({
    type: MAP_LABEL_EXTENT_FILTER_SUCCESS,
    payload: {
      bounds: bounds
    }
  });
}

function* handle_IAPP_EXTENT_FILTER_REQUEST(action) {
  const bbox = [action.payload.minX, action.payload.minY, action.payload.maxX, action.payload.maxY];
  const bounds = turf.bboxPolygon(bbox as any);

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

    if (recordSetType === RecordSetType.Activity) {
      yield put({
        type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
        payload: {
          recordSetID: id,
          tableFiltersHash: recordSetsState.recordSets?.[id]?.tableFiltersHash,
          page: page,
          limit: limit
        }
      });
    } else {
      yield put({
        type: IAPP_TABLE_ROWS_GET_REQUEST,
        payload: {
          recordSetID: id,
          tableFiltersHash: recordSetsState.recordSets?.[id]?.tableFiltersHash,
          page: page,
          limit: limit
        }
      });
    }
  }
}

function* handle_UserFilterChange(action) {
  const recordSetsState = yield select(selectUserSettings);
  const map = yield select(selectMap);
  const currentSet = map?.currentOpenSet;
  const recordSetType = recordSetsState.recordSets?.[action.payload.setID]?.recordSetType;

  if (
    recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash !==
    recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersPreviousHash
  )
    if (map.MapMode === 'VECTOR_ENDPOINT') {
      yield put({
        type: FILTER_PREP_FOR_VECTOR_ENDPOINT,
        payload: {
          recordSetID: action.payload.setID,
          tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
        }
      });
    }
  if (recordSetType === 'Activity') {
    if (currentSet === action.payload.setID)
      yield put({
        type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
        payload: {
          recordSetID: action.payload.setID,
          tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
          page: 0,
          limit: 20
        }
      });
    yield put({
      type: ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
      payload: {
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
      }
    });
  } else {
    if (currentSet === action.payload.setID)
      yield put({
        type: IAPP_TABLE_ROWS_GET_REQUEST,
        payload: {
          recordSetID: action.payload.setID,
          tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
          page: 0,
          limit: 20
        }
      });
    yield put({
      type: IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
      payload: {
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
      }
    });
  }
}

function* handle_PAGE_OR_LIMIT_UPDATE(action) {
  const recordSetsState = yield select(selectUserSettings);
  const recordSetType = recordSetsState.recordSets?.[action.payload.setID]?.recordSetType;
  const mapState = yield select(selectMap);

  const page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
  const limit = action.payload.limit
    ? action.payload.limit
    : mapState.recordTables?.[action.payload.recordSetID]?.limit;

  if (recordSetType === 'Activity') {
    yield put({
      type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
      payload: {
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
        page: page,
        limit: limit
      }
    });
  } else {
    yield put({
      type: IAPP_TABLE_ROWS_GET_REQUEST,
      payload: {
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
        page: page,
        limit: limit
      }
    });
  }
}

function* handle_MAP_INIT_FOR_RECORDSETS(action) {
  const userSettingsState = yield select(selectUserSettings);
  const recordSets = Object.keys(userSettingsState.recordSets);
  const mapMode = yield select((state) => state.Map.MapMode);

  // current layers
  const layers = yield select((state) => state.Map.layers);
  const layerIDs = layers.map((layer) => layer.recordSetID);

  // current but unintialized:
  const currentUninitializedLayers = layers
    .filter((layer) => !layer?.IDList)
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

  const actionsToPut = [];
  allUninitializedLayers.map((layer) => {
    if (mapMode === 'VECTOR_ENDPOINT') {
      actionsToPut.push({
        type: FILTER_PREP_FOR_VECTOR_ENDPOINT,
        payload: { recordSetID: layer.recordSetID, tableFiltersHash: 'init' }
      });
    }
    if (layer.recordSetType === 'Activity') {
      actionsToPut.push({
        type: ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: { recordSetID: layer.recordSetID, tableFiltersHash: 'init' }
      });
    } else {
      actionsToPut.push({
        type: IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: { recordSetID: layer.recordSetID, tableFiltersHash: 'init' }
      });
    }
  });
  yield all(actionsToPut.map((action) => put(action)));
}

function* handle_REMOVE_CLIENT_BOUNDARY(action) {
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
    const actionObject = {
      type: RECORDSET_REMOVE_FILTER,
      payload: {
        filterID: filter?.id,
        filterType: 'tableFilter',
        setID: filteredSet.recordSetID
      }
    };
    return actionObject;
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

function* handle_DRAW_CUSTOM_LAYER(action) {
  const panelState = yield select((state) => state.AppMode.panelOpen);
  if (panelState) {
    yield put({ type: TOGGLE_PANEL });
  }
}

function* handle_CUSTOM_LAYER_DRAWN(actions) {
  const panelState = yield select((state) => state.AppMode.panelOpen);
  if (!panelState) {
    yield put({ type: TOGGLE_PANEL });
  }
}

function* handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS(action) {
  console.dir(action.payload);
}

function* handle_MAP_ON_SHAPE_CREATE(action) {
  const callback = (width: number) => {
    const newGeo = turf.buffer(action.payload.geometry, width / 10000);
    if (appModeUrl && /Activity/.test(appModeUrl) && !whatsHereToggle) {
      return [{ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [newGeo ? newGeo : action.payload] } }];
    }
  };
  const appModeUrl = yield select((state: any) => state.AppMode.url);
  const whatsHereToggle = yield select((state: any) => state.Map.whatsHere.toggle);
  if (action?.payload?.geometry?.type === 'LineString') {
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
  const { url } = yield select((state) => state.AppMode);
  const { drawingCustomLayer, whatsHere } = yield select((state) => state.Map);

  if (drawingCustomLayer) {
    yield put({ type: CUSTOM_LAYER_DRAWN, payload: action.payload });
  } else if (url && /Activity/.test(url) && !whatsHere.toggle) {
    yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [action.payload] } });
  }
}

function* handle_MAP_TOGGLE_GEOJSON_CACHE(action) {
  location.reload();
}

function* handle_WHATS_HERE_SERVER_FILTERED_IDS_FETCHED(action) {
  yield put(WhatsHere.iapp_rows_request());
  yield put(WhatsHere.activity_rows_request());
}

function* handle_RECORDSET_SET_SORT(action) {
  const userSettingsState = yield select(selectUserSettings);
  const recordSetType = userSettingsState.recordSets?.[action.payload.setID]?.recordSetType;
  const tableFiltersHash = userSettingsState.recordSets?.[action.payload.setID]?.tableFiltersHash;
  if (recordSetType === 'Activity') {
    yield put({
      type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
      payload: { recordSetID: action.payload.setID, limit: 20, page: 0, tableFiltersHash: tableFiltersHash }
    });
  } else {
    yield put({
      type: IAPP_TABLE_ROWS_GET_REQUEST,
      payload: { recordSetID: action.payload.setID, limit: 20, page: 0, tableFiltersHash: tableFiltersHash }
    });
  }
}

function* activitiesPageSaga() {
  //  yield fork(leafletWhosEditing);
  yield all([
    fork(whatsHereSaga),
    debounce(500, RECORDSET_UPDATE_FILTER, handle_UserFilterChange),
    takeEvery(RECORDSET_CLEAR_FILTERS, handle_UserFilterChange),
    takeEvery(RECORDSET_REMOVE_FILTER, handle_UserFilterChange),

    takeEvery(REMOVE_CLIENT_BOUNDARY, handle_REMOVE_CLIENT_BOUNDARY),

    takeEvery(RECORDSET_SET_SORT, handle_RECORDSET_SET_SORT),

    // handle hiding and showing the panel when drawing boundaries:
    takeEvery(DRAW_CUSTOM_LAYER, handle_DRAW_CUSTOM_LAYER),
    takeEvery(CUSTOM_LAYER_DRAWN, handle_CUSTOM_LAYER_DRAWN),

    takeEvery(REFETCH_SERVER_BOUNDARIES, refetchServerBoundaries),
    takeEvery(WhatsHere.server_filtered_ids_fetched, handle_WHATS_HERE_SERVER_FILTERED_IDS_FETCHED),

    takeEvery(UserSettings.RecordSet.add, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(REMOVE_SERVER_BOUNDARY, handle_REMOVE_SERVER_BOUNDARY),
    takeEvery(PAGE_OR_LIMIT_UPDATE, handle_PAGE_OR_LIMIT_UPDATE),
    takeEvery(MAP_TOGGLE_GEOJSON_CACHE, handle_MAP_TOGGLE_GEOJSON_CACHE),
    takeEvery(UserSettings.InitState.getSuccess, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(MAP_INIT_REQUEST, handle_MAP_INIT_REQUEST),
    takeEvery(MAP_INIT_FOR_RECORDSET, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(Activity.GeoJson.get, handle_ACTIVITIES_GEOJSON_GET_REQUEST),
    takeEvery(ACTIVITIES_GEOJSON_REFETCH_ONLINE, handle_ACTIVITIES_GEOJSON_REFETCH_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_REQUEST, handle_IAPP_GEOJSON_GET_REQUEST),
    takeEvery(FILTER_PREP_FOR_VECTOR_ENDPOINT, handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_REQUEST, handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_ONLINE, handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE),
    takeLatest(ACTIVITIES_TABLE_ROWS_GET_REQUEST, handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST),
    takeEvery(ACTIVITIES_TABLE_ROWS_GET_ONLINE, handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_TABLE_ROWS_GET_REQUEST, handle_IAPP_TABLE_ROWS_GET_REQUEST),
    takeEvery(IAPP_TABLE_ROWS_GET_ONLINE, handle_IAPP_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_ONLINE, handle_IAPP_GEOJSON_GET_ONLINE),
    takeEvery(ACTIVITIES_GEOJSON_GET_ONLINE, handle_ACTIVITIES_GEOJSON_GET_ONLINE),
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
    ...BASE_LAYER_HANDLERS
  ]);
}

export default activitiesPageSaga;
