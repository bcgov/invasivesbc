import { all, put, select } from "redux-saga/effects";
import { IAPP_GET_FAILURE, IAPP_GET_MEDIA_FAILURE, IAPP_GET_MEDIA_ONLINE, IAPP_GET_NETWORK_REQUEST, USER_SETTINGS_SET_MAP_CENTER_REQUEST } from "state/actions";
import { selectIappsite } from "state/reducers/iappsite";

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

export function* handle_IAPP_GET_MEDIA_REQUEST(action) {
  try {
    const iappSiteState = yield select(selectIappsite);

    const media_keys = ["IAPP-217011-b5111e22-24be-431a-9dbc-f382d8df3aba.jpg", "IAPP-216998-3c820e14-e6b1-46dc-8152-c59f2a7c2cc0.jpg"];
    //const media_keys = iappSiteState.IAPP.media_keys;

    yield all(media_keys.map((key) => {
      return put({
        type: IAPP_GET_MEDIA_ONLINE,
        payload: {
          id: iappSiteState.IAPP.site_id,
          media_key: key
        }
      });
    }));
  } catch(e) {
    console.error(e);
    yield put({
      type: IAPP_GET_MEDIA_FAILURE
    });
  }
}