import { createNextState } from '@reduxjs/toolkit';
import moment from 'moment';
import { AppConfig } from '../config';
import {
  ACTIVITY_CREATE_LOCAL,
  ACTIVITY_OFFLINE_DELETE_ITEM,
  ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE,
  ACTIVITY_RUN_OFFLINE_SYNC,
  ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE,
  ACTIVITY_SAVE_OFFLINE,
  ACTIVITY_UPDATE_SYNC_STATE
} from '../actions';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';

export enum OfflineActivitySyncState {
  LOCALLY_MODIFIED = 'Locally Modified',
  SYNCHRONIZED = 'Synchronized',
  ERROR = 'Error',
  OPTIMISTIC_LOCKING_FAILURE = 'Optimistic Locking Failure'
}

export interface OfflineActivityRecord {
  data: string;
  saved_at: number;
  short_id: string;
  record_type: string;
  sync_state: OfflineActivitySyncState;
  error_detail?: string;
  error_object?: unknown;
}

export interface OfflineActivityState {
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
  configuration: AppConfig
): (OfflineActivityState, AnyAction) => OfflineActivityState {
  return (state: OfflineActivityState = initialState, action) => {
    return createNextState(state, (draftState) => {
      const { type, payload } = action;
      switch (type) {
        case ACTIVITY_CREATE_LOCAL:
          draftState.serializedActivities[payload.id] = {
            data: JSON.stringify(payload.data, null, 2),
            saved_at: moment.now(),
            short_id: payload.data.short_id || payload.id,
            record_type: payload.data.activity_subtype,
            sync_state: OfflineActivitySyncState.LOCALLY_MODIFIED
          };
          draftState.serial = moment.now();
          break;
        case ACTIVITY_SAVE_OFFLINE:
          draftState.serializedActivities[payload.id] = {
            data: JSON.stringify(payload.data, null, 2),
            saved_at: moment.now(),
            short_id: payload.data.short_id || payload.id,
            record_type: payload.data.activity_subtype,
            sync_state: OfflineActivitySyncState.LOCALLY_MODIFIED
          };
          draftState.serial = moment.now();
          break;
        case ACTIVITY_RUN_OFFLINE_SYNC: {
          draftState.working = true;
          break;
        }
        case ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE: {
          draftState.working = false;
          break;
        }
        case ACTIVITY_UPDATE_SYNC_STATE: {
          const found = draftState.serializedActivities[payload.id];
          if (found) {
            draftState.serializedActivities[payload.id] = {
              ...found,
              sync_state: payload.sync_state
            };

            if (payload.error_detail) {
              draftState.serializedActivities[payload.id].error_detail = payload.error_detail;
            } else {
              delete draftState.serializedActivities[payload.id].error_detail;
            }
            if (payload.error_object) {
              draftState.serializedActivities[payload.id].error_object = payload.error_object;
            } else {
              delete draftState.serializedActivities[payload.id].error_object;
            }
          }

          draftState.serial = moment.now();
          break;
        }
        case ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE: {
          draftState.statusDialogOpen = action.payload.open;
          break;
        }
        case ACTIVITY_OFFLINE_DELETE_ITEM: {
          const found = draftState.serializedActivities[payload.id];
          if (found) {
            delete draftState.serializedActivities[payload.id];
          }
          draftState.serial = moment.now();
          break;
        }
      }
    });
  };
}

const selectOfflineActivity = (state) => state.OfflineActivity;

export { createOfflineActivityReducer, selectOfflineActivity };
