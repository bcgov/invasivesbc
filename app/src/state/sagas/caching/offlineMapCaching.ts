import { mapCaching } from 'constants/alertMessages';
import { all, put, takeEvery } from 'redux-saga/effects';
import {
  NEW_ALERT,
  OFFLINE_MAP_CACHING_DELETE,
  OFFLINE_MAP_CACHING_DELETE_ALL,
  OFFLINE_MAP_CACHING_DELETE_ALL_FAILURE,
  OFFLINE_MAP_CACHING_DELETE_ALL_SUCCESS,
  OFFLINE_MAP_CACHING_DELETE_FAILED,
  OFFLINE_MAP_CACHING_DELETE_SUCCESS,
  OFFLINE_MAP_CACHING_DOWNLOAD,
  OFFLINE_MAP_CACHING_DOWNLOAD_FAILED,
  OFFLINE_MAP_CACHING_DOWNLOAD_SUCCESS,
  OFFLINE_MAP_CACHING_CREATE_SHAPE
} from 'state/actions';

/*
  Custom Shape Creation
*/
function* handle_OFFLINE_MAP_CACHING_SHAPE() {
  try {
    yield put({ type: NEW_ALERT, payload: mapCaching.createCustomLayer });
  } catch (ex) {
    console.error(ex);
  }
}

/*
   
*/
function* handle_OFFLINE_MAP_CACHING_DELETE_ALL() {
  try {
    yield put({ type: NEW_ALERT, payload: mapCaching.deleteAllStart });
    if (Math.random() <= 0.5) {
      // Simulate Error occurence while in stub form
      throw new Error();
    }
    yield put({ type: OFFLINE_MAP_CACHING_DELETE_ALL_SUCCESS });
  } catch (ex) {
    console.error(ex);
    yield put({ type: OFFLINE_MAP_CACHING_DELETE_ALL_FAILURE });
  }
}
function* handle_OFFLINE_MAP_CACHING_DELETE_ALL_SUCCESS() {
  yield put({ type: NEW_ALERT, payload: mapCaching.deleteAllSuccess });
}
function* handle_OFFLINE_MAP_CACHING_DELETE_ALL_FAILURE() {
  yield put({ type: NEW_ALERT, payload: mapCaching.deleteAllFailed });
}

/**
 * @desc Handler for downloading maptiles to a device, fetches maptiles and stores to device
 */
function* handle_OFFLINE_MAP_CACHING_DOWNLOAD(action) {
  try {
    yield put({ type: NEW_ALERT, payload: mapCaching.downloadStart });
    if (Math.random() <= 0.1) {
      // Simulate Error occurence while in stub form
      throw new Error();
    }
    yield put({ type: OFFLINE_MAP_CACHING_DOWNLOAD_SUCCESS, payload: { ...action.payload } });
  } catch (ex) {
    console.error(ex);
    yield put({ type: OFFLINE_MAP_CACHING_DOWNLOAD_FAILED });
  }
}
function* handle_OFFLINE_MAP_CACHING_DOWNLOAD_SUCCESS() {
  yield put({ type: NEW_ALERT, payload: mapCaching.downloadSuccess });
}
function* handle_OFFLINE_MAP_CACHING_DOWNLOAD_FAILED() {
  yield put({ type: NEW_ALERT, payload: mapCaching.downloadFailed });
}

function* handle_OFFLINE_MAP_CACHING_DELETE(action) {
  try {
    yield put({ type: NEW_ALERT, payload: mapCaching.deleteStart });
    if (Math.random() <= 0.1) {
      // Simulate Error occurence while in stub form
      throw new Error();
    }
    yield put({ type: OFFLINE_MAP_CACHING_DELETE_SUCCESS, payload: { ...action.payload } });
  } catch (ex) {
    yield put({ type: OFFLINE_MAP_CACHING_DELETE_FAILED });
  }
}

function* handle_OFFLINE_MAP_CACHING_DELETE_SUCCESS() {
  yield put({ type: NEW_ALERT, payload: mapCaching.deleteSuccess });
}

function* handle_OFFLINE_MAP_CACHING_DELETE_FAILED() {
  yield put({ type: NEW_ALERT, payload: mapCaching.deleteFailed });
}

function* offlineMapCachingSaga() {
  yield all([
    takeEvery(OFFLINE_MAP_CACHING_DOWNLOAD, handle_OFFLINE_MAP_CACHING_DOWNLOAD),
    takeEvery(OFFLINE_MAP_CACHING_DOWNLOAD_FAILED, handle_OFFLINE_MAP_CACHING_DOWNLOAD_FAILED),
    takeEvery(OFFLINE_MAP_CACHING_DOWNLOAD_SUCCESS, handle_OFFLINE_MAP_CACHING_DOWNLOAD_SUCCESS),
    takeEvery(OFFLINE_MAP_CACHING_DELETE, handle_OFFLINE_MAP_CACHING_DELETE),
    takeEvery(OFFLINE_MAP_CACHING_DELETE_FAILED, handle_OFFLINE_MAP_CACHING_DELETE_FAILED),
    takeEvery(OFFLINE_MAP_CACHING_DELETE_SUCCESS, handle_OFFLINE_MAP_CACHING_DELETE_SUCCESS),
    takeEvery(OFFLINE_MAP_CACHING_CREATE_SHAPE, handle_OFFLINE_MAP_CACHING_SHAPE),
    takeEvery(OFFLINE_MAP_CACHING_DELETE_ALL, handle_OFFLINE_MAP_CACHING_DELETE_ALL),
    takeEvery(OFFLINE_MAP_CACHING_DELETE_ALL_SUCCESS, handle_OFFLINE_MAP_CACHING_DELETE_ALL_SUCCESS),
    takeEvery(OFFLINE_MAP_CACHING_DELETE_ALL_FAILURE, handle_OFFLINE_MAP_CACHING_DELETE_ALL_FAILURE)
  ]);
}
export default offlineMapCachingSaga;
