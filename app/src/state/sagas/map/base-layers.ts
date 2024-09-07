import { put, select, takeEvery } from 'redux-saga/effects';
import { MAP_DEFINITIONS } from 'UI/Map2/constants';
import { RootState } from 'state/reducers/rootReducer';
import { MAP_UPDATE_AVAILABLE_BASEMAPS } from 'state/actions';

function* recomputeEligibleBaseLayers() {
  const MOBILE = yield select((state) => (state as RootState).Configuration.current.MOBILE);

  const WORKING_OFFLINE = yield select((state) => (state as RootState).Auth.workingOffline);
  const ONLINE_AUTHENTICATED = yield select((state) => (state as RootState).Auth.authenticated);

  const AUTHENTICATED = WORKING_OFFLINE || ONLINE_AUTHENTICATED;

  const CONNECTED = yield select((state) => (state as RootState).Network.connected);

  const CURRENT_ELIGIBLE_LIST = yield select((state) => (state as RootState).Map.availableBaseMapLayers);

  const UPDATED_DEFINITION_LIST: string[] = [];

  // evaluate each potential map definition and remove those not eligible at this moment
  for (const l of MAP_DEFINITIONS) {
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
      UPDATED_DEFINITION_LIST.push(l.name);
    }
  }

  // see if the list has changed, and if so, update the list
  if (
    UPDATED_DEFINITION_LIST.length !== CURRENT_ELIGIBLE_LIST.length ||
    !UPDATED_DEFINITION_LIST.every((e) => CURRENT_ELIGIBLE_LIST.includes(e))
  ) {
    yield put({ type: MAP_UPDATE_AVAILABLE_BASEMAPS, payload: UPDATED_DEFINITION_LIST });
  }
}

const BASE_LAYER_HANDLERS = [takeEvery('*', recomputeEligibleBaseLayers)];

export { BASE_LAYER_HANDLERS };
