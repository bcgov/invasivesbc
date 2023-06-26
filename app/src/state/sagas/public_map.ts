import { all, put, select, takeLatest } from 'redux-saga/effects';
import { PUBLIC_MAP_LOAD_ALL_REQUEST, PUBLIC_MAP_LOAD_ALL_REQUEST_COMPLETE } from '../actions';
import { selectConfiguration } from '../reducers/configuration';
import { Http } from '@capacitor-community/http';

function* loadAll() {
  const configuration = yield select(selectConfiguration);

  const activitiesResponse = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/public-map/activities`
  });

  const activities = activitiesResponse.data;

  const IAPPResponse = yield Http.request({
    method: 'GET',
    headers: {
      'Accept-Encoding': 'gzip, deflate, br'
    },

    url: 'https://nrs.objectstore.gov.bc.ca/seeds/iapp_geojson_gzip.gz'
  });

  const iapp = IAPPResponse.data;

  yield put({
    type: PUBLIC_MAP_LOAD_ALL_REQUEST_COMPLETE,
    payload: {
      activities,
      iapp: JSON.parse(iapp)
    }
  });
}

function* publicMapSaga() {
  yield all([takeLatest(PUBLIC_MAP_LOAD_ALL_REQUEST, loadAll)]);
}

export default publicMapSaga;
