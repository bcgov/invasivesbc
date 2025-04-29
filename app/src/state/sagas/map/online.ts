import { put, select } from 'redux-saga/effects';
import moment from 'moment';
import { PayloadAction } from '@reduxjs/toolkit';
import { getIappRowsFromCache, getIdsForRecordsetFromCache, getRowsFromCachedRecordset } from './dataAccess';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { EXPORT_CONFIG_LOAD_ERROR, EXPORT_CONFIG_LOAD_REQUEST, EXPORT_CONFIG_LOAD_SUCCESS } from 'state/actions';
import { selectRootConfiguration } from 'state/reducers/configuration';
import IappActions, { IappTableRowGetRequest } from 'state/actions/activity/Iapp';
import Activity, { ActivityTableRowGetRequest, IGetIdsForRecordsetOnline } from 'state/actions/activity/Activity';
import UserRecord from 'interfaces/UserRecord';
import { MOBILE } from 'state/build-time-config';

function* refreshExportConfigIfRequired() {
  const config = yield select(selectRootConfiguration);

  if (config.exportConfig && config.exportConfigFreshUntil && moment(config.exportConfigFreshUntil).isAfter()) {
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

export function* handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE(action: PayloadAction<ActivityTableRowGetRequest>) {
  let mapState = yield select((state) => state.Map);

  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
    filterObjects: [action.payload.filterObj]
  });

  mapState = yield select((state) => state.Map);
  const tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;
  if (tableFiltersHash !== action.payload.tableFiltersHash) {
    return;
  }

  if (networkReturn?.ok && networkReturn.data.result) {
    yield put(
      Activity.getRowsSuccess({
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      })
    );
  } else if (MOBILE) {
    // API Request Failed, see if we can rows from a cache
    yield getRowsFromCachedRecordset(action.payload);
  }
}

export function* handle_IAPP_TABLE_ROWS_GET_ONLINE(action: PayloadAction<IappTableRowGetRequest>) {
  let mapState = yield select((state) => state.Map);

  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/IAPP/`, { filterObjects: [action.payload.filterObj] });
  mapState = yield select((state) => state.Map);

  const tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;

  if (tableFiltersHash !== action.payload.tableFiltersHash) return;

  if (networkReturn?.ok && networkReturn?.data?.result) {
    yield put(
      IappActions.getRowsSuccess({
        recordSetID: action.payload.recordSetID,
        rows: networkReturn.data.result,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      })
    );
  } else if (MOBILE) {
    yield getIappRowsFromCache(action.payload);
  } else {
    yield put(
      IappActions.getRowsFailure({
        recordSetID: action.payload.recordSetID,
        error: networkReturn?.data,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      })
    );
  }
}

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE(action: PayloadAction<IGetIdsForRecordsetOnline>) {
  const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
    filterObjects: [action.payload.filterObj]
  });
  const mapState = yield select((state) => state.Map);
  const tableFiltersHash = mapState?.layers?.filter((layer) => {
    return layer?.recordSetID === action.payload.recordSetID;
  })?.[0]?.tableFiltersHash;

  if (tableFiltersHash !== action.payload.tableFiltersHash) return;

  if (networkReturn?.ok && (networkReturn?.data?.result || networkReturn.data?.data?.result)) {
    const list = networkReturn.data?.data?.result ?? networkReturn.data?.result;
    const IDList = list.map((row: UserRecord) => row.activity_id);

    // check again after the network call
    const mapState = yield select((state) => state.Map);
    const tableFiltersHash = mapState?.layers?.filter((layer) => layer?.recordSetID === action.payload.recordSetID)?.[0]
      ?.tableFiltersHash;

    if (tableFiltersHash !== action.payload.tableFiltersHash) return;

    yield put(
      Activity.getIdsForRecordsetSuccess({
        recordSetID: action.payload.recordSetID,
        IDList: IDList,
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
  } else if (MOBILE) {
    yield getIdsForRecordsetFromCache(action.payload);
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

  if (networkReturn?.ok && (networkReturn.data.result || networkReturn.data?.data?.result)) {
    const list = networkReturn.data?.data?.result ? networkReturn.data?.data?.result : networkReturn.data?.result;
    const IDList = list?.map((row) => row.site_id);
    // check again after the network call
    const mapState = yield select((state) => state.Map);
    const tableFiltersHash = mapState?.layers?.filter((layer) => {
      return layer?.recordSetID === action.payload.recordSetID;
    })?.[0]?.tableFiltersHash;

    if (!tableFiltersHash === action.payload.tableFiltersHash) {
      return;
    }

    yield put(
      IappActions.getIdsForRecordsetSuccess({
        recordSetID: action.payload.recordSetID,
        IDList: IDList,
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
  } else if (MOBILE) {
    yield getIdsForRecordsetFromCache(action.payload);
  }
}
