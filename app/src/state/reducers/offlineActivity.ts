import { createNextState } from '@reduxjs/toolkit';
import { AppConfig } from '../config';
import { ACTIVITY_SAVE_OFFLINE } from '../actions';
import moment from 'moment';

interface OfflineActivityState {
  serializedActivities: {
    [id: string]: {
      data: string;
      saved_at: number;
    };
  };
}

const initialState: OfflineActivityState = {
  serializedActivities: {}
};

function createOfflineActivityReducer(
  configuration: AppConfig
): (OfflineActivityState, AnyAction) => OfflineActivityState {
  return (state: OfflineActivityState = initialState, action) => {
    return createNextState(state, (draftState) => {
      const { type, payload } = action;
      switch (type) {
        case ACTIVITY_SAVE_OFFLINE:
          draftState.serializedActivities[payload.id] = {
            data: JSON.stringify(payload.data, null, 2),
            saved_at: moment.now()
          };
          break;
      }
    });
  };
}

const selectOfflineActivity = (state) => state.OfflineActivity;

export { createOfflineActivityReducer, selectOfflineActivity };
