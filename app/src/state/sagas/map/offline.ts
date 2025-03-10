import { put, select } from 'redux-saga/effects';
import { ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE_SUCCESS } from 'state/actions';
import { OfflineActivityRecord, selectOfflineActivity } from 'state/reducers/offlineActivity';
import Activity from 'state/actions/activity/Activity';
export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE(action) {
  console.log('Map Toggle 22', action.payload);
  const { serializedActivities } = yield select(selectOfflineActivity);

  const IDList = Object.values(serializedActivities).filter((value) => value.sync_state !== 'Synchronized');
  // const IDList = Object.keys(serializedActivities);
  console.log('Map Toggle 24', Object.entries(serializedActivities).length); // filter out synchronized
  // const IDList = list.map((row: UserRecord) => row.activity_id);
  yield put({
    type: ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE_SUCCESS,
    payload: {
      recordSetID: action.payload.recordSetID,
      IDList: IDList,
      tableFiltersHash: action.payload.tableFiltersHash
    }
  });
}

export function* handle_ACTIVITIES_TABLE_ROWS_GET_OFFLINE(action) {
  console.log('Map Toggle 29', action.payload);
  const { serializedActivities } = yield select(selectOfflineActivity);
  let mapState = yield select((state) => state.Map);
  let tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;

  const parsedObj = Object.fromEntries(
    Object.entries(serializedActivities).map(([key, value]) => {
      const typedValue = value as OfflineActivityRecord;
      return [key, { ...typedValue, data: JSON.parse(typedValue.data) }];
    })
  );
  const dataArray = Object.values(parsedObj).map((value) => value.data);
  // const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
  //   filterObjects: [action.payload.filterObj]
  // });

  mapState = yield select((state) => state.Map);
  tableFiltersHash = mapState?.recordTables[action.payload.recordSetID]?.tableFiltersHash;
  if (tableFiltersHash !== action.payload.tableFiltersHash) {
    return;
  }

  console.log('Map Toggle 26.1', dataArray);

  // if (networkReturn?.ok && networkReturn.data.result) {
  //   console.log('Map Toggle 26.1', {
  //     recordSetID: action.payload.recordSetID,
  //     rows: networkReturn.data.result,
  //     tableFiltersHash: action.payload.tableFiltersHash,
  //     page: action.payload.page,
  //     limit: action.payload.limit
  //   });

  yield put(
    Activity.getRowsSuccess({
      recordSetID: action.payload.recordSetID,
      rows: dataArray,
      tableFiltersHash: action.payload.tableFiltersHash,
      page: action.payload.page,
      limit: action.payload.limit
    })
  );
  // }
}
