import { all, put, select, takeEvery } from 'redux-saga/effects';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { selectUserSettings } from 'state/reducers/userSettings';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import Activity from 'state/actions/activity/Activity';
import { AuthActions } from 'state/actions/auth/Auth';
import { APIDocs } from 'state/actions/userSettings/APIDocs';
import { selectAuth } from 'state/reducers/auth';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { RepositoryMetadata } from 'utils/record-cache';
import defaultRecordSets from 'constants/defaultRecordSets';
import { RootState } from 'state/reducers/rootReducer';

function* handle_USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST() {
  yield put(UserSettings.toggleRecordExpandSuccess());
}

function* handle_USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST() {
  try {
    const userSettings = yield select(selectUserSettings);
    const sets = userSettings.recordSets;

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
    current.searchBoundary = { ...boundary, geos: boundary?.server_id ? [] : [...boundary?.geos] };

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

    if (networkReturn?.ok) {
      yield put(UserSettings.KML.deleteSuccess(action.payload));
    }
  } catch (e) {
    console.error(e);
    yield put(UserSettings.KML.deleteFailure(action.payload));
  }
}

function* handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST(action) {
  if (!UserSettings.InitState.get.match(action)) {
    return;
  }
  
  const { recordSets } = yield select(selectUserSettings);

  const recordsetCacheEnabled: boolean = yield select(
    (state: RootState) => state.Configuration.current.features.CACHE_RECORDSETS.enabled
  );

  const defaultRecordSet = defaultRecordSets;
  // add offline activities for mobile
  if (recordsetCacheEnabled) {
    // RecordSets are empty, try to recover whats in the local database
    const service = yield RecordCacheServiceFactory.getPlatformInstance();
    const repos = yield service.listRepositories(['filter_objects', 'status', 'record_set_type', 'set_id']);
    repos.forEach((repo: RepositoryMetadata) => {
      // recordSet is immutable, so append it to defaultRecordSet
      if (repo.status === UserRecordCacheStatus.CACHED && !defaultRecordSet[repo.set_id]) {
        const backedUpRecordSet = UserSettings.RecordSet.createDefaultRecordset(repo.record_set_type, repo?.set_id);
        backedUpRecordSet.tableFilters = repo?.filter_objects?.tableFilters;
        backedUpRecordSet.id = repo?.set_id;
        backedUpRecordSet.cacheMetadataStatus = repo.status;
        backedUpRecordSet.recordSetName = repo.set_name ?? '';
        defaultRecordSet[repo.set_id] ??= backedUpRecordSet;
      }
    });
  }

  if (action?.payload?.offlineAPIDocsDisplayName) {
    yield put(APIDocs.load({ displayName: action.payload.offlineAPIDocsDisplayName }));
  } else {
    yield put(APIDocs.getRequest());
  }
  yield put(Activity.Suggestions.biocontrolOnline());
  yield put(UserSettings.InitState.getSuccess({ ...defaultRecordSet, ...recordSets }));
}

function* handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST(action) {
  yield put(UserSettings.Activity.setActiveActivityIdSuccess(action.payload));
}

function* handle_USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST(action) {
  yield put(UserSettings.IAPP.setActiveSuccess(action.payload));
}

function* handle_APP_AUTH_READY(action) {
  if (action.payload.authenticated) yield put(UserSettings.InitState.get());
}

function* handle_USER_SETTINGS_SET_MAP_CENTER_REQUEST(action) {
  try {
    yield put(UserSettings.Map.setCenterSuccess(action.payload));
  } catch (e) {
    console.error(e);
    yield put(UserSettings.Map.setCenterFailure);
  }
}

function* handle_GET_API_DOC_REQUEST() {
  const { displayName } = yield select(selectAuth);

  const apiDocsWithSelectOptionsResponse = yield InvasivesAPI_Call(
    'GET',
    '/api/api-docs/',
    {},
    { filterForSelectable: 'true' }
  );
  const apiDocsWithViewOptionsResponse = yield InvasivesAPI_Call('GET', '/api/api-docs/');
  if (apiDocsWithViewOptionsResponse?.ok && apiDocsWithSelectOptionsResponse?.ok) {
    const apiDocsWithViewOptions = apiDocsWithViewOptionsResponse.data;
    const apiDocsWithSelectOptions = apiDocsWithSelectOptionsResponse.data;

    yield put(
      APIDocs.set({
        apiDocsWithViewOptions: apiDocsWithViewOptions,
        apiDocsWithSelectOptions: apiDocsWithSelectOptions
      })
    );
    if (displayName) {
      yield put(APIDocs.save({ displayName }));
    }
  }
}

function* userSettingsSaga() {
  yield all([
    takeEvery(AuthActions.initializeComplete.type, handle_APP_AUTH_READY),
    takeEvery(APIDocs.getRequest.type, handle_GET_API_DOC_REQUEST),
    takeEvery(UserSettings.InitState.get, handle_USER_SETTINGS_GET_INITIAL_STATE_REQUEST),
    takeEvery(UserSettings.Activity.setActiveActivityId, handle_USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST),
    takeEvery(UserSettings.IAPP.setActive, handle_USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST),
    takeEvery(UserSettings.Boundaries.addToSet, handle_USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST),
    takeEvery(UserSettings.Boundaries.removeFromSet, handle_USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST),
    takeEvery(UserSettings.Boundaries.set, handle_USER_SETTINGS_SET_BOUNDARIES_REQUEST),
    takeEvery(UserSettings.Boundaries.delete, handle_USER_SETTINGS_DELETE_BOUNDARY_REQUEST),
    takeEvery(UserSettings.KML.delete, handle_USER_SETTINGS_DELETE_KML_REQUEST),
    takeEvery(UserSettings.toggleRecordExpand, handle_USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST),
    takeEvery(UserSettings.Map.setCenter, handle_USER_SETTINGS_SET_MAP_CENTER_REQUEST)
  ]);
}

export default userSettingsSaga;
