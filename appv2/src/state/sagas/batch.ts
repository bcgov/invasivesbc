import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { selectAuth } from 'state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';
import {
  BATCH_CREATE_REQUEST, BATCH_CREATE_REQUEST_WITH_CALLBACK,
  BATCH_CREATE_SUCCESS, BATCH_EXECUTE_REQUEST, BATCH_EXECUTE_SUCCESS,
  BATCH_DELETE_REQUEST,
  BATCH_DELETE_SUCCESS,
  BATCH_LIST_REQUEST,
  BATCH_LIST_SUCCESS,
  BATCH_RETRIEVE_REQUEST,
  BATCH_RETRIEVE_SUCCESS, BATCH_TEMPLATE_DOWNLOAD_CSV_REQUEST,
  BATCH_TEMPLATE_DOWNLOAD_REQUEST,
  BATCH_TEMPLATE_DOWNLOAD_SUCCESS,
  BATCH_TEMPLATE_LIST_REQUEST,
  BATCH_TEMPLATE_LIST_SUCCESS, BATCH_UPDATE_REQUEST, BATCH_UPDATE_SUCCESS, BATCH_DELETE_ERROR
} from '../actions';
import { Http } from '@capacitor-community/http';
import { actions } from 'components/map/LayerPicker/JSON/actions';

function* listBatches(action) {
  yield call(listTemplates, action);
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);

  const { data } = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/batch`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    }
  });

  yield put({ type: BATCH_LIST_SUCCESS, payload: data.result });
}

function* getBatch(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);
  const { id } = action.payload;

  const { data } = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/batch/` + encodeURIComponent(id),
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    }
  });
  yield put({ type: BATCH_RETRIEVE_SUCCESS, payload: data.result });
}

function* createBatch(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);

  const { data } = yield Http.request({
    method: 'POST',
    url: configuration.API_BASE + `/api/batch`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    },
    data: action.payload
  });

  yield put({ type: BATCH_CREATE_SUCCESS, payload: data });
}

function* createBatchWithCallback(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);

  const { resolve, reject } = action.payload;

  const { data } = yield Http.request({
    method: 'POST',
    url: configuration.API_BASE + `/api/batch`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    },
    data: action.payload
  });

  yield put({ type: BATCH_CREATE_SUCCESS, payload: data });
  yield call(resolve, data.batchId);
}

function* updateBatch(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);
  const { id } = action.payload;

  const { data } = yield Http.request({
    method: 'PUT',
    url: configuration.API_BASE + `/api/batch/${id}`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    },
    data: action.payload
  });

  yield put({ type: BATCH_UPDATE_SUCCESS, payload: data });
  yield put({ type: BATCH_RETRIEVE_REQUEST, payload: { id } });
}

function* deleteBatch(action: any) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);
  const { id } = action.payload;

  const { data } = yield Http.request({
    method: 'DELETE',
    url: configuration.API_BASE + `/api/batch/${id}`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    },
    data: action.payload
  });
  if (data.code < 200 || data.code > 299) {
    yield put({ type: BATCH_DELETE_ERROR, payload: data });
    return;
  }
  yield put({ type: BATCH_DELETE_SUCCESS, payload: data });
}

function* listTemplates(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);

  const { data } = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/batch/templates`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    }
  });

  yield put({ type: BATCH_TEMPLATE_LIST_SUCCESS, payload: data });
}

function* templateCSV(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);

  const { key, resolve } = action.payload;

  const { data } = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/batch/templates/${key}`,
    headers: {
      Authorization: requestHeaders.authorization,
      Accept: 'text/csv'
    }
  });

  yield call(resolve, data);
}

function* templateDetail(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);

  const { data } = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/batch/templates/${action.payload.key}`,
    headers: {
      Authorization: requestHeaders.authorization,
      Accept: 'application/json'
    }
  });

  yield put({
    type: BATCH_TEMPLATE_DOWNLOAD_SUCCESS,
    payload: {
      key: action.payload.key,
      data
    }
  });
}

function* executeBatch(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);
  const { id } = action.payload;

  const { data } = yield Http.request({
    method: 'POST',
    url: configuration.API_BASE + `/api/batch/${id}/execute`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    },
    data: {
      desiredActivityState: action.payload.desiredActivityState,
      treatmentOfErrorRows: action.payload.treatmentOfErrorRows
    }
  });

  yield put({ type: BATCH_EXECUTE_SUCCESS, payload: data });
  yield put({ type: BATCH_RETRIEVE_REQUEST, payload: { id } });

};

function* batchSaga() {
  yield all([
    takeEvery(BATCH_LIST_REQUEST, listBatches),
    takeLatest(BATCH_RETRIEVE_REQUEST, getBatch),
    takeEvery(BATCH_CREATE_REQUEST, createBatch),
    takeEvery(BATCH_UPDATE_REQUEST, updateBatch),
    takeEvery(BATCH_DELETE_REQUEST, deleteBatch),
    takeEvery(BATCH_DELETE_SUCCESS, listBatches),
    takeLatest(BATCH_TEMPLATE_LIST_REQUEST, listTemplates),
    takeEvery(BATCH_TEMPLATE_DOWNLOAD_REQUEST, templateDetail),
    takeLatest(BATCH_TEMPLATE_DOWNLOAD_CSV_REQUEST, templateCSV),
    takeLatest(BATCH_CREATE_REQUEST_WITH_CALLBACK, createBatchWithCallback),
    takeLatest(BATCH_EXECUTE_REQUEST, executeBatch)
  ]);
}

export default batchSaga;