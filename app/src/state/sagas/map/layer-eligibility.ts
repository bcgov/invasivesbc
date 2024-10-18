import { put, select, takeEvery } from 'redux-saga/effects';
import {
  MAP_DEFINITIONS,
  MapSourceAndLayerDefinition,
  MapSourceAndLayerDefinitionMode
} from 'UI/Map2/helpers/layer-definitions';
import { RootState } from 'state/reducers/rootReducer';
import { MAP_UPDATE_AVAILABLE_BASEMAPS, MAP_UPDATE_AVAILABLE_OVERLAYS } from 'state/actions';
import { MOBILE } from 'state/build-time-config';

function* recomputeEligibleMapLayers(action) {
  // don't loop
  const FILTERED_ACTIONS = [MAP_UPDATE_AVAILABLE_BASEMAPS, MAP_UPDATE_AVAILABLE_OVERLAYS];
  if (FILTERED_ACTIONS.includes(action.type)) {
    return;
  }

  const WORKING_OFFLINE = yield select((state) => (state as RootState).Auth.workingOffline);
  const ONLINE_AUTHENTICATED = yield select((state) => (state as RootState).Auth.authenticated);

  const AUTHENTICATED = WORKING_OFFLINE || ONLINE_AUTHENTICATED;

  const CONNECTED = yield select((state) => (state as RootState).Network.connected);

  const CURRENT_ELIGIBLE_BASEMAP_LIST = yield select((state) => (state as RootState).Map.availableBaseMapLayers);
  const CURRENT_ELIGIBLE_OVERLAY_LIST = yield select((state) => (state as RootState).Map.availableOverlayLayers);

  const UPDATED_BASEMAP_LIST: string[] = [];
  const UPDATED_OVERLAY_LIST: string[] = [];

  const offlineDefinitions = (yield select((state) => (state as RootState).TileCache?.mapSpecifications)) || [];

  // evaluate each potential map definition and remove those not eligible at this moment
  for (const l of [...MAP_DEFINITIONS, ...offlineDefinitions] as MapSourceAndLayerDefinition[]) {
    let pass = true;

    if (!l.predicates.directlySelectable) {
      pass = false;
    }

    if (l.predicates.mobileOnly && !MOBILE) {
      pass = false;
    }

    if (l.predicates.webOnly && MOBILE) {
      pass = false;
    }

    if (l.predicates.requiresAuthentication && !AUTHENTICATED) {
      pass = false;
    }

    if (l.predicates.requiresAnonymous && AUTHENTICATED) {
      pass = false;
    }

    if (l.predicates.requiresNetwork && !CONNECTED) {
      pass = false;
    }

    if (pass) {
      if (l.mode == MapSourceAndLayerDefinitionMode.BASEMAP) {
        UPDATED_BASEMAP_LIST.push(l.name);
      } else if (l.mode == MapSourceAndLayerDefinitionMode.OVERLAY) {
        UPDATED_OVERLAY_LIST.push(l.name);
      }
    }
  }

  if (
    UPDATED_OVERLAY_LIST.length !== CURRENT_ELIGIBLE_OVERLAY_LIST.length ||
    !UPDATED_OVERLAY_LIST.every((e) => CURRENT_ELIGIBLE_OVERLAY_LIST.includes(e)) ||
    UPDATED_BASEMAP_LIST.length !== CURRENT_ELIGIBLE_BASEMAP_LIST.length ||
    !UPDATED_BASEMAP_LIST.every((e) => CURRENT_ELIGIBLE_BASEMAP_LIST.includes(e))
  ) {
    yield put({ type: MAP_UPDATE_AVAILABLE_BASEMAPS, payload: UPDATED_BASEMAP_LIST });
    yield put({ type: MAP_UPDATE_AVAILABLE_OVERLAYS, payload: UPDATED_OVERLAY_LIST });
  }
}

const LAYER_ELIGIBILITY_UPDATE = [takeEvery('*', recomputeEligibleMapLayers)]; //@todo be more selective about potentially-triggering actions

export { LAYER_ELIGIBILITY_UPDATE };
