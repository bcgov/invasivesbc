import { put, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getIappRowsFromCache, getRowsFromCachedRecordset } from './dataAccess';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import IappActions, { IappTableRowGetRequest } from 'state/actions/activity/Iapp';
import Activity, { ActivityTableRowGetRequest } from 'state/actions/activity/Activity';
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
