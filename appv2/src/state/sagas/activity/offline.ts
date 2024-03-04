import { put } from 'redux-saga/effects';
import { ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS } from '../../actions';

export function* handle_ACTIVITY_SAVE_OFFLINE(action) {
  // all logic handled in the reducer
  yield put({
    type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
    payload: {
      notification: {
        visible: true,
        message: 'Saved locally',
        severity: 'info'
      }
    }
  });
}

export function* handle_ACTIVITY_RESTORE_OFFLINE(action) {}
