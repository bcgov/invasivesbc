import { all, put, select, take, takeEvery } from 'redux-saga/effects';
import { ActivityStatus } from 'sharedAPI';
import {
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE,
  AUTH_INITIALIZE_COMPLETE,
  GET_API_DOC_ONLINE,
  GET_API_DOC_REQUEST,
  GET_API_DOC_SUCCESS
} from '../actions';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { selectUserSettings } from 'state/reducers/userSettings';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';

function* handle_USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST(action) {
  yield put(UserSettings.toggleRecordExpandSuccess());
}

function* handle_USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST(action) {
  try {
    const userSettings = yield select(selectUserSettings);
    const sets = userSettings.recordSets;
    const current = sets[action.payload.setName];

    yield put(UserSettings.Boundaries.removeFromSetSuccess(sets));
  } catch (e) {
    console.error(e);
    yield put(UserSettings.Boundaries.removeFromSetFailure());
  }
}

function* handle_USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST(action) {
  try {
    const userSettings = yield select(selectUserSettings);
    const sets = userSettings.recordSets;
    const current = sets[action.payload.setName];

    const boundary = JSON.parse(action.payload?.searchedBoundary);
    const patchedBoundary = { ...boundary, geos: boundary?.server_id ? [] : [...boundary?.geos] };
    current.searchBoundary = patchedBoundary;

    yield put(UserSettings.Boundaries.addToSetSuccess(sets));
  } catch (e) {
    console.error(e);
    yield put(UserSettings.Boundaries.addToSetFailure());
  }
}

function* handle_USER_SETTINGS_SET_BOUNDARIES_REQUEST(action) {
  try {
    if (action.payload.boundaries !== null) {
      // can't set local storage on kml set since some are too big...
      yield put(UserSettings.Boundaries.setSuccess(action.payload));
    }
  } catch (e) {
    console.error(e);
    yield put(UserSettings.Boundaries.setFailure(action.payload));
  }
}

function* handle_USER_SETTINGS_DELETE_BOUNDARY_REQUEST(action) {
  yield put(UserSettings.Boundaries.deleteSuccess(action.payload));
}

function* handle_USER_SETTINGS_DELETE_KML_REQUEST(action) {
  try {
    // needs offline handling
    const networkReturn = yield InvasivesAPI_Call('DELETE', `/api/admin-defined-shapes/`, {
      server_id: action.payload
    });

    if (networkReturn) {
      yield put(UserSettings.KML.deleteSuccess(action.payload));
    }
  } catch (e) {
    console.error(e);
    yield put(UserSettings.KML.deleteFailure(action.payload));
  }
}

function* handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST(action) {
  const { recordSets } = yield select(selectUserSettings);

  const defaultRecordSet = {
    '1': {
      recordSetType: RecordSetType.Activity,
      recordSetName: 'My Drafts',
      // add draft key
      tableFilters: [
        {
          id: '1',
          field: 'form_status',
          filterType: 'tableFilter',
          filter: ActivityStatus.DRAFT,
          operator: 'CONTAINS',
          operator2: 'AND'
        }
      ],
      colorScheme: {
        Biocontrol: '#845ec2',
        FREP: '#de852c',
        Monitoring: '#2138e0',
        Observation: '#399c3e',
        Treatment: '#c6c617'
      },
      drawOrder: 1
    },
    '2': {
      recordSetType: RecordSetType.Activity,
      recordSetName: 'All InvasivesBC Activities',
      colorScheme: {
        Biocontrol: '#845ec2',
        FREP: '#de852c',
        Monitoring: '#2138e0',
        Observation: '#399c3e',
        Treatment: '#c6c617'
      },
      drawOrder: 2
    },
    '3': {
      recordSetType: RecordSetType.IAPP,
      recordSetName: 'All IAPP Records',
      color: '#21f34f',
      drawOrder: 3
    }
  };

  yield put({ type: GET_API_DOC_REQUEST });
  yield take(GET_API_DOC_SUCCESS);
  yield put({ type: ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE });
  UserSettings.InitState.getSuccess({ ...defaultRecordSet, ...recordSets });
}

function* handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST(action) {
  yield put(UserSettings.Activity.setActiveActivityIdSuccess(action.payload));
}

function* handle_USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST(action) {
  yield put(UserSettings.IAPP.setActiveSuccess(action.payload));
}

function* handle_USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST(action) {
  yield put(UserSettings.setNewRecordDialogueStateSuccess());
}

function* handle_APP_AUTH_READY(action) {
  if (action.payload.authenticated) yield put(UserSettings.InitState.get());
}

function* handle_USER_SETTINGS_SET_DARK_THEME(action) {}

function* handle_USER_SETTINGS_SET_MAP_CENTER_REQUEST(action) {
  try {
    yield put(UserSettings.Map.setCenterSuccess(action.payload));
  } catch (e) {
    console.error(e);
    yield put(UserSettings.Map.setCenterFailure);
  }
}

function* handle_GET_API_DOC_REQUEST(action) {
  yield put({ type: GET_API_DOC_ONLINE });
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
  } catch (e) {
    console.dir(e);
  }
}

function* userSettingsSaga() {
  yield all([
    takeEvery(AUTH_INITIALIZE_COMPLETE, handle_APP_AUTH_READY),
    takeEvery(GET_API_DOC_REQUEST, handle_GET_API_DOC_REQUEST),
    takeEvery(GET_API_DOC_ONLINE, handle_GET_API_DOC_ONLINE),
    takeEvery(UserSettings.InitState.get, handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST),
    takeEvery(UserSettings.Activity.setActiveActivityId, handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST),
    takeEvery(UserSettings.IAPP.setActive, handle_USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST),
    takeEvery(UserSettings.setNewRecordDialogueState, handle_USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST),

    takeEvery(UserSettings.Boundaries.addToSet, handle_USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST),
    takeEvery(UserSettings.Boundaries.removeFromSet, handle_USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST),
    takeEvery(UserSettings.Boundaries.set, handle_USER_SETTINGS_SET_BOUNDARIES_REQUEST),
    takeEvery(UserSettings.Boundaries.delete, handle_USER_SETTINGS_DELETE_BOUNDARY_REQUEST),
    takeEvery(UserSettings.KML.delete, handle_USER_SETTINGS_DELETE_KML_REQUEST),
    takeEvery(UserSettings.toggleRecordExpand, handle_USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST),
    takeEvery(UserSettings.Theme.setDark, handle_USER_SETTINGS_SET_DARK_THEME),
    takeEvery(UserSettings.Map.setCenter, handle_USER_SETTINGS_SET_MAP_CENTER_REQUEST)
  ]);
}

export default userSettingsSaga;
