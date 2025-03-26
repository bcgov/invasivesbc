import { delay, put, select, takeEvery, takeLeading } from 'redux-saga/effects';
import { ActivityStatus, ActivitySyncStatus } from 'sharedAPI';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  ACTIVITY_OFFLINE_DELETE_ITEM,
  ACTIVITY_RUN_OFFLINE_SYNC,
  ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE,
  ACTIVITY_SAVE_OFFLINE,
  ACTIVITY_UPDATE_SYNC_STATE
} from 'state/actions';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { selectNetworkConnected } from 'state/reducers/network';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';
import Activity, { ICreateLocal } from 'state/actions/activity/Activity';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { RecordSetId } from 'interfaces/UserRecordSet';

export function* handle_ACTIVITY_SAVE_OFFLINE(action) {
  yield put(
    Alerts.create({
      content: 'Saved locally',
      severity: AlertSeverity.Info,
      subject: AlertSubjects.Form
    })
  );
  // reload the activity in case the reducer modified it (create time, etc.)
  yield put(Activity.get(action.payload.id));

  // trigger a sync if we're online
  const connected = yield select(selectNetworkConnected);

  if (connected) {
    yield delay(500);
    yield put({ type: ACTIVITY_RUN_OFFLINE_SYNC });
  }
}

export function* handle_ACTIVITY_CREATE_LOCAL(action: PayloadAction<ICreateLocal>) {
  yield put(Activity.createSuccess(action.payload.data.activity_id));
}

export function* handle_ACTIVITY_GET_LOCAL_REQUEST(action: PayloadAction<string>) {
  const connected = yield select(selectNetworkConnected);
  const { serializedActivities } = yield select(selectOfflineActivity);
  const activityID = action.payload;

  const found = serializedActivities[activityID];

  if (found) {
    yield put(Activity.getSuccess(JSON.parse(found.data)));
  } else if (connected) {
    // not locally, maybe we can get it from the server if we're online
    try {
      const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload}`);

      if (networkReturn.status !== 200) {
        yield put(Activity.getFailure(networkReturn));
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
      yield put(Activity.getSuccess(datav2));
      return;
    } catch (e) {
      yield put(Activity.getFailure());
      return;
    }
  } else {
    try {
      const service = yield RecordCacheServiceFactory.getPlatformInstance();
      const result = yield service.loadActivity(activityID);

      const datav2 = {
        ...result,
        species_positive: result.species_positive || [],
        species_negative: result.species_negative || [],
        species_treated: result.species_treated || [],
        media: result.media || [],
        media_delete_keys: result.media_delete_keys || []
      };

      yield put(Activity.getSuccess(datav2));
    } catch (e) {
      console.error(e);
      yield put(Activity.getFailure());
    }
    return;
  }
}

export function* handle_ACTIVITY_RUN_OFFLINE_SYNC() {
  const { serializedActivities } = yield select(selectOfflineActivity);

  const toSync: OfflineActivityRecord[] = Object.values(serializedActivities).filter(
    (s) =>
      typeof s === 'object' &&
      s !== null &&
      Object.hasOwn(s, 'sync_state') &&
      (s as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED
  ) as OfflineActivityRecord[];

  for (const activity of toSync) {
    const hydrated = JSON.parse(activity.data);

    try {
      const networkReturn =
        hydrated.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL_PRIVATE
          ? yield InvasivesAPI_Call('PUT', `/api/activity/`, {
              ...hydrated,
              form_status: ActivityStatus.DRAFT
            })
          : yield InvasivesAPI_Call('POST', `/api/activity/`, {
              ...hydrated,
              form_status: ActivityStatus.DRAFT,
              sync_status: ActivitySyncStatus.SAVE_SUCCESSFUL_PRIVATE // saved to db but only visible to user
            });
      if (networkReturn.status >= 200 && networkReturn.status < 300) {
        yield put({
          type: ACTIVITY_UPDATE_SYNC_STATE,
          payload: {
            id: hydrated.activity_id,
            data: { ...hydrated, sync_status: ActivitySyncStatus.SAVE_SUCCESSFUL_PRIVATE },
            sync_state: OfflineActivitySyncState.SYNCHRONIZED
          }
        });
        yield put(Activity.getSuccess({ ...hydrated, sync_status: ActivitySyncStatus.SAVE_SUCCESSFUL_PRIVATE }));
        yield put({
          type: ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
          payload: { recordSetID: RecordSetId.Drafts, tableFiltersHash: 'init' }
        });
      } else {
        yield put({
          type: ACTIVITY_UPDATE_SYNC_STATE,
          payload: {
            id: hydrated.activity_id,
            data: { ...hydrated, sync_status: ActivitySyncStatus.SAVE_FAILED },
            sync_state: OfflineActivitySyncState.ERROR,
            error_detail: `HTTP response code ${networkReturn.status}`,
            error_object:
              networkReturn.status < 500
                ? networkReturn.data
                : 'There was an internal error. Please try again in a few moments.'
          }
        });
      }
    } catch (e) {
      yield put({
        type: ACTIVITY_UPDATE_SYNC_STATE,
        payload: {
          id: hydrated.activity_id,
          data: { ...hydrated, sync_status: ActivitySyncStatus.SAVE_FAILED },
          sync_state: OfflineActivitySyncState.ERROR,
          error_detail: 'Caught error when synchronizing',
          error_object: e
        }
      });
    }
  }

  yield put({ type: ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE });
}

function* handle_ACTIVITY_OFFLINE_DELETE_ITEM(action: PayloadAction<{ id: string }>) {
  const { serializedActivities } = yield select(selectOfflineActivity);
  if (!serializedActivities[action.payload.id]) {
    yield put(
      Alerts.create({
        content: 'Offline activity deleted from device',
        subject: AlertSubjects.Form,
        severity: AlertSeverity.Success,
        autoClose: 4
      })
    );
  } else {
    yield put(
      Alerts.create({
        content: 'Failed to delete offline activity',
        subject: AlertSubjects.Form,
        severity: AlertSeverity.Error,
        autoClose: 4
      })
    );
  }
}

export function* handle_ACTIVITY_RESTORE_OFFLINE() {}

export const OFFLINE_ACTIVITY_SAGA_HANDLERS = [
  takeEvery(ACTIVITY_OFFLINE_DELETE_ITEM, handle_ACTIVITY_OFFLINE_DELETE_ITEM),
  takeEvery(Activity.getLocal, handle_ACTIVITY_GET_LOCAL_REQUEST),
  takeEvery(ACTIVITY_SAVE_OFFLINE, handle_ACTIVITY_SAVE_OFFLINE),
  takeEvery(Activity.createLocal, handle_ACTIVITY_CREATE_LOCAL),
  takeLeading(ACTIVITY_RUN_OFFLINE_SYNC, handle_ACTIVITY_RUN_OFFLINE_SYNC)
];
