import { put, select } from 'redux-saga/effects';
import centroid from '@turf/centroid';
import { PayloadAction } from '@reduxjs/toolkit';
import { selectIAPPSite } from 'state/reducers/iappsite';
import { MAIN_MAP_MOVE } from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { selectNetworkConnected } from 'state/reducers/network';
import { IappRecordMode } from 'utils/record-cache';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import IappActions from 'state/actions/activity/Iapp';
import { buildTimeConfig } from 'state/configuration/build-time-config';

export function* handle_IAPP_GET_REQUEST(iappId: PayloadAction<string>) {
  try {
    const connected = yield select(selectNetworkConnected);
    if (buildTimeConfig.MOBILE && !connected) {
      const service = yield RecordCacheServiceFactory.getPlatformInstance();
      const result = yield service.loadIapp(iappId.payload, IappRecordMode.Record);
      yield put(IappActions.getSuccess(result));
    } else if (iappId.payload) {
      yield put(IappActions.getRequest(iappId.payload));
    } else {
      const { activeIAPP } = yield select(selectUserSettings);
      if (activeIAPP) {
        yield put(IappActions.getRequest(activeIAPP.recordSetID));
      }
    }
  } catch (e) {
    console.error(e);
    yield put(IappActions.getFailure());
  }
}

export function* handle_IAPP_GET_SUCCESS(action) {
  try {
    yield put(UserSettings.Map.setCenter(action.payload.iapp?.geom?.geometry?.coordinates));
  } catch (e) {
    console.error(e);
    yield put(IappActions.getFailure());
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

    yield put({
      type: MAIN_MAP_MOVE,
      payload: { center: { lat: target.coordinates[1], lng: target.coordinates[0] }, zoom: 16 }
    });
  }
}
