import { all, call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  TABS_SET_ACTIVE_TAB_REQUEST,
  TABS_SET_ACTIVE_TAB_SUCCESS,
  TABS_SET_ACTIVE_TAB_FAILURE,
  TABS_SET_USER_MENU_OPEN_REQUEST,
  TABS_SET_USER_MENU_OPEN_SUCCESS,
  TABS_SET_USER_MENU_OPEN_FAILURE,
  TABS_SET_SHOW_LOGGED_IN_TABS_REQUEST,
  TABS_SET_SHOW_LOGGED_IN_TABS_SUCCESS,
  TABS_SET_SHOW_LOGGED_IN_TABS_FAILURE
} from '../actions';
import { selectAuth } from 'state/reducers/auth';
import { selectUserSettings } from 'state/reducers/userSettings';

function* handle_TABS_SET_ACTIVE_TAB_REQUEST(action) {
  try {
    console.log('Setting active tab to ' + action.payload);
    yield put({ type: TABS_SET_ACTIVE_TAB_SUCCESS, activeTab: action.payload });
  } catch (e) {
    console.error(e);
    yield put({ type: TABS_SET_ACTIVE_TAB_FAILURE });
  }
}

function* handle_TABS_SET_USER_MENU_OPEN_REQUEST(action) {
  try {
    // console.log('ACTION USERMENUOPEN: ', action);
    console.log('Setting user menu open to ' + action.payload);
    yield put({ type: TABS_SET_USER_MENU_OPEN_SUCCESS, userMenuOpen: action.payload });
  } catch (e) {
    console.error(e);
    yield put({ type: TABS_SET_USER_MENU_OPEN_FAILURE });
  }
}

function* handle_TABS_SET_SHOW_LOGGED_IN_TABS_REQUEST(action) {
  try {
    const auth = yield select(selectAuth);
    const userSettings = yield select(selectUserSettings);
    if (auth.initialized && userSettings.initialized) {
      // console.log('ACTION: ', action);
      // console.log('AUTH: ', auth);
      // console.log('USER SETTINGS: ', userSettings);
      const showLoggedInTabs = auth.authenticated && userSettings.userInfoLoaded && userSettings.activated;
      console.log('Setting showLoggedInTabs to ' + showLoggedInTabs);
      yield put({ type: TABS_SET_SHOW_LOGGED_IN_TABS_SUCCESS, showLoggedInTabs });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: TABS_SET_SHOW_LOGGED_IN_TABS_FAILURE });
  }
}
function* tabsSaga() {
  yield all([
    takeEvery(TABS_SET_ACTIVE_TAB_REQUEST, handle_TABS_SET_ACTIVE_TAB_REQUEST),
    takeEvery(TABS_SET_USER_MENU_OPEN_REQUEST, handle_TABS_SET_USER_MENU_OPEN_REQUEST),
    takeEvery(TABS_SET_SHOW_LOGGED_IN_TABS_REQUEST, handle_TABS_SET_SHOW_LOGGED_IN_TABS_REQUEST)
  ]);
}

export default tabsSaga;
