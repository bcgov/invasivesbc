import { call, put, select } from 'redux-saga/effects';
import moment from 'moment';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import {
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GEOJSON_REFETCH_ONLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITIES_TABLE_ROWS_GET_FAILURE,
  ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
  EXPORT_CONFIG_LOAD_ERROR,
  EXPORT_CONFIG_LOAD_REQUEST,
  EXPORT_CONFIG_LOAD_SUCCESS,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  IAPP_TABLE_ROWS_GET_FAILURE,
  IAPP_TABLE_ROWS_GET_SUCCESS
} from 'state/actions';
import { selectConfiguration, selectRootConfiguration } from 'state/reducers/configuration';

function* refreshExportConfigIfRequired() {
  const config = yield select(selectRootConfiguration);

  if (config.exportConfig && config.exportConfigFreshUntil && moment(config.exportConfigFreshUntil).isAfter()) {
    // config is current
    return;
  }
  yield put(EXPORT_CONFIG_LOAD_REQUEST());

  try {
    const r = yield InvasivesAPI_Call('GET', `/api/export-config`);

    yield put(EXPORT_CONFIG_LOAD_SUCCESS(r.data?.result));
  } catch (e) {
    console.error(e);
    yield put(EXPORT_CONFIG_LOAD_ERROR());
  }
}

function* fetchS3GeoJSON() {
  yield refreshExportConfigIfRequired();
  const config = yield select(selectRootConfiguration);

  let activitiesExportURL;

  if (config.exportConfig && config.exportConfig.length > 0) {
    const matchingExportConfig = config.exportConfig.find((e) => e.type === 'activities');
    activitiesExportURL = matchingExportConfig.url;
  }

  const networkReturnS3 = yield fetch(activitiesExportURL, {
    headers: {
      'Accept-Encoding': 'gzip'
    }
  });

  return yield networkReturnS3.json();
}

function* fetchSupplementalGeoJSON(activitiesFilterCriteria) {
  const apiNetworkReturn = yield InvasivesAPI_Call('POST', `/api/activities-lean/`, {
    ...activitiesFilterCriteria
  });

  //
  const api_geojson = apiNetworkReturn.data.result.rows.map((row) => {
    return row.geojson ? row.geojson : row;
  });

  return api_geojson.reduce((a, v) => ({ ...a, [v.properties.id]: v }), {});
}

//
export function* handle_ACTIVITIES_GEOJSON_REFETCH_ONLINE(action) {
  const supplemental = yield call(fetchSupplementalGeoJSON, action.payload.activitiesFilterCriteria);
  const draft = yield call(fetchSupplementalGeoJSON, { form_status: ['Draft'], page: 0, limit: 100000 });

  yield put(
    ACTIVITIES_GEOJSON_GET_SUCCESS({
      recordSetID: action.payload.recordSetID,
      activitiesGeoJSONDict: {
        supplemental,
        draft
      },
      layerState: action.payload.layerState
    })
  );
}

//
export function* handle_ACTIVITIES_GEOJSON_GET_ONLINE(action) {
  const s3 = yield call(fetchS3GeoJSON);

  yield put(
    ACTIVITIES_GEOJSON_GET_SUCCESS({
      recordSetID: action.payload.recordSetID,
      activitiesGeoJSONDict: {
        s3
      },
      layerState: action.payload.layerState
    })
  );

  yield put(ACTIVITIES_GEOJSON_REFETCH_ONLINE(action.payload));
}

export function* handle_IAPP_GEOJSON_GET_ONLINE() {
  const configuration = yield select(selectConfiguration);

  const networkReturn = yield fetch(configuration.IAPP_GEOJSON_URL);

  const data = yield networkReturn.json();

  const rows = data?.result || [];
  const featureCollection = {
    type: 'FeatureCollection',
    features: rows?.filter((row) => {
      if (row !== undefined && row?.geometry?.coordinates) {
        return row;
      }
    })
  };

  yield put(
    IAPP_GEOJSON_GET_SUCCESS({
      //   recordSetID: action.payload.recordSetID,
      IAPPGeoJSON: featureCollection
      //   layerState: action.payload.layerState
    })
  );
}

