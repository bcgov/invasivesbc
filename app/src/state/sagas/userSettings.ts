import { all, put, select, takeEvery } from 'redux-saga/effects';
import {
  AUTH_INITIALIZE_COMPLETE,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_FAILURE,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS,
  USER_SETTINGS_ADD_RECORD_SET_FAILURE,
  USER_SETTINGS_ADD_RECORD_SET_REQUEST,
  USER_SETTINGS_ADD_RECORD_SET_SUCCESS,
  USER_SETTINGS_GET_INITIAL_STATE_FAILURE,
  USER_SETTINGS_GET_INITIAL_STATE_REQUEST,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_FAILURE,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS,
  USER_SETTINGS_REMOVE_RECORD_SET_FAILURE,
  USER_SETTINGS_REMOVE_RECORD_SET_REQUEST,
  USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_FAILURE,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_DARK_THEME,
  USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST,
  USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_FAILURE,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS,
  USER_SETTINGS_SET_RECORD_SET_FAILURE,
  USER_SETTINGS_SET_RECORD_SET_REQUEST,
  USER_SETTINGS_SET_RECORD_SET_SUCCESS,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_FAILURE,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS,
  USER_SETTINGS_SET_MAP_CENTER_REQUEST,
  USER_SETTINGS_SET_MAP_CENTER_SUCCESS,
  USER_SETTINGS_SET_MAP_CENTER_FAILURE,
  USER_SETTINGS_SET_BOUNDARIES_REQUEST,
  USER_SETTINGS_SET_BOUNDARIES_SUCCESS,
  USER_SETTINGS_SET_BOUNDARIES_FAILURE,
  USER_SETTINGS_DELETE_BOUNDARY_REQUEST,
  USER_SETTINGS_DELETE_KML_REQUEST,
  USER_SETTINGS_DELETE_BOUNDARY_SUCCESS,
  USER_SETTINGS_DELETE_BOUNDARY_FAILURE,
  USER_SETTINGS_DELETE_KML_SUCCESS,
  USER_SETTINGS_DELETE_KML_FAILURE
} from '../actions';
import { ActivityStatus } from 'constants/activities';
import { selectAuth } from 'state/reducers/auth';
import { selectUserSettings } from 'state/reducers/userSettings';
import { selectConfiguration } from '../reducers/configuration';
import { InvasivesAPI_Call, useInvasivesApi } from 'hooks/useInvasivesApi';

function* handle_USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST(action) {
  try {
    const userSettings = yield select(selectUserSettings);
    const recordsExpanded = !userSettings.recordsExpanded;

    const newRecordsExpandedState = localStorage.setItem('records-expanded', JSON.stringify({ recordsExpanded }));

    yield put({ type: USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_FAILURE });
  }
}

function* handle_USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST(action) {
  try {
    const userSettings = yield select(selectUserSettings);
    let sets = userSettings?.recordSets;
    const current = sets[action.payload.setName];

    current.searchBoundary = null;

    const newAppState = localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: { ...sets } }));

    yield put({ type: USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS, payload: { recordSets: sets } });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_FAILURE });
  }
}

function* handle_USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST(action) {
  try {
    const userSettings = yield select(selectUserSettings);
    let sets = userSettings?.recordSets;
    const current = sets[action.payload.setName];

    const boundary = JSON.parse(action.payload?.boundary);
    const patchedBoundary = { ...boundary, geos: boundary?.server_id ? [] : [...boundary?.geos] };
    current.searchBoundary = patchedBoundary;

    const newAppState = localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: { ...sets } }));

    yield put({ type: USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS, payload: { recordSets: sets } });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_ADD_BOUNDARY_TO_SET_FAILURE });
  }
}

function* handle_USER_SETTINGS_SET_BOUNDARIES_REQUEST(action) {
  try {
    if (action.payload.boundaries !== null) {
      // const newAppState = localStorage.setItem('boundaries', JSON.stringify(action.payload.boundaries));
      // can't set local storage on kml set since some are too big...
      yield put({ type: USER_SETTINGS_SET_BOUNDARIES_SUCCESS, payload: action.payload });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_SET_BOUNDARIES_FAILURE, payload: action.payload });
  }
}

