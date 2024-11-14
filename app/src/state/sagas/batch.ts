import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  BATCH_TEMPLATE_DOWNLOAD_CSV_REQUEST,
  BATCH_TEMPLATE_DOWNLOAD_REQUEST,
  BATCH_TEMPLATE_DOWNLOAD_SUCCESS,
  BATCH_TEMPLATE_LIST_SUCCESS
} from 'state/actions';

import BatchActions, { IBatchExecute, IBatchUpdate } from 'state/actions/batch/BatchActions';
import { selectConfiguration } from 'state/reducers/configuration';
import { getCurrentJWT } from 'state/sagas/auth/auth';

function* listBatches(action: PayloadAction) {
  yield call(listTemplates, action);
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/batch`, {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });

  yield put(BatchActions.listSuccess((yield res.json())?.result));
}

function* getBatch(action: PayloadAction<string>) {
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/batch/` + encodeURIComponent(action.payload), {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });

  const data = yield res.json();
  yield put(BatchActions.retrieveSuccess(data.result));
}

function* createBatchWithCallback(action) {
  const configuration = yield select(selectConfiguration);
  const { resolve } = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch`, {
    method: 'POST',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action.payload)
  });
  const resultBody = yield res.json();

  yield put(BatchActions.createSuccess(resultBody));
  yield call(resolve, resultBody?.batchId);
}

function* updateBatch(action: PayloadAction<IBatchUpdate>) {
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
  yield put(BatchActions.updateSuccess(res?.json()));
  yield put(BatchActions.retrieve(id));
}

function* deleteBatch(action: PayloadAction<string>) {
  const configuration = yield select(selectConfiguration);
  const id = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  });

  const data = yield res.json();

  if (!res.ok) {
    yield put(BatchActions.deleteError());
    return;
  }
  yield put(BatchActions.deleteSuccess());
}

function* listTemplates(action: PayloadAction) {
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

function* executeBatch(action: PayloadAction<IBatchExecute>) {
  const configuration = yield select(selectConfiguration);
  const { id, desiredActivityState, treatmentOfErrorRows } = action.payload;

  const res = yield fetch(configuration.API_BASE + `/api/batch/${id}/execute`, {
    method: 'POST',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      desiredActivityState: desiredActivityState,
      treatmentOfErrorRows: treatmentOfErrorRows
    })
  });

  const data = yield res.json();

  if (data.code === 200) {
    yield put(BatchActions.executeSuccess(data.result));
    yield put(BatchActions.retrieve(id));
  } else {
    yield put(BatchActions.executeError(data.message ?? ''));
  }
}

function* batchSaga() {
  yield all([
    takeEvery(BatchActions.list, listBatches),
    takeLatest(BatchActions.retrieve, getBatch),
    takeEvery(BatchActions.update, updateBatch),
    takeEvery(BatchActions.delete, deleteBatch),
    takeEvery(BatchActions.deleteSuccess, listBatches),
    takeLatest(BatchActions.templateList, listTemplates),
    takeEvery(BATCH_TEMPLATE_DOWNLOAD_REQUEST, templateDetail),
    takeLatest(BATCH_TEMPLATE_DOWNLOAD_CSV_REQUEST, templateCSV),
    takeLatest(BatchActions.createWithCallback, createBatchWithCallback),
    takeLatest(BatchActions.execute, executeBatch)
  ]);
}

export default batchSaga;
