import { put, select } from 'redux-saga/effects';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import Activity from 'state/actions/activity/Activity';
import { getRecordFilterObjectFromStateForAPI } from './dataAccess';

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE(action) {
  try {
    const { serializedActivities } = yield select(selectOfflineActivity);

    const IDList =
      Object.values(serializedActivities).filter(
        (value) => (value as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED
      ) ?? [];
    yield put(
      Activity.Offline.getIdsForRecordsetSuccess({
        recordSetID: action.payload.recordSetID,
        IDList: IDList,
        tableFiltersHash: action.payload.tableFiltersHash
      })
    );
  } catch (e) {
    console.error(e);
  }
}

export function* handle_ACTIVITIES_TABLE_ROWS_GET_OFFLINE(action) {
  const { serializedActivities } = yield select(selectOfflineActivity);
  let mapState = yield select((state) => state.Map);
  let tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;

  let unsyncedOfflineActivities = Object.fromEntries(
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

  if (tableFiltersHash !== action.payload.tableFiltersHash) {
    return;
  }
  const currentState = yield select((state) => state.UserSettings);
  const clientBoundaries = yield select((state) => state.Map?.clientBoundaries);
  const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState, clientBoundaries);

  filterObject.limit = 200000;
  filterObject.selectColumns = ['activity_id'];

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
