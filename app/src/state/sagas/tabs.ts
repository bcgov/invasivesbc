import { all, put, takeEvery } from 'redux-saga/effects';
import {
  TABS_SET_ACTIVE_TAB_REQUEST,
  TABS_SET_ACTIVE_TAB_SUCCESS,
  TABS_SET_ACTIVE_TAB_FAILURE,
  TABS_SET_USER_MENU_OPEN_REQUEST,
  TABS_SET_USER_MENU_OPEN_SUCCESS,
  TABS_SET_USER_MENU_OPEN_FAILURE,
  TABS_GET_INITIAL_STATE_REQUEST,
  TABS_GET_INITIAL_STATE_SUCCESS,
  TABS_GET_INITIAL_STATE_FAILURE
} from '../actions';

function* handle_TABS_GET_INITIAL_STATE_REQUEST(action) {
  const currentTab = localStorage.getItem('TABS_CURRENT_TAB');
  if (!currentTab) {
    localStorage.setItem('TABS_CURRENT_TAB', '0');
  }
  try {
    yield put({
      type: TABS_GET_INITIAL_STATE_SUCCESS,
      payload: {
        activeTab: localStorage.getItem('TABS_CURRENT_TAB'), // TODO GRAB FROM LOCALSTORAGE
        showLoggedInTabs: action.payload.activated && action.payload.authenticated // TODO COMPUTE THIS
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: TABS_GET_INITIAL_STATE_FAILURE });
  }
}

function* handle_TABS_SET_ACTIVE_TAB_REQUEST(action) {
  try {
    yield put({ type: TABS_SET_ACTIVE_TAB_SUCCESS, payload: action.payload });
  } catch (e) {
    console.error(e);
    yield put({ type: TABS_SET_ACTIVE_TAB_FAILURE });
  }
}

function* handle_TABS_SET_USER_MENU_OPEN_REQUEST(action) {
  try {
    console.log('Setting user menu open to ' + action.payload);
    yield put({ type: TABS_SET_USER_MENU_OPEN_SUCCESS, payload: action.payload });
  } catch (e) {
    console.error(e);
    yield put({ type: TABS_SET_USER_MENU_OPEN_FAILURE });
  }
}

function* tabsSaga() {
  yield all([
    takeEvery(TABS_SET_ACTIVE_TAB_REQUEST, handle_TABS_SET_ACTIVE_TAB_REQUEST),
    takeEvery(TABS_SET_USER_MENU_OPEN_REQUEST, handle_TABS_SET_USER_MENU_OPEN_REQUEST),
    takeEvery(TABS_GET_INITIAL_STATE_REQUEST, handle_TABS_GET_INITIAL_STATE_REQUEST)
  ]);
}

export default tabsSaga;
