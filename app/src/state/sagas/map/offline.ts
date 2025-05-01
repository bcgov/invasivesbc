import { put, select } from 'redux-saga/effects';
import { getRecordFilterObjectFromStateForAPI } from './dataAccess';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import Activity from 'state/actions/activity/Activity';

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE(action) {
  try {
    const { serializedActivities } = yield select(selectOfflineActivity);

    const idList =
      Object.values(serializedActivities).filter(
        (value) => (value as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED
      ) ?? [];
    yield put(
      Activity.Offline.getIdsForRecordsetSuccess({
        recordSetID: action.payload.recordSetID,
        idList: idList.map((id) => (id as any).short_id),
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
  } catch (e) {
    console.error(e);
  }
}

export function* handle_ACTIVITIES_TABLE_ROWS_GET_OFFLINE(action) {
  const { serializedActivities } = yield select(selectOfflineActivity);
  const mapState = yield select((state) => state.Map);
  const currentState = yield select((state) => state.UserSettings);
  const clientBoundaries = yield select((state) => state.Map?.clientBoundaries);
  const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState, clientBoundaries);

  const tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;
  if (tableFiltersHash !== action.payload.tableFiltersHash) {
    return;
  }

  filterObject.limit = 200000;
  filterObject.selectColumns = ['activity_id'];

  const unsyncedOfflineActivities = Object.fromEntries(
    Object.entries(serializedActivities)
      .filter(([_, value]) => (value as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED)
      .map(([key, value]) => {
        const typedValue = value as OfflineActivityRecord;
        return [key, { ...typedValue, data: JSON.parse(typedValue.data) }];
      })
  );
  let dataArray = Object.values(unsyncedOfflineActivities)
    .map((value) => value.data)
    .flat();

  const startIndex = action.payload.page * action.payload.limit;
  const endIndex = startIndex + action.payload.limit;
  dataArray = dataArray.slice(startIndex, endIndex);

  try {
    yield put(
      Activity.Offline.getIdsForRecordset({
        filterObj: filterObject,
        recordSetID: action.payload.recordSetID,
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
    yield put(
      Activity.getRowsSuccess({
        recordSetID: action.payload.recordSetID,
        rows: dataArray,
        tableFiltersHash: action.payload.tableFiltersHash,
        page: action.payload.page,
        limit: action.payload.limit
      })
    );
  } catch (e) {
    console.error(e);
  }
}