function* handle_USER_SETTINGS_DELETE_BOUNDARY_REQUEST(action) {
  try {
    // needs mobile sqlite handling

    // get local storage
    const storedBoundaries = JSON.parse(localStorage.getItem('boundaries'));
    // filter by id
    const newBoundaries = storedBoundaries.filter((boundary) => {
      return boundary.id !== action.payload.id;
    });
    // set local storage
    localStorage.setItem('boundaries', JSON.stringify(newBoundaries));

    yield put({ type: USER_SETTINGS_DELETE_BOUNDARY_SUCCESS, payload: action.payload });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_DELETE_BOUNDARY_FAILURE, payload: action.payload });
  }
}

function* handle_USER_SETTINGS_DELETE_KML_REQUEST(action) {
  try {
    // needs offline handling
    const networkReturn = yield InvasivesAPI_Call('DELETE', `/api/admin-defined-shapes/`, {
      server_id: action.payload.server_id
    });

    if (networkReturn) {
      yield put({ type: USER_SETTINGS_DELETE_KML_SUCCESS, payload: action.payload });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_DELETE_KML_FAILURE, payload: action.payload });
  }
}

function* handle_USER_SETTINGS_SET_RECORD_SET_REQUEST(action) {
  try {
    const userSettings = yield select(selectUserSettings);
    let prev = userSettings?.recordSets;

    prev[action.payload.setName] = action.payload.updatedSet;

    const newAppState = localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: { ...prev } }));

    yield put({
      type: USER_SETTINGS_SET_RECORD_SET_SUCCESS,
      payload: { recordSets: prev, updatedSetName: action.payload.setName, updatedSet: action.payload.updatedSet }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_SET_RECORD_SET_FAILURE });
  }
}

function* handle_USER_SETTINGS_REMOVE_RECORD_SET_REQUEST(action) {
  try {
    const userSettings = yield select(selectUserSettings);
    let prev = userSettings?.recordSets;

    let newRecordSetState = {};

    Object.keys(prev).forEach((key) => {
      if (key !== action.payload.recordSetName) {
        newRecordSetState[key] = prev[key];
      }
    });

    const newAppState = localStorage.setItem(
      'appstate-invasivesbc',
      JSON.stringify({ recordSets: { ...newRecordSetState } })
    );

    yield put({
      type: USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS,
      payload: { recordSets: newRecordSetState, deletedID: action.payload.recordSetName }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_REMOVE_RECORD_SET_FAILURE });
  }
}

function* handle_USER_SETTINGS_ADD_RECORD_SET_REQUEST(action) {
  try {
    const userSettings = yield select(selectUserSettings);
    let prev = userSettings?.recordSets;

    const recordSets = {
      ...prev,
      [JSON.stringify(Number(Object.keys(prev)[Object.keys(prev).length - 1]) + 1)]: {
        recordSetType: action.payload.recordSetType,
        recordSetName: 'New Record Set',
        advancedFilters: [],
        gridFilters: {},
        drawOrder: Object.keys(prev).length + 1
      }
    };

    const newAppState = localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: { ...recordSets } }));

    yield put({ type: USER_SETTINGS_ADD_RECORD_SET_SUCCESS, payload: { recordSets: recordSets } });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_ADD_RECORD_SET_FAILURE });
  }
}

function* handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST(action) {
  const authState = yield select(selectAuth);

  const defaultRecordSet = {
    ['1']: {
      recordSetType: 'Activity',
      recordSetName: 'My Drafts',
      advancedFilters: [
        {
          filterField: 'created_by',
          filterValue: authState.username,
          filterKey: 'created_by' + authState.username
        },
        {
          filterField: 'record_status',
          filterValue: ActivityStatus.DRAFT,
          filterKey: 'record_status' + ActivityStatus.DRAFT
        }
      ]
    },
    ['2']: {
      recordSetType: 'Activity',
      recordSetName: 'All InvasivesBC Activities',
      drawOrder: 1,
      advancedFilters: []
    },
    ['3']: {
      recordSetType: 'POI',
      recordSetName: 'All IAPP Records',
      color: '#21f34f',
      drawOrder: 2,
      advancedFilters: []
    }
  };

  try {
    const oldID = localStorage.getItem('activeActivity');
    const IAPPID = localStorage.getItem('activeIAPP');
    // needs mobile later
    const oldAppState = JSON.parse(localStorage.getItem('appstate-invasivesbc'));
    const recordsExpandedState = JSON.parse(localStorage.getItem('records-expanded'));

    const recordSets = oldAppState?.recordSets ? oldAppState.recordSets : defaultRecordSet;
    const recordsExpanded = recordsExpandedState ? recordsExpandedState : false;

    yield put({
      type: USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
      payload: {
        activeActivity: oldID,
        activeIAPP: IAPPID,
        recordSets: recordSets,
        recordsExpanded: recordsExpanded
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_GET_INITIAL_STATE_FAILURE });
  }
}

function* handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST(action) {
  try {
    const newID = localStorage.setItem('activeActivity', action.payload.id);
    const newdesc = localStorage.setItem('activeActivityDescription', action.payload.description);

    yield put({
      type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
      payload: {
        ...action.payload,
        activeActivity: action.payload.id
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_FAILURE });
  }
}

function* handle_USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST(action) {
  try {
    const newID = localStorage.setItem('activeIAPP', action.payload.id);

    yield put({
      type: USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS,
      payload: { activeIAPP: action.payload.id }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_FAILURE });
  }
}

function* handle_USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST(action) {
  try {
    // Store value in localstorage if on web
    localStorage.setItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE', JSON.stringify(action.payload));
    // TODO: Store value in cached db on mobile
    yield put({
      type: USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS,
      payload: action.payload
    });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_FAILURE });
  }
}

function* handle_APP_AUTH_READY(action) {
  yield put({ type: USER_SETTINGS_GET_INITIAL_STATE_REQUEST });
}

function* handle_USER_SETTINGS_SET_DARK_THEME(action) {
  const { DEBUG } = yield select(selectConfiguration);
  if (DEBUG) {
    console.log(`Changing theme: dark mode-enable = ${action.payload.enabled}`);
  }
  localStorage.setItem('USER_SETTINGS_DARK_THEME', JSON.stringify(action.payload.enabled));
}

function* handle_USER_SETTINGS_SET_MAP_CENTER_REQUEST(action) {
  try {
    yield put({
      type: USER_SETTINGS_SET_MAP_CENTER_SUCCESS,
      payload: action.payload
    });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_SET_MAP_CENTER_FAILURE });
  }
}

function* userSettingsSaga() {
  yield all([
    takeEvery(AUTH_INITIALIZE_COMPLETE, handle_APP_AUTH_READY),
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_REQUEST, handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST),
    takeEvery(USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST, handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST),
    takeEvery(USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST, handle_USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST),
    takeEvery(
      USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST,
      handle_USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST
    ),
    takeEvery(USER_SETTINGS_ADD_RECORD_SET_REQUEST, handle_USER_SETTINGS_ADD_RECORD_SET_REQUEST),
    takeEvery(USER_SETTINGS_REMOVE_RECORD_SET_REQUEST, handle_USER_SETTINGS_REMOVE_RECORD_SET_REQUEST),
    takeEvery(USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST, handle_USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST),
    takeEvery(USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST, handle_USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST),
    takeEvery(USER_SETTINGS_SET_BOUNDARIES_REQUEST, handle_USER_SETTINGS_SET_BOUNDARIES_REQUEST),
    takeEvery(USER_SETTINGS_DELETE_BOUNDARY_REQUEST, handle_USER_SETTINGS_DELETE_BOUNDARY_REQUEST),
    takeEvery(USER_SETTINGS_DELETE_KML_REQUEST, handle_USER_SETTINGS_DELETE_KML_REQUEST),
    takeEvery(USER_SETTINGS_SET_RECORD_SET_REQUEST, handle_USER_SETTINGS_SET_RECORD_SET_REQUEST),
    takeEvery(USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST, handle_USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST),
    takeEvery(USER_SETTINGS_SET_DARK_THEME, handle_USER_SETTINGS_SET_DARK_THEME),
    takeEvery(USER_SETTINGS_SET_MAP_CENTER_REQUEST, handle_USER_SETTINGS_SET_MAP_CENTER_REQUEST)
  ]);
}

export default userSettingsSaga;
