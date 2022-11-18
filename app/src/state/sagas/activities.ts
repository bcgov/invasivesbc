import { all, call, delay, put, select, throttle, takeEvery, takeLatest } from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import {
  USER_SETTINGS_SET_RECORD_SET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_REQUEST,
  ACTIVITIES_TABLE_ROW_GET_REQUEST,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_TABLE_ROW_GET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_ONLINE,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  IAPP_GEOJSON_GET_REQUEST,
  IAPP_GEOJSON_GET_ONLINE,
  IAPP_TABLE_ROWS_GET_REQUEST,
  IAPP_TABLE_ROWS_GET_ONLINE,
  IAPP_TABLE_ROWS_GET_SUCCESS,
  IAPP_RECORDSET_ID_LIST_GET_SUCCESS
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import {
  handle_ACTIVITIES_GEOJSON_GET_REQUEST,
  handle_IAPP_GEOJSON_GET_REQUEST,
  handle_IAPP_TABLE_ROWS_GET_REQUEST
} from './activities/dataAccess';
import {
  handle_ACTIVITIES_GEOJSON_GET_ONLINE,
  handle_IAPP_GEOJSON_GET_ONLINE,
  handle_IAPP_TABLE_ROWS_GET_ONLINE
} from './activities/online';
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
    action.payload.updatedSet.recordSetType === 'POI' ? true : false,
    action.payload.updatedSet.gridFilters,
    0,
    200000
  );

  const layerState = {
    color: action.payload.updatedSet.color,
    drawOrder: action.payload.updatedSet.drawOrder,
    enabled: action.payload.updatedSet.mapToggle
  };

  if (action.payload.updatedSet.recordSetType === 'POI') {
    yield put({
      type: IAPP_TABLE_ROWS_GET_REQUEST,
      payload: {
        recordSetID: action.payload.updatedSetName,
        IAPPFilterCriteria: filterCriteria
      }
    });
    yield put({
      type: IAPP_GEOJSON_GET_REQUEST,
      payload: {
        recordSetID: action.payload.updatedSetName,
        IAPPFilterCriteria: filterCriteria,
        layerState: layerState
      }
    });
  } else {
    yield put({
      type: ACTIVITIES_GEOJSON_GET_REQUEST,
      payload: {
        recordSetID: action.payload.updatedSetName,
        activitiesFilterCriteria: filterCriteria,
        layerState: layerState
      }
    });
  }
  //uyield put({ type: ACTIVITIES_TABLE_ROW_GET_REQUEST, payload: {} });
}

function* handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS(action) {
  const authState = yield select(selectAuth);
  const sets = {};
  sets['2'] = action.payload.recordSets[2];
  sets['3'] = action.payload.recordSets[3];
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

  const IAPP_filter = yield getSearchCriteriaFromFilters(
    action.payload.recordSets[3].advancedFilterRows,
    authState.accessRoles,
    sets,
    '3',
    true,
    action.payload.recordSets[3].gridFilters,
    0,
    200000
  );

  const layerState = {
    color: action.payload.recordSets[2].color,
    drawOrder: action.payload.recordSets[2].drawOrder,
    enabled: true
  };

  const IAPPlayerState = {
    color: action.payload.recordSets[3].color,
    drawOrder: action.payload.recordSets[3].drawOrder,
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

  yield put({
    type: IAPP_GEOJSON_GET_REQUEST,
    payload: {
      recordSetID: '3',
      IAPPFilterCriteria: IAPP_filter,
      layerState: IAPPlayerState
    }
  });

  // TODO: get iapp geojson event
}

function* handle_IAPP_TABLE_ROWS_GET_SUCCESS(action) {
  const IDList = action.payload.IAPPTableRows.map((row) => {
    return row.point_of_interest_payload.form_data.point_of_interest_type_data.site_id;
  });

  yield put({
    type: IAPP_RECORDSET_ID_LIST_GET_SUCCESS,
    payload: { recordSetID: action.payload.recordSetID, ids: IDList }
  });
}

function* activitiesPageSaga() {
  yield all([
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(USER_SETTINGS_SET_RECORD_SET_SUCCESS, handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS),
    takeEvery(ACTIVITIES_GEOJSON_GET_REQUEST, handle_ACTIVITIES_GEOJSON_GET_REQUEST),
    takeEvery(IAPP_GEOJSON_GET_REQUEST, handle_IAPP_GEOJSON_GET_REQUEST),
    takeEvery(IAPP_TABLE_ROWS_GET_REQUEST, handle_IAPP_TABLE_ROWS_GET_REQUEST),
    takeEvery(IAPP_TABLE_ROWS_GET_ONLINE, handle_IAPP_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_ONLINE, handle_IAPP_GEOJSON_GET_ONLINE),
    takeEvery(ACTIVITIES_GEOJSON_GET_ONLINE, handle_ACTIVITIES_GEOJSON_GET_ONLINE),
    takeEvery(IAPP_TABLE_ROWS_GET_SUCCESS, handle_IAPP_TABLE_ROWS_GET_SUCCESS),
    takeEvery(ACTIVITIES_TABLE_ROW_GET_REQUEST, () => console.log('ACTIVITY_LINK_RECORD_REQUEST'))
  ]);
}

export default activitiesPageSaga;
