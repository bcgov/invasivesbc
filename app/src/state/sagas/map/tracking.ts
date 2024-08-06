import { put, select, take, takeEvery } from 'redux-saga/effects';
import { channel } from 'redux-saga';
import { Geolocation } from '@capacitor/geolocation';
import { registerPlugin } from '@capacitor/core';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { selectMap } from 'state/reducers/map';
import { MAP_SET_COORDS, MAP_TOGGLE_PANNED, MAP_TOGGLE_TRACKING } from 'state/actions';

let BackgroundGeolocation: BackgroundGeolocationPlugin | null = null;

const coordChannel = channel();

function* handle_MAP_TOGGLE_TRACKING_FALLBACK() {
  const state = yield select(selectMap);

  if (!state.positionTracking) {
    return;
  }

  coordChannel.flush(() => {});

  const callback = async (position) => {
    try {
      if (!position) {
        return;
      } else {
        coordChannel.put({
          type: MAP_SET_COORDS,
          payload: {
            position: {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading
              }
            }
          }
        });
      }
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  };

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 500
  };
  const watchID = yield Geolocation.watchPosition(options, callback);

  let counter = 0;
  while (state.positionTracking) {
    if (counter === 0) {
      yield put({ type: MAP_TOGGLE_PANNED, payload: { target: 'me' } });
    }
    const currentMapState = yield select(selectMap);
    if (!currentMapState.positionTracking) {
      return;
    }
    const action = yield take(coordChannel);
    yield put(action);
    counter++;
  }

  Geolocation.clearWatch(watchID);
}

function* handle_MAP_TOGGLE_TRACKING_BACKGROUND() {
  coordChannel.flush(() => {});

  const state = yield select(selectMap);

  if (!state.positionTracking) {
    return;
  }

  if (BackgroundGeolocation == null) {
    BackgroundGeolocation = registerPlugin('BackgroundGeolocation');
    if (BackgroundGeolocation == null) {
      console.error('Cannot enable BackgroundGeolocation plugin');
      return;
    }
  }

  const watchId = yield BackgroundGeolocation.addWatcher(
    {
      requestPermissions: true,
      stale: false,
      distanceFilter: 5
    },
    function callback(location, error) {
      if (error) {
        if (error.code === 'NOT_AUTHORIZED') {
          if (BackgroundGeolocation !== null) {
            if (window.confirm('This feature requires location tracking permission. Would you like to enable it?')) {
              BackgroundGeolocation.openSettings();
            }
          }
        }
        return console.error(error);
      }
      if (location) {
        coordChannel.put({
          type: MAP_SET_COORDS,
          payload: {
            position: {
              coords: {
                latitude: location?.latitude,
                longitude: location?.longitude,
                accuracy: location?.accuracy,
                heading: location?.bearing
              }
            }
          }
        });
      }
      return console.log(location);
    }
  ).then((watchID) => {
    watcherID = watchID;
  });

  let counter = 0;
  while (state.positionTracking) {
    if (counter === 0) {
      yield put({ type: MAP_TOGGLE_PANNED, payload: { target: 'me' } });
    }
    const currentMapState = yield select(selectMap);
    if (!currentMapState.positionTracking) {
      return;
    }
    const action = yield take(coordChannel);
    yield put(action);
    counter++;
  }

  yield BackgroundGeolocation.removeWatcher({ id: watchId });
}

function* handle_MAP_TOGGLE_TRACKING() {
  switch (import.meta.env.VITE_TARGET_PLATFORM) {
    case 'ios':
      yield handle_MAP_TOGGLE_TRACKING_BACKGROUND();
      break;
    case 'web':
    default:
      yield handle_MAP_TOGGLE_TRACKING_FALLBACK();
      break;
  }
}

export const TRACKING_SAGA_HANDLERS = [takeEvery(MAP_TOGGLE_TRACKING, handle_MAP_TOGGLE_TRACKING)];
