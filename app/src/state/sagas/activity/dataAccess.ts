import { calc_utm } from "components/map/Tools/ToolTypes/Nav/DisplayPosition";
import { put } from "redux-saga/effects";
import { ACTIVITY_GET_INITIAL_STATE_FAILURE, ACTIVITY_GET_INITIAL_STATE_SUCCESS, ACTIVITY_GET_NETWORK_REQUEST,ACTIVITY_UPDATE_GEO_SUCCESS } from "state/actions";
import { calculateGeometryArea, calculateLatLng } from "utils/geometryHelpers";

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

        // get spatial fields based on geo
        const { latitude, longitude } = calculateLatLng(action.payload.geometry) || {};
        var utm = calc_utm(longitude, latitude);
        const reported_area = calculateGeometryArea(action.payload.geometry)
        yield put({ type: ACTIVITY_UPDATE_GEO_SUCCESS, payload: { geometry: action.payload.geometry, utm: utm, lat: latitude, long: longitude, reported_area: reported_area}})
      
    } catch (e) {
      console.error(e);
      yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
    }
  }

  