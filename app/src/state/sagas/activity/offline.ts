import { delay, put, select, takeEvery, takeLeading } from 'redux-saga/effects';
import { ActivityStatus, ActivitySyncStatus } from 'sharedAPI';
import { PayloadAction } from '@reduxjs/toolkit';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { selectNetworkConnected } from 'state/reducers/network';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';
import Activity, { ICreateLocal } from 'state/actions/activity/Activity';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { RecordSetId } from 'interfaces/UserRecordSet';
import parseActivityForPermissions from 'utils/parseActivityForPermissions';
import { selectActivity } from 'state/reducers/activity';
import { PLATFORM_SRC } from 'constants/misc';
import { ISaveOffline } from 'state/actions/activity/Offline';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';

function* handle_ACTIVITY_SAVE_OFFLINE(action: PayloadAction<ISaveOffline>) {
  const connected = yield select(selectNetworkConnected);
  // reload the activity in case the reducer modified it (create time, etc.)
  yield put(Activity.get(action.payload.id));
  if (connected) {
    // trigger a sync if we're online
    yield put(
      Alerts.create({
        content: 'Synchronizing records with server.',
        severity: AlertSeverity.Info,
        subject: AlertSubjects.Form,
        autoClose: 6
      })
    );
    yield delay(500);
    yield put(Activity.Offline.syncRun());
  } else {
    yield put(
      Alerts.create({
        content: 'Saved locally',
        severity: AlertSeverity.Info,
        subject: AlertSubjects.Form,
        autoClose: 6
      })
    );
  }
}

function* handle_ACTIVITY_CREATE_LOCAL(action: PayloadAction<ICreateLocal>) {
  yield put(Activity.createSuccess(action.payload.data.activity_id));
}

function* handle_ACTIVITY_GET_LOCAL_REQUEST(action: PayloadAction<string>) {
  const connected = yield select(selectNetworkConnected);
  const { serializedActivities } = yield select(selectOfflineActivity);
  const activityID = action.payload;

  const found = serializedActivities[activityID];

  if (found) {
    const activity = JSON.parse(found.data);
    yield put(Activity.getSuccess({ activity, permissions: parseActivityForPermissions(activity, true) }));
    return;
  } else if (connected) {
    // not locally, maybe we can get it from the server if we're online
    const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload}`);
    if (networkReturn?.ok) {
      const datav2 = {
        ...networkReturn.data,
        species_positive: networkReturn.data.species_positive || [],
        species_negative: networkReturn.data.species_negative || [],
        species_treated: networkReturn.data.species_treated || [],
        media: networkReturn.data.media || [],
        media_delete_keys: networkReturn.data.media_delete_keys || [],
        platform_src: PLATFORM_SRC
      };
      yield put(Activity.getSuccess({ activity: datav2, permissions: parseActivityForPermissions(datav2) }));
      return;
    }
  }
  try {
    const service = yield RecordCacheServiceFactory.getPlatformInstance();
    const result = yield service.loadActivity(activityID);
    if (result) {
      const datav2 = {
        ...result,
        species_positive: result.species_positive || [],
        species_negative: result.species_negative || [],
        species_treated: result.species_treated || [],
        media: result.media || [],
        media_delete_keys: result.media_delete_keys || []
      };
      yield put(Activity.getSuccess({ activity: datav2, permissions: parseActivityForPermissions(datav2) }));
      return;
    }
  } catch (e) {
    console.error(e);
  }
  yield put(Activity.getFailure());
}

function* handle_ACTIVITY_RUN_OFFLINE_SYNC() {
  const { serializedActivities } = yield select(selectOfflineActivity);
  const { activeActivity, activeActivityPermissions } = yield select(selectActivity);
  const toSync: OfflineActivityRecord[] = Object.values(serializedActivities).filter(
    (s) =>
      typeof s === 'object' &&
      s !== null &&
      Object.hasOwn(s, 'sync_state') &&
      (s as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED
  ) as OfflineActivityRecord[];

  for (const activity of toSync) {
    const hydrated = JSON.parse(activity.data);
    const sync_status =
      hydrated.form_status === ActivityStatus.SUBMITTED
        ? ActivitySyncStatus.SAVE_SUCCESSFUL
        : ActivitySyncStatus.SAVE_SUCCESSFUL_PRIVATE; // saved to db but only visible to user in drafts

    try {
      const networkReturn =
        hydrated.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL_PRIVATE ||
        hydrated.sync_status === ActivitySyncStatus.SAVE_SUCCESSFUL
          ? yield InvasivesAPI_Call('PUT', `/api/activity/`, {
              ...hydrated,
              sync_status: sync_status
            })
          : yield InvasivesAPI_Call('POST', `/api/activity/`, {
              ...hydrated,
              sync_status: sync_status
            });
      if (networkReturn?.ok) {
        yield put(
          Activity.Offline.updateSyncState({
            id: hydrated.activity_id,
            data: {
              ...hydrated,
              sync_status: sync_status
            },
            sync_state: OfflineActivitySyncState.SYNCHRONIZED
          })
        );

        if (hydrated.activity_id === activeActivity) {
          yield put(
            Activity.getSuccess({
              activity: {
                ...hydrated,
                sync_status
              },
              permissions: activeActivityPermissions
            })
          );
        }
        // Refetch Draft Records now that we're synced
        yield put(WhatsHere.getIdsForRecordset({ recordSetID: RecordSetId.Drafts, tableFiltersHash: 'init' }));
      } else {
        yield put(
          Activity.Offline.updateSyncState({
            id: hydrated.activity_id,
            data: { ...hydrated, sync_status: ActivitySyncStatus.SAVE_FAILED },
            sync_state: OfflineActivitySyncState.ERROR,
            error_detail: `HTTP response code ${networkReturn.status}`,
            error_object:
              networkReturn.status < 500
                ? networkReturn.data
                : 'There was an internal error. Please try again in a few moments.'
          })
        );
      }
    } catch (e) {
      yield put(
        Activity.Offline.updateSyncState({
          id: hydrated.activity_id,
          data: { ...hydrated, sync_status: ActivitySyncStatus.SAVE_FAILED },
          sync_state: OfflineActivitySyncState.ERROR,
          error_detail: 'Caught error when synchronizing',
          error_object: e
        })
      );
    }
  }
  yield put(Activity.Offline.syncRunComplete());
}

function* handle_ACTIVITY_OFFLINE_DELETE_ITEM(action: PayloadAction<string>) {
  const { serializedActivities } = yield select(selectOfflineActivity);
  if (!serializedActivities[action.payload]) {
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

export const OFFLINE_ACTIVITY_SAGA_HANDLERS = [
  takeEvery(Activity.Offline.delete, handle_ACTIVITY_OFFLINE_DELETE_ITEM),
  takeEvery(Activity.getLocal, handle_ACTIVITY_GET_LOCAL_REQUEST),
  takeEvery(Activity.Offline.save, handle_ACTIVITY_SAVE_OFFLINE),
  takeEvery(Activity.createLocal, handle_ACTIVITY_CREATE_LOCAL),
  takeLeading(Activity.Offline.syncRun, handle_ACTIVITY_RUN_OFFLINE_SYNC)
];

export {
  handle_ACTIVITY_SAVE_OFFLINE,
  handle_ACTIVITY_GET_LOCAL_REQUEST,
  handle_ACTIVITY_RUN_OFFLINE_SYNC,
  handle_ACTIVITY_CREATE_LOCAL
};
