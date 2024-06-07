import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  BATCH_CREATE_REQUEST,
  BATCH_CREATE_REQUEST_WITH_CALLBACK,
  BATCH_CREATE_SUCCESS,
  BATCH_DELETE_ERROR,
  BATCH_DELETE_REQUEST,
  BATCH_DELETE_SUCCESS,
  BATCH_EXECUTE_ERROR,
  BATCH_EXECUTE_REQUEST,
  BATCH_EXECUTE_SUCCESS,
  BATCH_LIST_REQUEST,
  BATCH_LIST_SUCCESS,
  BATCH_RETRIEVE_REQUEST,
  BATCH_RETRIEVE_SUCCESS,
  BATCH_TEMPLATE_DOWNLOAD_CSV_REQUEST,
  BATCH_TEMPLATE_DOWNLOAD_REQUEST,
  BATCH_TEMPLATE_DOWNLOAD_SUCCESS,
  BATCH_TEMPLATE_LIST_REQUEST,
  BATCH_TEMPLATE_LIST_SUCCESS,
  BATCH_UPDATE_REQUEST,
  BATCH_UPDATE_SUCCESS
} from 'state/actions';
import { selectConfiguration } from 'state/reducers/configuration';
import { getCurrentJWT } from 'state/sagas/auth/auth';

function* listBatches(action) {
  yield call(listTemplates, action);
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/batch`, {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });

  yield put({ type: BATCH_LIST_SUCCESS, payload: (yield res.json())?.result });
}

function* getBatch(action) {
  const configuration = yield select(selectConfiguration);
  const { id } = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch/` + encodeURIComponent(id), {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });
  yield put({ type: BATCH_RETRIEVE_SUCCESS, payload: yield res.json() });
}

function* createBatch(action) {
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/batch`, {
    method: 'POST',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action.payload)
  });

  yield put({ type: BATCH_CREATE_SUCCESS, payload: yield res.json() });
}

function* createBatchWithCallback(action) {
  const configuration = yield select(selectConfiguration);
  const { resolve, reject } = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch`, {
    method: 'POST',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action.payload)
  });
  const resultBody = yield res.json();

  yield put({ type: BATCH_CREATE_SUCCESS, payload: resultBody });
  yield call(resolve, resultBody?.batchId);
}

function* updateBatch(action) {
  const configuration = yield select(selectConfiguration);
  const { id } = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action.payload)
  });

  yield put({ type: BATCH_UPDATE_SUCCESS, payload: res?.json() });
  yield put({ type: BATCH_RETRIEVE_REQUEST, payload: { id } });
}

function* deleteBatch(action: any) {
  const configuration = yield select(selectConfiguration);
  const { id } = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action.payload)
  });

  const data = yield res.json();

  if (!res.ok) {
    yield put({ type: BATCH_DELETE_ERROR, payload: data });
    return;
  }
  yield put({ type: BATCH_DELETE_SUCCESS, payload: data });
}

function* listTemplates(action) {
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/batch/templates`, {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });

  yield put({ type: BATCH_TEMPLATE_LIST_SUCCESS, payload: yield res.json() });
}

function* templateCSV(action) {
  const configuration = yield select(selectConfiguration);

  const { key, resolve } = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch/templates/${key}`, {
    headers: {
      Authorization: yield getCurrentJWT(),
      Accept: 'text/csv'
    }
  });

  yield call(resolve, yield res.text());
}

function* templateDetail(action) {
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/batch/templates/${action.payload.key}`, {
    headers: {
      Authorization: yield getCurrentJWT(),
      Accept: 'application/json'
    }
  });

  yield put({
    type: BATCH_TEMPLATE_DOWNLOAD_SUCCESS,
    payload: {
      key: action.payload.key,
      data: yield res.json()
    }
  });
}

function* executeBatch(action) {
  const configuration = yield select(selectConfiguration);
  const { id } = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch/${id}/execute`, {
    method: 'POST',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      desiredActivityState: action.payload.desiredActivityState,
      treatmentOfErrorRows: action.payload.treatmentOfErrorRows
    })
  });

  const data = yield res.json();

  if (!res.ok) {
    yield put({ type: BATCH_EXECUTE_SUCCESS, payload: data });
    yield put({ type: BATCH_RETRIEVE_REQUEST, payload: { id } });
  } else {
    yield put({ type: BATCH_EXECUTE_ERROR, payload: data });
  }
}

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
