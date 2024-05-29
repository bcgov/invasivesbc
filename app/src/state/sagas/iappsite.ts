import { all, put, takeEvery } from 'redux-saga/effects';
import { handle_IAPP_GET_REQUEST, handle_IAPP_GET_SUCCESS, handle_IAPP_PAN_AND_ZOOM } from './iappsite/dataAccess';
import { handle_IAPP_GET_NETWORK_REQUEST } from './iappsite/online';
import {
  IAPP_GET_NETWORK_REQUEST,
  IAPP_GET_REQUEST,
  IAPP_GET_SUCCESS,
  IAPP_PAN_AND_ZOOM,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS
} from 'state/actions';

function* handle_USER_SETTINGS_READY(action) {
  if (action.payload.activeIAPP && action.payload.activeIAPP !== null) {
    yield put({ type: IAPP_GET_REQUEST, payload: { iappID: action.payload.activeIAPP } });
  }
}

function* iappPageSaga() {
  yield all([
    takeEvery(IAPP_GET_REQUEST, handle_IAPP_GET_REQUEST),
    takeEvery(IAPP_GET_NETWORK_REQUEST, handle_IAPP_GET_NETWORK_REQUEST),
    takeEvery(IAPP_GET_SUCCESS, handle_IAPP_GET_SUCCESS),
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, handle_USER_SETTINGS_READY),
    takeEvery(USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS, handle_USER_SETTINGS_READY),
    takeEvery(IAPP_PAN_AND_ZOOM, handle_IAPP_PAN_AND_ZOOM)
  ]);
}

export default iappPageSaga;
