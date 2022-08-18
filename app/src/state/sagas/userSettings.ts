import { all, call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import {
  USER_SETTINGS_GET_INITIAL_STATE_REQUEST,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
USER_SETTINGS_GET_INITIAL_STATE_FAILURE,
USER_SETTINGS_SET_ACTIVE_ACTIVITY_FAILURE,
ACTIVITY_GET_INITIAL_STATE_REQUEST,
ACTIVITY_GET_REQUEST,
AUTH_INITIALIZE_COMPLETE
} from '../actions';

function* handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST(action) {
  try {
    const oldID = localStorage.getItem('activeActivity')
    
    yield put({ type: USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, payload: { activeActivity: oldID} });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_GET_INITIAL_STATE_FAILURE });
  }
}

function* handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST(action) {
  try {
    const newID = localStorage.setItem('activeActivity', action.payload.activeActivity)
    
    yield put({ type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS, payload: { activeActivity: action.payload.activeActivity} });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_FAILURE });
  }
}


function* handle_APP_AUTH_READY(action) {
      yield put({type: USER_SETTINGS_GET_INITIAL_STATE_REQUEST})
}

function* userSettingsSaga() {
  yield all([
    takeEvery(AUTH_INITIALIZE_COMPLETE, handle_APP_AUTH_READY ),
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_REQUEST , handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST),
    takeEvery(USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST , handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST),
  ]);
}

export default userSettingsSaga;
