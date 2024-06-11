import { put, select } from 'redux-saga/effects';
import centroid from '@turf/centroid';
import { selectIAPPSite } from 'state/reducers/iappsite';
import { IAPP_GET_FAILURE, IAPP_GET_ONLINE, MAIN_MAP_MOVE, USER_SETTINGS_SET_MAP_CENTER_REQUEST } from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';

export function* handle_IAPP_GET_REQUEST(action) {
  try {
    // if mobile or web

    const idFromURL = action.payload.iappID;
    if (idFromURL !== undefined) {
      yield put(IAPP_GET_ONLINE({ iappID: action.payload.iappID }));
      return;
    }

    const userSettingsState = yield select(selectUserSettings);
    const activeIAPP = userSettingsState.activeIAPP;

    if (activeIAPP !== undefined) {
      yield put(IAPP_GET_ONLINE({ iappID: activeIAPP }));
    } else {
      // dispatch alert to user that there is no active iapp site
      //yield put({ type: Notif})
    }
  } catch (e) {
    console.error(e);
    yield put(IAPP_GET_FAILURE());
  }
}

export function* handle_IAPP_GET_SUCCESS(action) {
  try {
    yield put(
      USER_SETTINGS_SET_MAP_CENTER_REQUEST({
        center: action.payload.iapp?.geom?.geometry?.coordinates
      })
    );
  } catch (e) {
    console.error(e);
    yield put(IAPP_GET_FAILURE());
  }
}

export function* handle_IAPP_PAN_AND_ZOOM() {
  const { site } = yield select(selectIAPPSite);

  const geometry = site?.geom || null;

  if (geometry) {
    const isPoint = geometry.geometry?.type === 'Point' ? true : false;
    let target;
    if (isPoint) {
      target = geometry.geometry;
    } else {
      const acentroid = centroid(geometry);

      target = acentroid.geometry;
    }

    yield put(MAIN_MAP_MOVE({ center: { lat: target.coordinates[1], lng: target.coordinates[0] }, zoom: 16 }));
  }
}
