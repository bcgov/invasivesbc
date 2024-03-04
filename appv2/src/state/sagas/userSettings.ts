import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { all, put, select, take, takeEvery } from 'redux-saga/effects';
import { ActivityStatus } from 'sharedAPI';
import { selectAuth } from 'state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';
import { selectUserSettings } from 'state/reducers/userSettings';
import {
  AUTH_INITIALIZE_COMPLETE,
  GET_API_DOC_FAILURE,
  GET_API_DOC_OFFLINE,
  GET_API_DOC_ONLINE,
  GET_API_DOC_REQUEST,
  GET_API_DOC_SUCCESS,
  RECORDSET_ADD_FILTER,
  RECORDSET_UPDATE_FILTER,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_FAILURE,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS,
  USER_SETTINGS_ADD_RECORD_SET,
  USER_SETTINGS_DELETE_BOUNDARY_FAILURE,
  USER_SETTINGS_DELETE_BOUNDARY_REQUEST,
  USER_SETTINGS_DELETE_BOUNDARY_SUCCESS,
  USER_SETTINGS_DELETE_KML_FAILURE,
  USER_SETTINGS_DELETE_KML_REQUEST,
  USER_SETTINGS_DELETE_KML_SUCCESS,
  USER_SETTINGS_GET_INITIAL_STATE_FAILURE,
  USER_SETTINGS_GET_INITIAL_STATE_REQUEST,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_FAILURE,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS,
  USER_SETTINGS_REMOVE_RECORD_SET,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_FAILURE,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST,
  USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS,
  USER_SETTINGS_SET_BOUNDARIES_FAILURE,
  USER_SETTINGS_SET_BOUNDARIES_REQUEST,
  USER_SETTINGS_SET_BOUNDARIES_SUCCESS,
  USER_SETTINGS_SET_DARK_THEME,
  USER_SETTINGS_SET_MAP_CENTER_FAILURE,
  USER_SETTINGS_SET_MAP_CENTER_REQUEST,
  USER_SETTINGS_SET_MAP_CENTER_SUCCESS,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_FAILURE,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS,
  USER_SETTINGS_SET_RECORDSET,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_FAILURE,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS
} from '../actions';

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

function* persistRecordSetsToLocalStorage(action) {
  const state = yield select(selectUserSettings);
  localStorage.setItem('appstate-invasivesbc', JSON.stringify({ recordSets: state.recordSets }));
}

function* handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST(action) {
  const authState = yield select(selectAuth);

  const defaultRecordSet = {
    ['1']: {
      recordSetType: 'Activity',
      recordSetName: 'My Drafts',
      // add draft key
      tableFilters: [
        {
          id: '1',
          field: 'form_status',
          filterType: 'tableFilter',
          filter: ActivityStatus.DRAFT
        }
      ],
      drawOrder: 1
    },
    ['2']: {
      recordSetType: 'Activity',
      recordSetName: 'All InvasivesBC Activities',
      drawOrder: 2
    },
    ['3']: {
      recordSetType: 'IAPP',
      recordSetName: 'All IAPP Records',
      color: '#21f34f',
      drawOrder: 3
    }
  };

  try {
    const oldID = localStorage.getItem('activeActivity');
    const oldDesc = localStorage.getItem('activeActivityDescription');
    const IAPPID = localStorage.getItem('activeIAPP');
    // needs mobile later
    const oldAppState = JSON.parse(localStorage.getItem('appstate-invasivesbc'));
    const recordsExpandedState = JSON.parse(localStorage.getItem('records-expanded'));

    const recordSets = oldAppState?.recordSets ? oldAppState.recordSets : defaultRecordSet;

    yield put({ type: GET_API_DOC_REQUEST });
    yield take(GET_API_DOC_SUCCESS);

    yield put({
      type: USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
      payload: {
        activeActivity: oldID,
        activeActivityDescription: oldDesc,
        activeIAPP: IAPPID,
        recordSets: recordSets
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
  if (action.payload.authenticated) yield put({ type: USER_SETTINGS_GET_INITIAL_STATE_REQUEST });
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

function* handle_GET_API_DOC_REQUEST(action) {
  const { connected } = yield select((state) => state.Network);

  if (connected) {
    yield put({ type: GET_API_DOC_ONLINE });
  } else {
    yield put({ type: GET_API_DOC_OFFLINE });
  }
}

function* handle_GET_API_DOC_OFFLINE(action) {
  const cachedAPISpec = localStorage.getItem('api-spec');
  if (cachedAPISpec) {
    yield put({
      type: GET_API_DOC_SUCCESS,
      payload: JSON.parse(cachedAPISpec)
    });
  } else {
    console.error('no cached API spec is available');
    yield put({
      type: GET_API_DOC_FAILURE
    });
  }
}

function* handle_GET_API_DOC_ONLINE(action) {
  try {
    const apiDocsWithSelectOptionsResponse = yield InvasivesAPI_Call(
      'GET',
      '/api/api-docs/',
      {},
      { filterForSelectable: 'true' }
    );
    const apiDocsWithViewOptionsResponse = yield InvasivesAPI_Call('GET', '/api/api-docs/');
    const apiDocsWithViewOptions = apiDocsWithViewOptionsResponse.data;
    const apiDocsWithSelectOptions = apiDocsWithSelectOptionsResponse.data;
    yield put({
      type: GET_API_DOC_SUCCESS,
      payload: { apiDocsWithViewOptions: apiDocsWithViewOptions, apiDocsWithSelectOptions: apiDocsWithSelectOptions }
    });
    localStorage.setItem(
      'api-spec',
      JSON.stringify({
        apiDocsWithViewOptions: apiDocsWithViewOptions,
        apiDocsWithSelectOptions: apiDocsWithSelectOptions
      })
    );
  } catch (e) {
    console.dir(e);
  }
}

function* userSettingsSaga() {
  yield all([
    takeEvery(AUTH_INITIALIZE_COMPLETE, handle_APP_AUTH_READY),
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_REQUEST, handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST),
    takeEvery(GET_API_DOC_REQUEST, handle_GET_API_DOC_REQUEST),
    takeEvery(GET_API_DOC_ONLINE, handle_GET_API_DOC_ONLINE),
    takeEvery(GET_API_DOC_OFFLINE, handle_GET_API_DOC_OFFLINE),
    takeEvery(USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST, handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST),
    takeEvery(USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST, handle_USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST),
    takeEvery(
      USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST,
      handle_USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST
    ),

    takeEvery(USER_SETTINGS_SET_RECORDSET, persistRecordSetsToLocalStorage),
    takeEvery(RECORDSET_ADD_FILTER, persistRecordSetsToLocalStorage),
    takeEvery(USER_SETTINGS_ADD_RECORD_SET, persistRecordSetsToLocalStorage),
    takeEvery(USER_SETTINGS_REMOVE_RECORD_SET, persistRecordSetsToLocalStorage),
    takeEvery(RECORDSET_UPDATE_FILTER, persistRecordSetsToLocalStorage),

    takeEvery(USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST, handle_USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST),
    takeEvery(USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST, handle_USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST),
    takeEvery(USER_SETTINGS_SET_BOUNDARIES_REQUEST, handle_USER_SETTINGS_SET_BOUNDARIES_REQUEST),
    takeEvery(USER_SETTINGS_DELETE_BOUNDARY_REQUEST, handle_USER_SETTINGS_DELETE_BOUNDARY_REQUEST),
    takeEvery(USER_SETTINGS_DELETE_KML_REQUEST, handle_USER_SETTINGS_DELETE_KML_REQUEST),
    takeEvery(USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST, handle_USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST),
    takeEvery(USER_SETTINGS_SET_DARK_THEME, handle_USER_SETTINGS_SET_DARK_THEME),
    takeEvery(USER_SETTINGS_SET_MAP_CENTER_REQUEST, handle_USER_SETTINGS_SET_MAP_CENTER_REQUEST)
  ]);
}

export default userSettingsSaga;
