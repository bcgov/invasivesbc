import { calc_utm } from 'components/map/Tools/ToolTypes/Nav/DisplayPosition';
import { ActivityStatus } from 'constants/activities';
import { put, select } from 'redux-saga/effects';
import { throttle } from 'redux-saga/effects';

import {
  autofillBiocontrolCollectionTotalQuantity,
  autoFillNameByPAC,
  autoFillSlopeAspect,
  autoFillTotalBioAgentQuantity,
  autoFillTotalReleaseQuantity
} from 'rjsf/business-rules/populateCalculatedFields';
import {
  ACTIVITY_GET_INITIAL_STATE_FAILURE,
  ACTIVITY_SAVE_NETWORK_REQUEST,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_GET_INITIAL_STATE_SUCCESS,
  ACTIVITY_GET_NETWORK_REQUEST,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  ACTIVITY_CREATE_NETWORK,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
  ACTIVITY_CREATE_FAILURE
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectAuth } from 'state/reducers/auth';
import { generateDBActivityPayload, populateSpeciesArrays } from 'utils/addActivity';
import { calculateGeometryArea, calculateLatLng } from 'utils/geometryHelpers';

export function* handle_ACTIVITY_GET_REQUEST(action) {
  try {
    // if mobile or web
    yield put({ type: ACTIVITY_GET_NETWORK_REQUEST, payload: { activityID: action.payload.activityID } });
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
    const reported_area = calculateGeometryArea(action.payload.geometry);
    yield put({
      type: ACTIVITY_UPDATE_GEO_SUCCESS,
      payload: {
        geometry: action.payload.geometry,
        utm: utm,
        lat: latitude,
        long: longitude,
        reported_area: reported_area
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_SAVE_REQUEST(action) {
  try {
    yield put({
      type: ACTIVITY_SAVE_NETWORK_REQUEST,
      payload: { activity_id: action.payload.activity_id, updatedFormData: action.payload.updatedFormData }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_CREATE_REQUEST(action) {
  try {
    const authState = yield select(selectAuth);

    let activityV1 = generateDBActivityPayload({}, null, action.payload.type, action.payload.subType);
    let activityV2 = populateSpeciesArrays(activityV1);
    activityV2.created_by = authState.username;
    activityV2.user_role = authState.accessRoles.map((role) => role.role_id);
    //await dataAccess.createActivity(dbActivity, databaseContext);

    yield put({ type: ACTIVITY_CREATE_NETWORK, payload: { activity: activityV2 } });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_CREATE_FAILURE });
  }
}

export function* handle_ACTIVITY_CREATE_SUCCESS(action) {
  try {
    yield put({
      type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
      payload: { activeActivity: action.payload.activity_id }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_CREATE_FAILURE });
  }
}

export function* handle_ACTIVITY_ON_FORM_CHANGE_REQUEST(action) {
  try {
    const beforeState = yield select(selectActivity);
    const beforeActivity = beforeState.activity;
    const lastField = action.payload.lastField;
    let updatedFormData = populateSpeciesArrays(action.payload.eventFormData);

    //updatedFormData = autoFillSlopeAspect(updatedFormData, lastField);
    //auto fills total release quantity (only on biocontrol release activity)
    //updatedFormData = autoFillTotalReleaseQuantity(updatedFormData);
    //auto fills total bioagent quantity (only on biocontrol release monitoring activity)
    // updatedFormData = autoFillTotalBioAgentQuantity(updatedFormData);
    // Autofills total bioagent quantity specifically for biocontrol collections
    //updatedFormData = autofillBiocontrolCollectionTotalQuantity(updatedFormData);

    // updatedFormData = autoFillNameByPAC(updatedFormData, applicationUsers);

    //handleRecordLinking(updatedFormData);

    const after = { ...beforeActivity, form_data: { ...beforeActivity.form_data, ...updatedFormData } };

    yield put({
      type: ACTIVITY_ON_FORM_CHANGE_SUCCESS,
      payload: { activity: after, lastField: action.payload.lastField }
    });

    //call autofill events
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_CREATE_FAILURE });
  }
}

export function* handle_ACTIVITY_SUBMIT_REQUEST(action) {
  try {
    yield put({
      type: ACTIVITY_SAVE_NETWORK_REQUEST,
      payload: { activity_id: action.payload.activity_id, form_status: ActivityStatus.SUBMITTED }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}
