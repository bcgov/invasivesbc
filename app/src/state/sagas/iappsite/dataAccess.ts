import { put, select } from 'redux-saga/effects';
import centroid from '@turf/centroid';
import { selectIAPPSite } from '../../reducers/iappsite';
import { IAPP_GET_FAILURE, IAPP_GET_NETWORK_REQUEST, MAIN_MAP_MOVE } from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';
import UserSettings from 'state/actions/userSettings/UserSettings';

export function* handle_IAPP_GET_REQUEST(action) {
  try {
    // if mobile or web

    const idFromURL = action.payload.iappID;
    if (idFromURL !== undefined) {
      yield put({ type: IAPP_GET_NETWORK_REQUEST, payload: { iappID: action.payload.iappID } });
      return;
    }

    const userSettingsState = yield select(selectUserSettings);
    const activeIAPP = userSettingsState.activeIAPP;

    if (activeIAPP !== undefined) {
      yield put({ type: IAPP_GET_NETWORK_REQUEST, payload: { iappID: activeIAPP } });
    } else {
      // dispatch alert to user that there is no active iapp site
      //yield put({ type: Notif})
    }
  } catch (e) {
    console.error(e);
    yield put({ type: IAPP_GET_FAILURE });
  }
}

export function* handle_IAPP_GET_SUCCESS(action) {
  try {
    yield put(UserSettings.Map.setCenter(action.payload.iapp?.geom?.geometry?.coordinates));
  } catch (e) {
    console.error(e);
    yield put({ type: IAPP_GET_FAILURE });
  }
}

export function* handle_IAPP_PAN_AND_ZOOM(action) {
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

    yield put({
      type: MAIN_MAP_MOVE,
      payload: { center: { lat: target.coordinates[1], lng: target.coordinates[0] }, zoom: 16 }
    });
  }
}
