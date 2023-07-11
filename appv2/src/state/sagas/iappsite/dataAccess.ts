import { put } from "redux-saga/effects";
import { IAPP_GET_FAILURE, IAPP_GET_NETWORK_REQUEST, USER_SETTINGS_SET_MAP_CENTER_REQUEST } from "state/actions";

export function* handle_IAPP_GET_REQUEST(action) {
  try {
    // if mobile or web
    yield put({ type: IAPP_GET_NETWORK_REQUEST, payload: { iappID: action.payload.iappID } });
  } catch (e) {
    console.error(e);
    yield put({ type: IAPP_GET_FAILURE });
  }
}

export function* handle_IAPP_GET_SUCCESS(action) {
  try {
    yield put({
      type: USER_SETTINGS_SET_MAP_CENTER_REQUEST,
      payload: {
        center: action.payload.iapp?.geom?.geometry?.coordinates
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: IAPP_GET_FAILURE });
  }
}