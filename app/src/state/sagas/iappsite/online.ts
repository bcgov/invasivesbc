import { InvasivesAPI_Call } from "hooks/useInvasivesApi";
import { put } from "redux-saga/effects";
import { IAPP_GET_FAILURE, IAPP_GET_SUCCESS, USER_SETTINGS_SET_ERROR_HANDLER_DIALOG_REQUEST } from "state/actions";
import { autoRestart } from "state/utilities/errorHandlers";

export const handle_IAPP_GET_NETWORK_REQUEST = autoRestart(
  function* handle_IAPP_GET_NETWORK_REQUEST(action) {
    const networkReturn = yield InvasivesAPI_Call('GET', `/api/points-of-interest/`, { iappSiteID: action.payload.iappID, isIAPP: true, site_id_only: false });
    const data = networkReturn?.data?.result?.rows[0];
  
    yield put({ type: IAPP_GET_SUCCESS, payload: { iapp: data } });
  },
  function* handleError(e) {
    const errorMessage = 'Online get IAPP network request failed: ' + e.toString();
    yield put({
      type: USER_SETTINGS_SET_ERROR_HANDLER_DIALOG_REQUEST,
      payload: {
        dialogOpen: true,
        dialogContentText: errorMessage
      }
    });
    yield put({
      type: IAPP_GET_FAILURE
    });
  }
);