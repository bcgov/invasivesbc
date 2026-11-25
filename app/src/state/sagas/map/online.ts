import { put, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getIappRowsFromCache, getRowsFromCachedRecordset } from './dataAccess';
import IappActions, { IappTableRowGetRequest } from 'state/actions/activity/Iapp';
import Activity, { ActivityTableRowGetRequest } from 'state/actions/activity/Activity';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import { selectConfiguration } from 'state/reducers/configuration';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import Alerts from 'state/actions/alerts/Alerts';
import networkAlertMessages from 'constants/alerts/networkAlerts';

export function* handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE(action: PayloadAction<ActivityTableRowGetRequest>) {
  const mapState = yield select((state) => state.Map);
  const { API_V2_BASE, MOBILE } = yield select(selectConfiguration);
  const body = JSON.stringify({ filterObjects: [action.payload.filterObj] });

  try {
    const response = yield fetch(`${API_V2_BASE}/ninja/recordset/rows`, {
      method: 'POST',
      headers: { Authorization: yield getCurrentJWT(), 'Content-Type': 'application/json' },
      body
    });

    const tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;
    if (tableFiltersHash !== action.payload.tableFiltersHash) {
      return;
    }

    if (response?.ok) {
      const result = yield response.json();
      yield put(
        Activity.getRowsSuccess({
          recordSetID: action.payload.recordSetID,
          rows: result.entries,
          totalRecords: result.total,
          tableFiltersHash: action.payload.tableFiltersHash,
          page: action.payload.page,
          limit: action.payload.limit
        })
      );
      return;
    }
  } catch (e) {
    console.error(e);
  }
  if (MOBILE) {
    // API Request Failed, see if we can rows from a cache
    yield getRowsFromCachedRecordset(action.payload);
    return;
  }
  yield put(Alerts.create(networkAlertMessages.fetchFailed));
}

export function* handle_IAPP_TABLE_ROWS_GET_ONLINE(action: PayloadAction<IappTableRowGetRequest>) {
  const mapState = yield select((state) => state.Map);
  const API_V2_BASE = yield select((state) => state.Configuration.current.runtime.API_V2_BASE);
  const networkReturn = yield fetch(`${API_V2_BASE}/ninja/iapp/rows`, {
    method: 'POST',
    headers: { Authorization: yield getCurrentJWT() },
    body: JSON.stringify({})
  });

  const tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;

  if (tableFiltersHash !== action.payload.tableFiltersHash) return;
  if (networkReturn?.ok) {
    const data = yield networkReturn.json();
    yield put(
      IappActions.getRowsSuccess({
        recordSetID: action.payload.recordSetID,
        rows: data.entries,
        totalCount: data.count,
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
