import { Http } from '@capacitor-community/http';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { put, select } from 'redux-saga/effects';
import {
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITIES_TABLE_ROWS_GET_FAILURE,
  ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  IAPP_TABLE_ROWS_GET_FAILURE,
  IAPP_TABLE_ROWS_GET_SUCCESS
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectAuthHeaders } from 'state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';

const checkForErrors = (response: any, status?: any, url?: any) => {
  if (response.code > 201) {
  }
};

//
export function* handle_ACTIVITIES_GEOJSON_GET_ONLINE(action) {
  const networkReturn = yield InvasivesAPI_Call(
    'POST',
    `/api/activities-lean/`,
    action.payload.activitiesFilterCriteria
  );
  let featureCollection = {
    type: 'FeatureCollection',
    features: networkReturn.data.result.rows.map((row) => {
      return row.geojson ? row.geojson : row;
    })
  };

  yield put({
    type: ACTIVITIES_GEOJSON_GET_SUCCESS,
    payload: {
      recordSetID: action.payload.recordSetID,
      activitiesGeoJSON: featureCollection,
      layerState: action.payload.layerState
    }
  });
}

export function* handle_IAPP_GEOJSON_GET_ONLINE(action) {

  const networkReturn = yield Http.request({
    method: 'GET',
    url: 'https://nrs.objectstore.gov.bc.ca/seeds/iapp_geojson_gzip.gz'
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
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, { filterObjects: [action.payload.filterObj]});

  if (networkReturn.data.result) {
    yield put({
      type: ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result
      }
    });
  } else {
    put({
      type: ACTIVITIES_TABLE_ROWS_GET_FAILURE,
      payload: {
        recordSetID: action.payload.recordSetID,
        error: networkReturn.data
      }
    });
  }
}

export function* handle_IAPP_TABLE_ROWS_GET_ONLINE(action) {
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/IAPP/`, { filterObjects: [action.payload.filterObj]});

  if (networkReturn.data.result) {
    yield put({
      type: IAPP_TABLE_ROWS_GET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result
      }
    });
  } else {
    put({
      type: IAPP_TABLE_ROWS_GET_FAILURE,
      payload: {
        recordSetID: action.payload.recordSetID,
        error: networkReturn.data
      }
    });
  }
}

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE(action) {

  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, { filterObjects: [action.payload.filterObj]});
  //const networkReturn = yield InvasivesAPI_Call('GET', `/api/activities/`, action.payload.ActivityFilterCriteria);

  if (networkReturn.data.result || networkReturn.data?.data?.result) {
    const list = networkReturn.data?.data?.result ? networkReturn.data?.data?.result : networkReturn.data?.result;
    const IDList = list.map((row) => {
      return row.activity_id;
    });

    yield put({
      type: ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        IDList: IDList
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
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/IAPP/`, { filterObjects: [action.payload.filterObj]})

  if (networkReturn.data.result || networkReturn.data?.data?.result) {
    const list = networkReturn.data?.data?.result ? networkReturn.data?.data?.result : networkReturn.data?.result;
    const IDList = list?.map((row) => {
      return row.site_id;
    });

    yield put({
      type: IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        IDList: IDList
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

export function* handle_MAP_WHATS_HERE_GET_POI_ONLINE(action) {
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/points-of-interest/`, action.payload.IAPPFilterCriteria);

  if (networkReturn.data.result.rows) {
    const IDList = networkReturn.data.result.rows.map((row) => {
      return row.site_id;
    });

    yield put({
      type: IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
      payload: {
        recordSetID: action.payload.recordSetID,
        IDList: IDList
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
