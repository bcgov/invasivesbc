import { createNextState } from '@reduxjs/toolkit';
import moment from 'moment';
import { ActivityStatus } from 'sharedAPI';
import { AppConfig } from 'state/configuration/runtime-config';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import Activity from 'state/actions/activity/Activity';
import FormActions from 'state/actions/activity/FormActions';

enum OfflineActivitySyncState {
  LOCALLY_MODIFIED = 'Locally Modified',
  SYNCHRONIZED = 'Synchronized',
  ERROR = 'Error',
  OPTIMISTIC_LOCKING_FAILURE = 'Optimistic Locking Failure'
}

interface OfflineActivityRecord {
  data: string;
  saved_at: number;
  short_id: string;
  record_type: string;
  sync_state: OfflineActivitySyncState;
  error_detail?: string;
  error_object?: Record<PropertyKey, unknown>;
}

interface OfflineActivityState {
  [MIGRATION_VERSION_KEY]: number;
  working: boolean;
  statusDialogOpen: boolean;
  serial: number;
  serializedActivities: {
    [id: string]: OfflineActivityRecord;
  };
}

const initialState: OfflineActivityState = {
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,
  working: false,
  statusDialogOpen: false,
  serial: moment.now(),
  serializedActivities: {}
};

function createOfflineActivityReducer(
  _configuration: AppConfig
): (OfflineActivityState, AnyAction) => OfflineActivityState {
  return (state: OfflineActivityState = initialState, action) => {
    return createNextState(state, (draftState) => {
      const { payload } = action;
      if (Activity.createLocal.match(action)) {
        draftState.serializedActivities[payload.id] = {
          data: JSON.stringify(payload.data, null, 2),
          saved_at: moment.now(),
          short_id: action.payload.data.short_id || payload.id,
          record_type: action.payload.data.activity_subtype,
          sync_state: OfflineActivitySyncState.LOCALLY_MODIFIED
        };
        draftState.serial = moment.now();
      } else if (Activity.Offline.save.match(action)) {
        draftState.serializedActivities[payload.id] = {
          data: JSON.stringify(payload.data, null, 2),
          saved_at: moment.now(),
          short_id: payload.data.short_id || payload.id,
          record_type: payload.data.activity_subtype,
          sync_state: OfflineActivitySyncState.LOCALLY_MODIFIED
        };
        draftState.serial = moment.now();
      } else if (FormActions.saveMobileForm.match(action)) {
        const { data, type } = action.payload;
        const currTime = moment.now();
        data.form_status = type === 'submit' ? ActivityStatus.SUBMITTED : data.form_status;
        const id = data?.id ?? crypto.randomUUID();
        draftState.serializedActivities[id] = {
          data: JSON.stringify(data),
          saved_at: currTime,
          short_id: data?.short_id ?? id,
          record_type: data.subtype,
          sync_state: OfflineActivitySyncState.LOCALLY_MODIFIED
        };
        draftState.serial = currTime;
      } else if (Activity.Offline.syncRun.match(action)) {
        draftState.working = true;
      } else if (Activity.Offline.syncRunComplete.match(action)) {
        draftState.working = false;
      } else if (Activity.Offline.delete.match(action)) {
        const found = draftState.serializedActivities[action.payload];
        if (found) {
          delete draftState.serializedActivities[action.payload];
        }
        draftState.serial = moment.now();
      } else if (Activity.Offline.updateSyncState.match(action)) {
        const found = draftState.serializedActivities[payload.id];
        if (found) {
          draftState.serializedActivities[payload.id] = {
            ...found,
            data: JSON.stringify(payload.data, null, 2),
            sync_state: payload.sync_state
          };
          draftState.serializedActivities[payload.id].error_detail = payload?.error_detail ?? null;
          draftState.serializedActivities[payload.id].error_object = payload?.error_object ?? null;
        }
        draftState.serial = moment.now();
      } else if (Activity.Offline.setSyncDialogueWindow.match(action)) {
        draftState.statusDialogOpen = action.payload.open;
      }
    });
  };
}

const selectOfflineActivity = (state) => state.OfflineActivity;

export { createOfflineActivityReducer, selectOfflineActivity };
export { OfflineActivitySyncState };
export type { OfflineActivityRecord, OfflineActivityState };
