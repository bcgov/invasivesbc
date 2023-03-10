import {all, put, select, takeEvery} from 'redux-saga/effects';
import {selectAuth} from 'state/reducers/auth';
import {selectConfiguration} from 'state/reducers/configuration';
import {BATCH_LIST_REQUEST, BATCH_LIST_SUCCESS, BATCH_RETRIEVE_REQUEST, BATCH_RETRIEVE_SUCCESS} from '../actions';
import {Http} from "@capacitor-community/http";

function* listBatches(action) {

  const configuration = yield select(selectConfiguration);
  const {requestHeaders} = yield select(selectAuth);

  const {data} = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/batch`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    }
  });

  yield put({type: BATCH_LIST_SUCCESS, payload: data.result});
}

function* getBatch(action) {

  const configuration = yield select(selectConfiguration);
  const auth = yield select(selectAuth);
  const {id} = action.payload;

  const {data} = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/batch/` + encodeURIComponent(id),
    headers: {
      Authorization: auth.authorization,
      'Content-Type': 'application/json'
    }
  });

  yield put({type: BATCH_RETRIEVE_SUCCESS, payload: data});

}

function* batchSaga() {
  yield all([
    takeEvery(BATCH_LIST_REQUEST, listBatches),
    takeEvery(BATCH_RETRIEVE_REQUEST, getBatch)
  ]);
}

export default batchSaga;
