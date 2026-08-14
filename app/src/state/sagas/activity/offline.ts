import { delay, put, select, takeEvery, takeLeading } from 'redux-saga/effects';
import { ActivityStatus, ActivitySubtypeShortLabels, ActivitySyncStatus } from 'sharedAPI';
import { PayloadAction } from '@reduxjs/toolkit';
import { getCurrentJWT } from 'state/sagas/auth/auth';
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
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import FormActions, { FormSubmission } from 'state/actions/activity/FormActions';
import { selectConfiguration } from 'state/reducers/configuration';
import { AppConfig } from 'state/configuration/runtime-config';
import transformPydanticErrors from 'utils/transformPydanticErrors';
import formAlerts from 'constants/alerts/formAlerts';

function* handle_ACTIVITY_SAVE_OFFLINE(action: PayloadAction<FormSubmission>) {
  const connected = yield select(selectNetworkConnected);
  // reload the activity in case the reducer modified it (create time, etc.)
  yield put(Activity.get(action.payload.data.id));
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
  const config: AppConfig = yield select(selectConfiguration);
  const { serializedActivities } = yield select(selectOfflineActivity);
  const { formId, activeActivityPermissions } = yield select(selectActivity);
  const toSync: OfflineActivityRecord[] = Object.values(serializedActivities).filter(
    (s) =>
      typeof s === 'object' &&
      s !== null &&
      Object.hasOwn(s, 'sync_state') &&
      (s as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED
  ) as OfflineActivityRecord[];

  for (const activity of toSync) {
    const hydrated = JSON.parse(activity.data);
    // ActivitySubtypeShortLabels contains all legacy subtypes, so we can determine a match both from the key existing, and having a pair in this object.
    const isLegacyActivity =
      'activity_subtype' in hydrated && !!ActivitySubtypeShortLabels?.[hydrated.activity_subtype];

    // TODO: Delete this entire conditional, and keep the `else` block as the only path.
    if (isLegacyActivity) {
      /*
       * This is the Legacy functionality for submitting a record from a mobile device. This functionality is entirely redacted/replaced
       * but during the transition phase of new to old forms there may be a period where both types of forms could exist on a single device.
       * This ensures both types of forms will submit temporarily until all forms are transitioned into the new format.
       */
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
    } else {
      try {
        const sync_status = hydrated.form_status === ActivitySyncStatus.SAVE_SUCCESSFUL;
        const path = hydrated.form_status === ActivityStatus.SUBMITTED ? 'submit' : 'draft';

        const networkReturn = yield fetch(`${config.API_V2_BASE}/ninja/activities/${path}`, {
          method: 'POST',
          headers: {
            Authorization: yield getCurrentJWT(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(hydrated)
        });
        if (networkReturn?.ok) {
          yield put(
            Activity.Offline.updateSyncState({
              id: hydrated.id,
              data: {
                ...hydrated,
                sync_status: sync_status
              },
              sync_state: OfflineActivitySyncState.SYNCHRONIZED
            })
          );

          if (hydrated.id === formId) {
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
          let errorDetail = networkReturn.data;
          if (networkReturn.status === 422) {
            const parsedError = yield networkReturn.json();
            errorDetail = `Form contains ${parsedError?.detail?.length} error(s).`;
            // If this record is the active record, alert the errors.
            if (formId === hydrated['id']) {
              const errors = transformPydanticErrors(parsedError.detail);
              for (const e of errors) {
                yield put(Alerts.create(e));
              }
            }
          } else if (networkReturn.status === 500) {
            errorDetail = 'There was an internal error. Please try again in a few moments.';
          }
          // Request failed, alert user.
          yield put(Alerts.create(formAlerts.recordSubmittedFailure));

          yield put(
            Activity.Offline.updateSyncState({
              id: hydrated.id,
              data: { ...hydrated, sync_status: ActivitySyncStatus.SAVE_FAILED },
              sync_state: OfflineActivitySyncState.ERROR,
              error_detail: `HTTP response code ${networkReturn.status}`,
              error_object: errorDetail
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
  takeEvery(FormActions.saveMobileForm, handle_ACTIVITY_SAVE_OFFLINE),
  takeEvery(Activity.createLocal, handle_ACTIVITY_CREATE_LOCAL),
  takeLeading(Activity.Offline.syncRun, handle_ACTIVITY_RUN_OFFLINE_SYNC)
];

export {
  handle_ACTIVITY_SAVE_OFFLINE,
  handle_ACTIVITY_GET_LOCAL_REQUEST,
  handle_ACTIVITY_RUN_OFFLINE_SYNC,
  handle_ACTIVITY_CREATE_LOCAL
};
