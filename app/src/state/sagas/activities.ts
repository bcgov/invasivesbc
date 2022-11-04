import { all, call, delay, put, select, throttle, takeEvery, takeLatest } from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import {
  USER_SETTINGS_SET_RECORD_SET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_REQUEST,
  ACTIVITIES_TABLE_ROW_GET_REQUEST,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_TABLE_ROW_GET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_ONLINE,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import { handle_ACTIVITIES_GEOJSON_GET_REQUEST } from './activities/dataAccess';
import { handle_ACTIVITIES_GEOJSON_GET_ONLINE } from './activities/online';
import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { selectAuth } from 'state/reducers/auth';

function* handle_ACTIVITY_DEBUG(action) {
  console.log('halp');
}
function* handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS(action) {
  //recordSets.filter(recordSetName
  /* export const getSearchCriteriaFromFilters = (
    advancedFilterRows: any,
    rolesUserHasAccessTo: any,
    recordSets: any,
    setName: string,
    isIAPP: boolean,
    gridFilters: any,
    page: number,
    limit: number,
    sortColumns: readonly SortColumn[]
  ) => {*/
  const authState = yield select(selectAuth);
  const sets = {};
  sets[action.payload.updatedSetName] = action.payload.updatedSet;
  const filterCriteria = yield getSearchCriteriaFromFilters(
    action.payload.updatedSet.advancedFilterRows,
    authState.accessRoles,
    sets,
    action.payload.updatedSetName,
    false,
    action.payload.updatedSet.gridFilters,
    0,
    999
  );

  const layerState = {
    color: action.payload.updatedSet.color,
    drawOrder: action.payload.updatedSet.drawOrder,
    enabled: true
  };

  yield put({
    type: ACTIVITIES_GEOJSON_GET_REQUEST,
    payload: {
      recordSetID: action.payload.updatedSetName,
      activitiesFilterCriteria: filterCriteria,
      layerState: layerState
    }
  });
  //uyield put({ type: ACTIVITIES_TABLE_ROW_GET_REQUEST, payload: {} });
}

function* handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS(action) {
  const authState = yield select(selectAuth);
  const sets = {};
  sets['2'] = action.payload.recordSets[2];
  const filterCriteria = yield getSearchCriteriaFromFilters(
    action.payload.recordSets[2].advancedFilterRows,
    authState.accessRoles,
    sets,
    '2',
    false,
    action.payload.recordSets[2].gridFilters,
    0,
    999
  );

  const layerState = {
    color: action.payload.recordSets[2].color,
    drawOrder: action.payload.recordSets[2].drawOrder,
    enabled: true
  };

  yield put({
    type: ACTIVITIES_GEOJSON_GET_REQUEST,
    payload: {
      recordSetID: '2',
      activitiesFilterCriteria: filterCriteria,
      layerState: layerState
    }
  });
  //uyield put({ type: ACTIVITIES_TABLE_ROW_GET_REQUEST, payload: {} });
}

function* activitiesPageSaga() {
  yield all([
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(USER_SETTINGS_SET_RECORD_SET_SUCCESS, handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS),
    takeEvery(ACTIVITIES_GEOJSON_GET_REQUEST, handle_ACTIVITIES_GEOJSON_GET_REQUEST),
    takeEvery(ACTIVITIES_GEOJSON_GET_ONLINE, handle_ACTIVITIES_GEOJSON_GET_ONLINE),
    takeEvery(ACTIVITIES_TABLE_ROW_GET_REQUEST, () => console.log('ACTIVITY_LINK_RECORD_REQUEST'))
  ]);
}

export default activitiesPageSaga;
