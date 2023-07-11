import { InvasivesAPI_Call } from "hooks/useInvasivesApi";
import { put } from "redux-saga/effects";
import { IAPP_GET_SUCCESS } from "state/actions";

export function* handle_IAPP_GET_NETWORK_REQUEST(action) {
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/points-of-interest/`, { iappSiteID: action.payload.iappID, isIAPP: true, site_id_only: false });
  const data = networkReturn?.data?.result?.rows[0];

  yield put({ type: IAPP_GET_SUCCESS, payload: { iapp: data } });
}