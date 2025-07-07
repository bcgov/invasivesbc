import { put, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getIappRowsFromCache, getIdsForRecordsetFromCache, getRowsFromCachedRecordset } from './dataAccess';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import IappActions, { IappTableRowGetRequest } from 'state/actions/activity/Iapp';
import Activity, { ActivityTableRowGetRequest, IGetIdsForRecordsetOnline } from 'state/actions/activity/Activity';
import UserRecord from 'interfaces/UserRecord';
import { buildTimeConfig } from 'state/configuration/build-time-config';

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
  } else if (buildTimeConfig.MOBILE) {
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
  } else if (buildTimeConfig.MOBILE) {
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
    const idList = list.map((row: UserRecord) => row.activity_id);

    // check again after the network call
    const mapState = yield select((state) => state.Map);
    const tableFiltersHash = mapState?.layers?.filter((layer) => layer?.recordSetID === action.payload.recordSetID)?.[0]
      ?.tableFiltersHash;

    if (tableFiltersHash !== action.payload.tableFiltersHash) return;

    yield put(
      Activity.getIdsForRecordsetSuccess({
        recordSetID: action.payload.recordSetID,
        idList: idList,
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
  } else if (buildTimeConfig.MOBILE) {
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
    const idList = list?.map((row) => row.site_id);
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
        idList: idList,
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
  } else if (buildTimeConfig.MOBILE) {
    yield getIdsForRecordsetFromCache(action.payload);
  }
}
