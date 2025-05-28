import { put, select, takeEvery } from 'redux-saga/effects';
import {
  MAP_DEFINITIONS,
  MapSourceAndLayerDefinition,
  MapSourceAndLayerDefinitionMode
} from 'UI/LegacyMap/helpers/functional/layer-definitions';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import MapActions from 'state/actions/map';
import { RootState } from 'state/reducers/rootReducer';
import { FeatureFlags } from 'state/configuration/feature-flags';

function* recomputeEligibleMapLayers(action) {
  // don't loop
  const FILTERED_ACTIONS = [MapActions.updateAvailableOverlays.type, MapActions.updateAvailableBaseMaps.type];
  const features: FeatureFlags = yield select(state=>state.Configuration.current.features);
  if (FILTERED_ACTIONS.includes(action.type)) {
    return;
  }

  const AUTHENTICATED = yield select((state: RootState) => state.Auth.loggedInOrWorkingOffline);

  const CONNECTED = yield select((state: RootState) => state.Network.connected);

  const CURRENT_ELIGIBLE_BASEMAP_LIST = yield select((state) => state.Map.availableBaseMapLayers);
  const CURRENT_ELIGIBLE_OVERLAY_LIST = yield select((state) => state.Map.availableOverlayLayers);

  const UPDATED_BASEMAP_LIST: string[] = [];
  const UPDATED_OVERLAY_LIST: string[] = [];

  const offlineDefinitions = (yield select((state: RootState) => state.TileCache?.mapSpecifications)) ?? [];

  // evaluate each potential map definition and remove those not eligible at this moment
  for (const l of [...MAP_DEFINITIONS, ...offlineDefinitions] as MapSourceAndLayerDefinition[]) {
    let pass = true;

    if (!l.predicates.directlySelectable) {
      pass = false;
    }

    if (l.predicates.mobileOnly && !buildTimeConfig.MOBILE) {
      pass = false;
    }

    if (l.predicates.webOnly && buildTimeConfig.MOBILE) {
      pass = false;
    }

    if (l.predicates.requiresFeature !== undefined) {
      if (!features[l.predicates.requiresFeature].enabled) {
        pass = false;
      }
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
