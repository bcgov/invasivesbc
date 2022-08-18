import { put } from "redux-saga/effects";
import { ACTIVITY_GET_INITIAL_STATE_FAILURE, ACTIVITY_GET_INITIAL_STATE_SUCCESS, ACTIVITY_GET_NETWORK_REQUEST } from "state/actions";

export function* handle_ACTIVITY_GET_REQUEST(action) {
    try {
        // if mobile or web 
    yield put({ type: ACTIVITY_GET_NETWORK_REQUEST, payload: { activityID: action.payload.activityID}})
      
    } catch (e) {
      console.error(e);
      yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
    }
  }

export function* handle_ACTIVITY_UPDATE_GEO_REQUEST(action) {
    try {


        // if mobile or web 
   // yield put({ type: ACTIVITY_GET_NETWORK_REQUEST, payload: { activityID: action.payload.activityID}})
      
    } catch (e) {
      console.error(e);
      yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
    }
  }

  