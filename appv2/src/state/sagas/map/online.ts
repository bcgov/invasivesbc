import { Http } from '@capacitor-community/http';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { call, put, select } from 'redux-saga/effects';
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
import { selectConfiguration } from 'state/reducers/configuration';
import { InvasivesAPI_Call } from '../../../hooks/useInvasivesApi';
import { selectRootConfiguration } from '../../reducers/configuration';

const checkForErrors = (response: any, status?: any, url?: any) => {
  if (response.code > 201) {
  }
};

function* refreshExportConfigIfRequired(action) {
  const config = yield select(selectRootConfiguration);

  if (config.exportConfig && config.exportConfigFreshUntil && config.exportConfigFreshUntil.isAfter()) {
    // config is current
    return;
  }
  yield put({ type: EXPORT_CONFIG_LOAD_REQUEST });

  try {
    const r = yield InvasivesAPI_Call('GET', `/api/export-config`);

    yield put({ type: EXPORT_CONFIG_LOAD_SUCCESS, payload: r.data?.result });
  } catch (e) {
    console.error(e);
    yield put({ type: EXPORT_CONFIG_LOAD_ERROR });
  }
}

function* fetchS3GeoJSON() {
  yield call(refreshExportConfigIfRequired);
  const config = yield select(selectRootConfiguration);

  let activitiesExportURL;

  if (config.exportConfig && config.exportConfig.length > 0) {
    let matchingExportConfig = config.exportConfig.find((e) => e.type === 'activities');
    activitiesExportURL = matchingExportConfig.url;
  }

  const networkReturnS3 = yield Http.request({
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip'
    },
    url: activitiesExportURL
  });
  // map the id from the dict into the feature properties to keep the map happy
  // const s3_geojson = Object.entries(networkReturnS3.data).map((entry) => {
  //   const [key, value] = entry;
  //   value.properties.id = key;
  //   return value;
  // });

  return networkReturnS3.data;
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

  yield put({
    type: ACTIVITIES_GEOJSON_GET_SUCCESS,
    payload: {
      recordSetID: action.payload.recordSetID,
      activitiesGeoJSONDict: {
        supplemental,
        draft
      },
      layerState: action.payload.layerState
    }
  });
}

//
export function* handle_ACTIVITIES_GEOJSON_GET_ONLINE(action) {
  const s3 = yield call(fetchS3GeoJSON);

  yield put({
    type: ACTIVITIES_GEOJSON_GET_SUCCESS,
    payload: {
      recordSetID: action.payload.recordSetID,
      activitiesGeoJSONDict: {
        s3
      },
      layerState: action.payload.layerState
    }
  });

  yield put({ type: ACTIVITIES_GEOJSON_REFETCH_ONLINE, payload: action.payload });
}

export function* handle_IAPP_GEOJSON_GET_ONLINE(action) {
  const configuration = yield select(selectConfiguration);

  const networkReturn = yield Http.request({
    method: 'GET',
    url: configuration.IAPP_GEOJSON_URL
  });

  const rows = networkReturn?.data?.result || [];
  let featureCollection = {
    type: 'FeatureCollection',
    features: rows?.filter((row) => {
      if (row !== undefined && row?.geometry?.coordinates) {
        return row;
      }
    })
  };

  yield put({
    type: IAPP_GEOJSON_GET_SUCCESS,
    payload: {
      //   recordSetID: action.payload.recordSetID,
      IAPPGeoJSON: featureCollection
      //   layerState: action.payload.layerState
    }
  });
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
    yield put({
      type: ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      }
    });
  } else {
    put({
      type: ACTIVITIES_TABLE_ROWS_GET_FAILURE,
      payload: {
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result,
        page: action.payload.page,
        limit: action.payload.limit,
        error: networkReturn.data
      }
    });
  }
}

export function* handle_IAPP_TABLE_ROWS_GET_ONLINE(action) {
  let mapState = yield select((state) => state.Map);
  let tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;

  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/IAPP/`, { filterObjects: [action.payload.filterObj] });
  mapState = yield select((state) => state.Map);

  mapState = yield select((state) => state.Map);
  tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;
  if (tableFiltersHash !== action.payload.tableFiltersHash) {
    return;
  }

  if (networkReturn.data.result) {
    yield put({
      type: IAPP_TABLE_ROWS_GET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      }
    });
  } else {
    put({
      type: IAPP_TABLE_ROWS_GET_FAILURE,
      payload: {
        recordSetID: action.payload.recordSetID,
        error: networkReturn.data,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      }
    });
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

    yield put({
      type: ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        IDList: IDList,
        tableFiltersHash: action.payload.tableFiltersHash
      }
    });
  } else {
    /*  put({
      type: IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
      payload: {
        recordSetID: action.payload.recordSetID,
        error: networkReturn.data
      }
    });
    */
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

    yield put({
      type: IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        IDList: IDList,
        tableFiltersHash: action.payload.tableFiltersHash
      }
    });
  } else {
    /*  put({
      type: IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
      payload: {
        recordSetID: action.payload.recordSetID,
        error: networkReturn.data
      }
    });
    */
  }
}
