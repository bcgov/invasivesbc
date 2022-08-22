import { calc_utm } from "components/map/Tools/ToolTypes/Nav/DisplayPosition";
import { put, select } from "redux-saga/effects";
import { ACTIVITY_GET_INITIAL_STATE_FAILURE,ACTIVITY_SAVE_NETWORK_REQUEST, ACTIVITY_GET_INITIAL_STATE_SUCCESS, ACTIVITY_GET_NETWORK_REQUEST,ACTIVITY_UPDATE_GEO_SUCCESS, ACTIVITY_CREATE_NETWORK, USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST, ACTIVITY_CREATE_FAILURE } from "state/actions";
import { selectAuth } from "state/reducers/auth";
import { generateDBActivityPayload } from "utils/addActivity";
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

  
  export function* handle_ACTIVITY_SAVE_REQUEST(action) {
    try {
  
        yield put({ type: ACTIVITY_SAVE_NETWORK_REQUEST, payload: { activityID: action.payload.activityID, updatedFormData: action.payload.updatedFormData}})
      
    } catch (e) {
      console.error(e);
      yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
    }
  }

  export function* handle_ACTIVITY_CREATE_REQUEST(action) {
    try {
      const authState = yield select(selectAuth);

        //yield put({ type: ACTIVITY_c_NETWORK_REQUEST, payload: { activityID: action.payload.activityID, updatedFormData: action.payload.updatedFormData}})
      let dbActivity = generateDBActivityPayload({}, null, action.payload.type, action.payload.subType);
      dbActivity.created_by = authState.username;
      dbActivity.user_role = authState.accessRoles.map((role) => role.role_id);
      //await dataAccess.createActivity(dbActivity, databaseContext);

      yield put({type: ACTIVITY_CREATE_NETWORK,
                payload: { activity: dbActivity }
              });

    } catch (e) {
      console.error(e);
      yield put({ type: ACTIVITY_CREATE_FAILURE });
    }
  }

  export function* handle_ACTIVITY_CREATE_SUCCESS(action) {
    try {
      yield put({type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
                payload: { activeActivity: action.payload.activity_id }
              });

    } catch (e) {
      console.error(e);
      yield put({ type: ACTIVITY_CREATE_FAILURE });
    }
  }