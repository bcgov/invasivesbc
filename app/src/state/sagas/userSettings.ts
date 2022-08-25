import { all, call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { 
  AUTH_INITIALIZE_COMPLETE, 
  USER_SETTINGS_ADD_RECORD_SET_FAILURE, 
  USER_SETTINGS_ADD_RECORD_SET_REQUEST, 
  USER_SETTINGS_ADD_RECORD_SET_SUCCESS, 
  USER_SETTINGS_GET_INITIAL_STATE_FAILURE, 
  USER_SETTINGS_GET_INITIAL_STATE_REQUEST, 
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, 
  USER_SETTINGS_REMOVE_RECORD_SET_FAILURE, 
  USER_SETTINGS_REMOVE_RECORD_SET_REQUEST, 
  USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS, 
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_FAILURE, 
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST, 
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS, 
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_FAILURE,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST, 
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS 
} from '../actions';
import { ActivityStatus } from 'constants/activities';
import { selectAuth } from 'state/reducers/auth';

function* handle_USER_SETTINGS_REMOVE_RECORD_SET_REQUEST(action) {
  try {
    // retrieve previous record sets
    const oldAppState = JSON.parse(localStorage.getItem('appstate-invasivesbc'));
    const prev = oldAppState.recordSets;

    let newRecordSetState = {};

    Object.keys(prev).forEach((key) => {
      if (key !== action.payload.recordSetName) {
        newRecordSetState[key] = prev[key];
      }
    });

    oldAppState.recordSets = newRecordSetState;

    const newAppState = localStorage.setItem('appstate-invasivesbc', JSON.stringify(oldAppState));

    yield put({ type: USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS, payload: { recordSets: newRecordSetState } });
  } catch(e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_REMOVE_RECORD_SET_FAILURE });
  }
}

function* handle_USER_SETTINGS_ADD_RECORD_SET_REQUEST(action) {
  try {
    // retrieve previous record sets
    const oldAppState = JSON.parse(localStorage.getItem('appstate-invasivesbc'));
    const prev = oldAppState.recordSets;
    const recordSets = {
      ...prev,
      [JSON.stringify(Object.keys(prev).length + 1)]: {
        recordSetType: action.payload.recordSetType,
        recordSetName: 'New Record Set',
        advancedFilters: [],
        gridFilters: {},
        drawOrder: Object.keys(prev).length + 1
      }
    }
    oldAppState.recordSets = recordSets;
    
    // update app state
    const newAppState = localStorage.setItem('appstate-invasivesbc', JSON.stringify(oldAppState));

    yield put({ type: USER_SETTINGS_ADD_RECORD_SET_SUCCESS, payload: { recordSets: recordSets } });
  } catch(e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_ADD_RECORD_SET_FAILURE });
  }
}

function* handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST(action) {
  const username = select(selectAuth);

  const defaultRecordSet = {
    ['1']: {
      recordSetType: 'Activity',
      recordSetName: 'My Drafts',
      advancedFilters: [
        {
          filterField: 'created_by',
          filterValue: username,
          filterKey: 'created_by' + username
        },
        {
          filterField: 'record_status',
          filterValue: ActivityStatus.DRAFT,
          filterKey: 'record_status' + ActivityStatus.DRAFT
        }
      ]
    },
    ['2']: {
      recordSetType: "Activity",
      recordSetName: 'All InvasivesBC Activities',
      advancedFilters: []
    },
    ['3']: {
      recordSetType: "POI",
      recordSetName: 'All IAPP Records',
      advancedFilters: []
    }
  }

  try {
    const oldID = localStorage.getItem('activeActivity');
    // needs mobile later
    const oldAppState = JSON.parse(localStorage.getItem('appstate-invasivesbc'));

    const recordSets = oldAppState.recordSets ? oldAppState.recordSets : defaultRecordSet;
    
    yield put({ type: USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, payload: { activeActivity: oldID, recordSets: recordSets} });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_GET_INITIAL_STATE_FAILURE });
  }
}

function* handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST(action) {
  try {
    const newID = localStorage.setItem('activeActivity', action.payload.activeActivity);

    yield put({
      type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
      payload: { activeActivity: action.payload.activeActivity }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_FAILURE });
  }
}

function* handle_USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST(action) {
  try {
    console.log('SAGA HIT! ');
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

function* userSettingsSaga() {
  yield all([
    takeEvery(AUTH_INITIALIZE_COMPLETE, handle_APP_AUTH_READY),
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_REQUEST, handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST),
    takeEvery(USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST, handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST),
    takeEvery(
      USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST,
      handle_USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST
    ),
    takeEvery(USER_SETTINGS_ADD_RECORD_SET_REQUEST , handle_USER_SETTINGS_ADD_RECORD_SET_REQUEST),
    takeEvery(USER_SETTINGS_REMOVE_RECORD_SET_REQUEST , handle_USER_SETTINGS_REMOVE_RECORD_SET_REQUEST)
  ]);
}

export default userSettingsSaga;
