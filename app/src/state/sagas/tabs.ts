import { TabIconName } from 'components/tabs/TabIconIndex';
import { all, put, select, takeEvery } from 'redux-saga/effects';
import { selectAuth } from 'state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';
import { selectTabs } from 'state/reducers/tabs';
import {
  TABS_SET_ACTIVE_TAB_REQUEST,
  TABS_SET_ACTIVE_TAB_SUCCESS,
  TABS_SET_ACTIVE_TAB_FAILURE,
  TABS_GET_INITIAL_STATE_REQUEST,
  TABS_GET_INITIAL_STATE_SUCCESS,
  TABS_GET_INITIAL_STATE_FAILURE
} from '../actions';

function* handle_TABS_GET_INITIAL_STATE_REQUEST(action) {
  const currentTab = yield localStorage.getItem('TABS_CURRENT_TAB');
  const currentTabPath = yield localStorage.getItem('TABS_CURRENT_TAB_PATH');
  if (!currentTab) {
    yield localStorage.setItem('TABS_CURRENT_TAB', '0');
  }
  if (!currentTabPath) {
    yield localStorage.setItem('TABS_CURRENT_TAB_PATH', '/home/landing');
  }
  try {
    const configuration = yield select(selectConfiguration);
    const auth = yield select(selectAuth);

    const isMasterAdmin = auth.roles.some((role) => role.role_name === 'master_administrator');
    const isPlantPerson = auth.roles.some(
      (role) => role.role_name === 'master_administrator' || role.role_name.toLowerCase().includes('plant')
    );
    const showLoggedInTabs = action.payload.activated && action.payload.authenticated;

    const tabConfig = [
      {
        label: 'Home',
        path: '/home/landing',
        icon: TabIconName.Home
      }
    ];

    if (!showLoggedInTabs) {
      tabConfig.push({
        label: 'Map',
        path: '/home/map',
        icon: TabIconName.Map
      });
    }

    if (showLoggedInTabs) {
      tabConfig.push(
        {
          label: 'Recorded Activities',
          path: '/home/activities',
          icon: TabIconName.Homework
        },
        {
          label: 'Current Activity',
          path: '/home/activity',
          icon: TabIconName.Assignment
        },
        {
          label: 'Current IAPP Site',
          path: '/home/iapp',
          icon: TabIconName.IAPP
        }
      );
    }

    if (isMasterAdmin || isPlantPerson) {
      if (configuration.FEATURE_GATE.EMBEDDED_REPORTS) {
        tabConfig.push({
          label: 'Reports',
          path: '/home/reports',
          icon: TabIconName.Assessment
        });
      }

      tabConfig.push({
        label: 'Admin',
        path: '/home/admin',
        icon: TabIconName.AdminPanelSettings
      });
    }

    yield put({
      type: TABS_GET_INITIAL_STATE_SUCCESS,
      payload: {
        activeTab: localStorage.getItem('TABS_CURRENT_TAB'),
        showLoggedInTabs: showLoggedInTabs,
        tabConfig: tabConfig
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: TABS_GET_INITIAL_STATE_FAILURE });
  }
}

function* handle_TABS_SET_ACTIVE_TAB_REQUEST(action) {
  try {
    const tabs = yield select(selectTabs);
    if (tabs.initialized) {
      yield localStorage.setItem('TABS_CURRENT_TAB', action.payload.activeTab.toString());
      yield console.log('tabs', tabs);
      yield console.log('activeTab: ', action.payload.activeTab);
      yield localStorage.setItem('TABS_CURRENT_TAB_PATH', tabs.tabConfig[action.payload.activeTab].path); // Causing error
      yield put({ type: TABS_SET_ACTIVE_TAB_SUCCESS, payload: action.payload });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: TABS_SET_ACTIVE_TAB_FAILURE });
  }
}

function* tabsSaga() {
  yield all([
    takeEvery(TABS_GET_INITIAL_STATE_REQUEST, handle_TABS_GET_INITIAL_STATE_REQUEST),
    takeEvery(TABS_SET_ACTIVE_TAB_REQUEST, handle_TABS_SET_ACTIVE_TAB_REQUEST)
  ]);
}

export default tabsSaga;
