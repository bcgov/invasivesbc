import { put, select, takeEvery } from 'redux-saga/effects';
import {
  MAP_DEFINITIONS,
  MapSourceAndLayerDefinition,
  MapSourceAndLayerDefinitionMode
} from 'UI/LegacyMap/helpers/functional/layer-definitions';
import { MOBILE } from 'state/build-time-config';
import MapActions from 'state/actions/map';

function* recomputeEligibleMapLayers(action) {
  // don't loop
  const FILTERED_ACTIONS = [MapActions.updateAvailableOverlays.type, MapActions.updateAvailableBaseMaps.type];
  if (FILTERED_ACTIONS.includes(action.type)) {
    return;
  }

  const loggedInOrWorkingOffline = yield select((state) => state.Auth.loggedInOrWorkingOffline);

  const AUTHENTICATED = loggedInOrWorkingOffline;

  const CONNECTED = yield select((state) => state.Network.connected);

  const CURRENT_ELIGIBLE_BASEMAP_LIST = yield select((state) => state.Map.availableBaseMapLayers);
  const CURRENT_ELIGIBLE_OVERLAY_LIST = yield select((state) => state.Map.availableOverlayLayers);

  const UPDATED_BASEMAP_LIST: string[] = [];
  const UPDATED_OVERLAY_LIST: string[] = [];

  const offlineDefinitions = (yield select((state) => state.TileCache?.mapSpecifications)) ?? [];

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

    if (!l.predicates.requiresNetwork && l.predicates.mobileOnly && CONNECTED) {
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
    yield put(MapActions.updateAvailableBaseMaps(UPDATED_BASEMAP_LIST));
    yield put(MapActions.updateAvailableOverlays(UPDATED_OVERLAY_LIST));
  }

  const { enabledOverlayLayers } = yield select((state) => state.Map);

  if (
    !AUTHENTICATED &&
    UPDATED_OVERLAY_LIST.includes('public_layer') &&
    !enabledOverlayLayers.includes('public_layer')
  ) {
    yield put(MapActions.toggleOverlay('public_layer'));
  }
}

const LAYER_ELIGIBILITY_UPDATE = [takeEvery('*', recomputeEligibleMapLayers)]; //@todo be more selective about potentially-triggering actions

export { LAYER_ELIGIBILITY_UPDATE };
