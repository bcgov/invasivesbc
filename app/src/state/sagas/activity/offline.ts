import { delay, put, select, takeEvery, takeLeading } from 'redux-saga/effects';
import { ActivityStatus } from 'sharedAPI';
import {
  ACTIVITY_CREATE_LOCAL,
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_GET_FAILURE,
  ACTIVITY_GET_LOCALDB_REQUEST,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_RUN_OFFLINE_SYNC,
  ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE,
  ACTIVITY_SAVE_OFFLINE,
  ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
  ACTIVITY_UPDATE_SYNC_STATE,
  NETWORK_GO_ONLINE
} from 'state/actions';
import { OfflineActivityRecord, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { selectNetworkConnected } from 'state/reducers/network';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';

export function* trigger_NETWORK_ONLINE() {
  const connected = yield select(selectNetworkConnected);
  if (connected) {
    yield delay(100);
    yield put(ACTIVITY_RUN_OFFLINE_SYNC());
  }
}

export function* handle_ACTIVITY_SAVE_OFFLINE() {
  // all logic handled in the reducer
  yield put(
    ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS({
      notification: {
        visible: true,
        message: 'Saved locally',
        severity: 'info'
      }
    })
  );
  const connected = yield select(selectNetworkConnected);
  if (connected) {
    yield delay(100);
    yield put(ACTIVITY_RUN_OFFLINE_SYNC());
  }
}

export function* handle_ACTIVITY_CREATE_LOCAL(action) {
  yield put(ACTIVITY_CREATE_SUCCESS({ activity_id: action.payload.data.activity_id }));
}

export function* handle_ACTIVITY_GET_LOCAL_REQUEST(action) {
  if (!ACTIVITY_GET_LOCALDB_REQUEST.match(action)) {
    return;
  }

  const connected = yield select(selectNetworkConnected);
  const { serializedActivities } = yield select(selectOfflineActivity);
  const activityID = action.payload;

  const found = serializedActivities[activityID];

  if (found) {
    yield put(ACTIVITY_GET_SUCCESS({ activity: JSON.parse(found.data) }));
    return;
  } else {
    // not locally, maybe we can get it from the server if we're online

    if (connected) {
      try {
        const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload}`);

        if (!(networkReturn.status === 200)) {
          yield put(ACTIVITY_GET_FAILURE({ reason: JSON.stringify(networkReturn) }));
          return;
        }

        const datav2 = {
          ...networkReturn.data,
          species_positive: networkReturn.data.species_positive || [],
          species_negative: networkReturn.data.species_negative || [],
          species_treated: networkReturn.data.species_treated || [],
          media: networkReturn.data.media || [],
          media_delete_keys: networkReturn.data.media_delete_keys || []
        };

        yield put(ACTIVITY_GET_SUCCESS({ activity: datav2 }));
        return;
      } catch (e) {
        yield put(ACTIVITY_GET_FAILURE({ reason: 'unknown' }));
        return;
      }
    } else {
      yield put(ACTIVITY_GET_FAILURE({ reason: 'unknown' }));
      return;
    }
  }
}

export function* handle_ACTIVITY_RUN_OFFLINE_SYNC() {
  const { serializedActivities } = yield select(selectOfflineActivity);
  const toSync: OfflineActivityRecord[] = Object.values(serializedActivities).filter((s) => {
    if (typeof s === 'object' && s !== null) {
      return Object.hasOwn(s, 'sync_state') && (s as OfflineActivityRecord).sync_state !== 'SYNCHRONIZED';
    }
    return false;
  }) as OfflineActivityRecord[];

  for (const activity of toSync) {
    const hydrated = JSON.parse(activity.data);

    try {
      const networkReturn = yield InvasivesAPI_Call('PUT', `/api/activity/`, {
        ...hydrated,
        form_status: ActivityStatus.DRAFT
      });
      if (networkReturn.status >= 200 && networkReturn.status < 300) {
        yield put(
          ACTIVITY_UPDATE_SYNC_STATE({
            id: hydrated.activity_id,
            sync_state: 'SYNCHRONIZED'
          })
        );
      } else {
        yield put(
          ACTIVITY_UPDATE_SYNC_STATE({
            id: hydrated.activity_id,
            sync_state: 'ERROR'
          })
        );
      }
    } catch (e) {
      yield put(
        ACTIVITY_UPDATE_SYNC_STATE({
          id: hydrated.activity_id,
          sync_state: 'ERROR'
        })
      );
    }
  }

  yield put(ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE());
}

export function* handle_ACTIVITY_RESTORE_OFFLINE() {}

export const OFFLINE_ACTIVITY_SAGA_HANDLERS = [
  takeEvery(ACTIVITY_GET_LOCALDB_REQUEST.type, handle_ACTIVITY_GET_LOCAL_REQUEST),
  takeEvery(ACTIVITY_SAVE_OFFLINE.type, handle_ACTIVITY_SAVE_OFFLINE),
  takeEvery(ACTIVITY_CREATE_LOCAL.type, handle_ACTIVITY_CREATE_LOCAL),
  takeLeading(ACTIVITY_RUN_OFFLINE_SYNC, handle_ACTIVITY_RUN_OFFLINE_SYNC),
  takeLeading(NETWORK_GO_ONLINE, trigger_NETWORK_ONLINE)
];
