import { all, put, takeEvery } from 'redux-saga/effects';
import { handle_IAPP_GET_REQUEST, handle_IAPP_GET_SUCCESS, handle_IAPP_PAN_AND_ZOOM } from './iappsite/dataAccess';
import { handle_IAPP_GET_NETWORK_REQUEST } from './iappsite/online';
import UserSettings from 'state/actions/userSettings/UserSettings';
import IappActions from 'state/actions/activity/Iapp';
import MapActions from 'state/actions/map';

function* handle_USER_SETTINGS_READY(action) {
  if (action.payload?.activeIAPP) {
    yield put(IappActions.get(action.payload.activeIAPP));
  }
}

function* iappPageSaga() {
  yield all([
    takeEvery(IappActions.get, handle_IAPP_GET_REQUEST),
    takeEvery(IappActions.getRequest, handle_IAPP_GET_NETWORK_REQUEST),
    takeEvery(IappActions.getSuccess, handle_IAPP_GET_SUCCESS),
    takeEvery(MapActions.panToIAPP, handle_IAPP_PAN_AND_ZOOM),
    takeEvery(UserSettings.InitState.getSuccess, handle_USER_SETTINGS_READY),
    takeEvery(UserSettings.IAPP.setActiveSuccess, handle_USER_SETTINGS_READY)
  ]);
}

export default iappPageSaga;