export function* handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE(action) {
  let mapState = yield select((state) => state.Map);
  let tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;

  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
    filterObjects: [action.payload.filterObj]
  });

  mapState = yield select((state) => state.Map);
  tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;
  if (tableFiltersHash !== action.payload.tableFiltersHash) {
    return;
  }

  if (networkReturn.data.result) {
    yield put(
      ACTIVITIES_TABLE_ROWS_GET_SUCCESS({
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      })
    );
  } else {
    put(
      ACTIVITIES_TABLE_ROWS_GET_FAILURE({
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result,
        page: action.payload.page,
        limit: action.payload.limit,
        error: networkReturn.data
      })
    );
  }
}

export function* handle_IAPP_TABLE_ROWS_GET_ONLINE(action) {
  let mapState = yield select((state) => state.Map);
  let tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;

  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/IAPP/`, { filterObjects: [action.payload.filterObj] });
  
  mapState = yield select((state) => state.Map);
  tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;
  if (tableFiltersHash !== action.payload.tableFiltersHash) {
    return;
  }

  if (networkReturn.data.result) {
    yield put(
      IAPP_TABLE_ROWS_GET_SUCCESS({
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      })
    );
  } else {
    put(
      IAPP_TABLE_ROWS_GET_FAILURE({
        recordSetID: action.payload.recordSetID,
        error: networkReturn.data,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      })
    );
  }
}

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE(action) {
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
    filterObjects: [action.payload.filterObj]
  });
  //const networkReturn = yield InvasivesAPI_Call('GET', `/api/activities/`, action.payload.ActivityFilterCriteria);

  const mapState = yield select((state) => state.Map);
  const tableFiltersHash = mapState?.layers?.filter((layer) => {
    return layer?.recordSetID === action.payload.recordSetID;
  })?.[0]?.tableFiltersHash;

  if (!tableFiltersHash === action.payload.tableFiltersHash) {
    return;
  }

  if (networkReturn.data.result || networkReturn.data?.data?.result) {
    const list = networkReturn.data?.data?.result ? networkReturn.data?.data?.result : networkReturn.data?.result;
    const IDList = list.map((row) => {
      return row.activity_id;
    });

    // check again after the network call
    const mapState = yield select((state) => state.Map);
    const tableFiltersHash = mapState?.layers?.filter((layer) => {
      return layer?.recordSetID === action.payload.recordSetID;
    })?.[0]?.tableFiltersHash;

    if (!tableFiltersHash === action.payload.tableFiltersHash) {
      return;
    }

    yield put(
      ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS({
        recordSetID: action.payload.recordSetID,
        IDList: IDList,
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
  }
}

export function* handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE(action) {
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/IAPP/`, { filterObjects: [action.payload.filterObj] });
  const mapState = yield select((state) => state.Map);
  const tableFiltersHash = mapState?.layers?.filter((layer) => {
    return layer?.recordSetID === action.payload.recordSetID;
  })?.[0]?.tableFiltersHash;

  if (!tableFiltersHash === action.payload.tableFiltersHash) {
    return;
  }

  if (networkReturn.data.result || networkReturn.data?.data?.result) {
    const list = networkReturn.data?.data?.result ? networkReturn.data?.data?.result : networkReturn.data?.result;
    const IDList = list?.map((row) => {
      return row.site_id;
    });
    // check again after the network call
    const mapState = yield select((state) => state.Map);
    const tableFiltersHash = mapState?.layers?.filter((layer) => {
      return layer?.recordSetID === action.payload.recordSetID;
    })?.[0]?.tableFiltersHash;

    if (!tableFiltersHash === action.payload.tableFiltersHash) {
      return;
    }

    yield put(
      IAPP_GET_IDS_FOR_RECORDSET_SUCCESS({
        recordSetID: action.payload.recordSetID,
        IDList: IDList,
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
  }
}
