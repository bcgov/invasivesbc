import { all, call, delay, put, select, throttle, takeEvery, takeLatest } from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import {
  USER_SETTINGS_SET_RECORD_SET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_REQUEST,
  ACTIVITIES_TABLE_ROW_GET_REQUEST,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_TABLE_ROW_GET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_ONLINE
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import { handle_ACTIVITIES_GEOJSON_GET_REQUEST } from './activities/dataAccess';
import { handle_ACTIVITIES_GEOJSON_GET_ONLINE } from './activities/online';

function* handle_ACTIVITY_DEBUG(action) {
  console.log('halp');
}
function* handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS(action) {
  //recordSets.filter(recordSetName
  yield put({ type: ACTIVITIES_GEOJSON_GET_REQUEST, payload: {} });
  yield put({ type: ACTIVITIES_TABLE_ROW_GET_REQUEST, payload: {} });
}
function* activitiesPageSaga() {
  yield all([
    takeEvery(USER_SETTINGS_SET_RECORD_SET_SUCCESS, handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS),
    takeEvery(ACTIVITIES_GEOJSON_GET_REQUEST, handle_ACTIVITIES_GEOJSON_GET_REQUEST),
    takeEvery(ACTIVITIES_GEOJSON_GET_ONLINE, handle_ACTIVITIES_GEOJSON_GET_ONLINE),
    takeEvery(ACTIVITIES_TABLE_ROW_GET_REQUEST, () => console.log('ACTIVITY_LINK_RECORD_REQUEST'))
  ]);
}

export default activitiesPageSaga;
