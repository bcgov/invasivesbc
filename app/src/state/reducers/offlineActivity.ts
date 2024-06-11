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

export interface OfflineActivityRecord {
  data: string;
  saved_at: number;
  sync_state: 'LOCALLY_MODIFIED' | 'SYNCHRONIZED' | 'ERROR' | 'OPTIMISTIC_LOCKING_FAILURE';
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
      if (ACTIVITY_CREATE_LOCAL.match(action)) {
        draftState.serializedActivities[action.payload.id] = {
          data: JSON.stringify(action.payload.data, null, 2),
          saved_at: moment.now(),
          sync_state: 'LOCALLY_MODIFIED'
        };
        draftState.serial = moment.now();
      }
      if (ACTIVITY_SAVE_OFFLINE.match(action)) {
        draftState.serializedActivities[action.payload.id] = {
          data: JSON.stringify(action.payload.data, null, 2),
          saved_at: moment.now(),
          sync_state: 'LOCALLY_MODIFIED'
        };
      }
      draftState.serial = moment.now();

      if (ACTIVITY_RUN_OFFLINE_SYNC.match(action)) {
        draftState.working = true;
      }
      if (ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE.match(action)) {
        draftState.working = false;
      }
      if (ACTIVITY_UPDATE_SYNC_STATE.match(action)) {
        const found = draftState.serializedActivities[action.payload.id];
        if (found)
          draftState.serializedActivities[action.payload.id] = {
            ...found,
            sync_state: action.payload.sync_state
          };
        draftState.serial = moment.now();
      }
      if (ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE.match(action)) {
        draftState.statusDialogOpen = action.payload.open;
      }
      if (ACTIVITY_OFFLINE_DELETE_ITEM.match(action)) {
        const found = draftState.serializedActivities[action.payload.id];
        if (found) {
          delete draftState.serializedActivities[action.payload.id];
        }
        draftState.serial = moment.now();
      }
    });
  };
}

const selectOfflineActivity = (state) => state.OfflineActivity;

export { createOfflineActivityReducer, selectOfflineActivity };
