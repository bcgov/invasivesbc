import { all, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  ACTIVITY_ADD_PHOTO_REQUEST,
  ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST,
  ACTIVITY_BUILD_SCHEMA_FOR_FORM_SUCCESS,
  ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
  ACTIVITY_COPY_REQUEST,
  ACTIVITY_CREATE_NETWORK,
  ACTIVITY_CREATE_REQUEST,
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_DEBUG,
  ACTIVITY_DELETE_FAILURE,
  ACTIVITY_DELETE_NETWORK_REQUEST,
  ACTIVITY_DELETE_PHOTO_REQUEST,
  ACTIVITY_DELETE_REQUEST,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_EDIT_PHOTO_REQUEST,
  ACTIVITY_GET_NETWORK_REQUEST,
  ACTIVITY_GET_REQUEST,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST,
  ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
  ACTIVITY_LINK_RECORD_REQUEST,
  ACTIVITY_ON_FORM_CHANGE_REQUEST,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_PASTE_REQUEST,
  ACTIVITY_PERSIST_REQUEST,
  ACTIVITY_RESTORE_OFFLINE,
  ACTIVITY_SAVE_NETWORK_REQUEST,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_SET_CURRENT_HASH_FAILURE,
  ACTIVITY_SET_CURRENT_HASH_SUCCESS,
  ACTIVITY_SET_SAVED_HASH_FAILURE,
  ACTIVITY_SET_SAVED_HASH_SUCCESS,
  ACTIVITY_SET_UNSAVED_NOTIFICATION,
  ACTIVITY_SUBMIT_REQUEST,
  ACTIVITY_TOGGLE_NOTIFICATION_REQUEST,
  ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
  ACTIVITY_UPDATE_AUTOFILL_REQUEST,
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  ACTIVITY_UPDATE_PHOTO_REQUEST,
  MAP_INIT_REQUEST,
  PAN_AND_ZOOM_TO_ACTIVITY,
  URL_CHANGE,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_SELECTED_RECORD_REQUEST
} from '../actions';
import {
  handle_ACTIVITY_ADD_PHOTO_REQUEST,
  handle_ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
  handle_ACTIVITY_COPY_REQUEST,
  handle_ACTIVITY_CREATE_REQUEST,
  handle_ACTIVITY_CREATE_SUCCESS,
  handle_ACTIVITY_DELETE_PHOTO_REQUEST,
  handle_ACTIVITY_DELETE_REQUEST,
  handle_ACTIVITY_EDIT_PHOTO_REQUEST,
  handle_ACTIVITY_GET_REQUEST,
  handle_ACTIVITY_GET_SUCCESS,
  handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST,
  handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST,
  handle_ACTIVITY_ON_FORM_CHANGE_REQUEST,
  handle_ACTIVITY_PASTE_REQUEST,
  handle_ACTIVITY_SAVE_REQUEST,
  handle_ACTIVITY_SAVE_SUCCESS,
  handle_ACTIVITY_SUBMIT_REQUEST,
  handle_ACTIVITY_TOGGLE_NOTIFICATION_REQUEST,
  handle_ACTIVITY_UPDATE_GEO_REQUEST,
  handle_ACTIVITY_UPDATE_GEO_SUCCESS,
  handle_GET_SUGGESTED_JURISDICTIONS_REQUEST,
  handle_PAN_AND_ZOOM_TO_ACTIVITY
} from './activity/dataAccess';
import {
  handle_ACTIVITY_CREATE_NETWORK,
  handle_ACTIVITY_DELETE_NETWORK_REQUEST,
  handle_ACTIVITY_GET_NETWORK_REQUEST,
  handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE,
  handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE,
  handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
  handle_ACTIVITY_SAVE_NETWORK_REQUEST
} from './activity/online';
import { selectActivity } from 'state/reducers/activity';
import { handle_ACTIVITY_RESTORE_OFFLINE, OFFLINE_ACTIVITY_SAGA_HANDLERS } from './activity/offline';
import { selectUserSettings } from 'state/reducers/userSettings';
import RootUISchemas from 'rjsf/uiSchema/RootUISchemas';

function* handle_USER_SETTINGS_READY(action) {
  // if (action.payload.activeActivity) {
  //    yield put({ type: ACTIVITY_GET_REQUEST, payload: { activityID: action.payload.activeActivity } });
  // }
}

function* handle_ACTIVITY_DEBUG(action) {
  console.log('halp');
}

function* handle_ACTIVITY_DELETE_SUCESS(action) {
  yield put({
    type: USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
    payload: {
      activeActivity: null
    }
  });
  yield put({
    type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
    payload: {
      notification: {
        visible: true,
        message: 'Activity deleted successfully',
        severity: 'success'
      }
    }
  });
  yield put({ type: MAP_INIT_REQUEST });
}

function* handle_ACTIVITY_SET_SAVED_HASH_REQUEST(action) {
  try {
    const activityState = yield select(selectActivity);
    yield put({
      type: ACTIVITY_SET_SAVED_HASH_SUCCESS,
      payload: {
        saved: activityState?.current_activity_hash
      }
    });

    yield put({
      type: ACTIVITY_SET_UNSAVED_NOTIFICATION,
      payload: {
        unsaved_notification: {
          visible: false,
          message: '',
          severity: 'warning'
        }
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: ACTIVITY_SET_SAVED_HASH_FAILURE
    });
  }
}

function* handle_ACTIVITY_SET_CURRENT_HASH_REQUEST(action) {
  yield delay(2000);

  try {
    if (action.type === 'ACTIVITY_ON_FORM_CHANGE_SUCCESS' && !action.payload.unsavedDelay) return;

    const activityState = yield select(selectActivity);
    const activitySerialized = JSON.stringify(activityState?.activity);
    let currentHash = 5381;

    for (let i = 0; i < activitySerialized.length; i++) {
      currentHash = (currentHash * 33) ^ activitySerialized.charCodeAt(i);
    }

    // check if different than saved
    let visible = false;
    if (currentHash !== activityState?.saved_activity_hash) {
      visible = true;
    }

    yield put({
      type: ACTIVITY_SET_CURRENT_HASH_SUCCESS,
      payload: {
        current: currentHash
      }
    });

    /*
   Not useful yet as form state is updated before the user does anything, so the user would see this no matter what

   yield put({
      type: ACTIVITY_SET_UNSAVED_NOTIFICATION,
      payload: {
        unsaved_notification: {
          visible: visible,
          message: visible ? 'There are unsaved changes on this form' : '',
          severity: 'warning'
        }
      }
    });
    */
  } catch (e) {
    console.error(e);
    yield put({
      type: ACTIVITY_SET_CURRENT_HASH_FAILURE
    });
  }
}

function* handle_URL_CHANGE(action) {
  const activityPageState = yield select(selectActivity);
  const isActivityURL = action.payload.url.includes('/Records/Activity:');
  if (isActivityURL) {
    const afterColon = action.payload.url.split(':')?.[1];
    let id;
    if (afterColon) {
      id = afterColon.includes('/') ? afterColon.split('/')[0] : afterColon;
    }
    if (id && id.length === 36 && activityPageState?.activity?.activity_id !== id)
      yield put({ type: ACTIVITY_GET_REQUEST, payload: { activityID: id } });

    /*    else if (userSettingsState.activeActivity) {
      id = userSettingsState.activeActivity;
      yield put({ type: ACTIVITY_GET_REQUEST, payload: { activityID: id } });
    }
    */
  }
}

function* handle_ACTIVITY_DELETE_FAILURE(action) {
  yield put({
    type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
    payload: {
      notification: {
        visible: true,
        message: 'Activity delete failed',
        severity: 'error'
      }
    }
  });
}


function* handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST(action) {
  const isViewing = action.payload.isViewing;
  const activityState = yield select(selectActivity);
  const  activity_subtype = activityState.ActivityPage.activity.activity_subtype; 
  const uiSchema = RootUISchemas[activity_subtype];

  let apiSpec;
  const userSettings = yield select(selectUserSettings);
  if(isViewing) {
     apiSpec = userSettings.apiDocsWithViewOptions
  }
  else
  {
    apiSpec = userSettings.apiDocsWithEditOptions
  }
  const components = apiSpec.components;
  const subtypeSchema = components?.schemas?.[activity_subtype];

  yield put({ type: ACTIVITY_BUILD_SCHEMA_FOR_FORM_SUCCESS, payload: { schema: subtypeSchema, uiSchema: uiSchema } });
}

function* activityPageSaga() {
  yield all([
    takeEvery(URL_CHANGE, handle_URL_CHANGE),
    takeEvery(ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST, handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST),
    takeEvery(ACTIVITY_GET_REQUEST, handle_ACTIVITY_GET_REQUEST),
    takeEvery(ACTIVITY_COPY_REQUEST, handle_ACTIVITY_COPY_REQUEST),
    takeEvery(ACTIVITY_PASTE_REQUEST, handle_ACTIVITY_PASTE_REQUEST),
    takeEvery(ACTIVITY_GET_NETWORK_REQUEST, handle_ACTIVITY_GET_NETWORK_REQUEST),
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, handle_USER_SETTINGS_READY),
    takeEvery(USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS, handle_USER_SETTINGS_READY),
    takeEvery(ACTIVITY_UPDATE_GEO_REQUEST, handle_ACTIVITY_UPDATE_GEO_REQUEST),
    takeEvery(ACTIVITY_UPDATE_GEO_SUCCESS, handle_ACTIVITY_UPDATE_GEO_SUCCESS),
    takeEvery(ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST, handle_GET_SUGGESTED_JURISDICTIONS_REQUEST),
    takeEvery(
      ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE,
      handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE
    ),
    takeLatest(ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS, handle_ACTIVITY_SET_CURRENT_HASH_REQUEST),
    takeLatest(ACTIVITY_ON_FORM_CHANGE_SUCCESS, handle_ACTIVITY_SET_CURRENT_HASH_REQUEST),
    takeEvery(ACTIVITY_SAVE_SUCCESS, handle_ACTIVITY_SET_SAVED_HASH_REQUEST),
    takeEvery(ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST, handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST),
    takeEvery(ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE, handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE),
    takeEvery(ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST, handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST),
    takeEvery(
      ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
      handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE
    ),
    takeEvery(ACTIVITY_SAVE_REQUEST, handle_ACTIVITY_SAVE_REQUEST),
    takeEvery(ACTIVITY_SAVE_SUCCESS, handle_ACTIVITY_SAVE_SUCCESS),
    takeEvery(ACTIVITY_TOGGLE_NOTIFICATION_REQUEST, handle_ACTIVITY_TOGGLE_NOTIFICATION_REQUEST),
    takeEvery(ACTIVITY_SAVE_NETWORK_REQUEST, handle_ACTIVITY_SAVE_NETWORK_REQUEST),
    takeEvery(ACTIVITY_RESTORE_OFFLINE, handle_ACTIVITY_RESTORE_OFFLINE),
    takeEvery(ACTIVITY_CREATE_REQUEST, handle_ACTIVITY_CREATE_REQUEST),
    takeEvery(ACTIVITY_CREATE_NETWORK, handle_ACTIVITY_CREATE_NETWORK),
    takeEvery(ACTIVITY_CREATE_SUCCESS, handle_ACTIVITY_CREATE_SUCCESS),
    takeEvery(ACTIVITY_SUBMIT_REQUEST, handle_ACTIVITY_SUBMIT_REQUEST),
    takeEvery(ACTIVITY_DEBUG, handle_ACTIVITY_DEBUG),
    takeEvery(ACTIVITY_GET_SUCCESS, handle_ACTIVITY_GET_SUCCESS),
    takeEvery(ACTIVITY_DELETE_PHOTO_REQUEST, handle_ACTIVITY_DELETE_PHOTO_REQUEST),
    takeEvery(ACTIVITY_ADD_PHOTO_REQUEST, handle_ACTIVITY_ADD_PHOTO_REQUEST),
    takeEvery(ACTIVITY_EDIT_PHOTO_REQUEST, handle_ACTIVITY_EDIT_PHOTO_REQUEST),
    takeEvery(ACTIVITY_DELETE_SUCCESS, handle_ACTIVITY_DELETE_SUCESS),
    takeEvery(ACTIVITY_DELETE_FAILURE, handle_ACTIVITY_DELETE_FAILURE),
    takeEvery(ACTIVITY_ON_FORM_CHANGE_REQUEST, handle_ACTIVITY_ON_FORM_CHANGE_REQUEST),
    takeEvery(
      ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
      handle_ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST
    ),
    takeEvery(ACTIVITY_UPDATE_AUTOFILL_REQUEST, () => console.log('ACTIVITY_UPDATE_AUTOFILL_REQUEST')),
    takeEvery(ACTIVITY_UPDATE_PHOTO_REQUEST, () => console.log('ACTIVITY_UPDATE_PHOTO_REQUEST')),
    takeEvery(ACTIVITY_LINK_RECORD_REQUEST, () => console.log('ACTIVITY_LINK_RECORD_REQUEST')),
    takeEvery(ACTIVITY_PERSIST_REQUEST, () => console.log('ACTIVITY_PERSIST_REQUEST')),
    takeEvery(ACTIVITY_SAVE_REQUEST, () => console.log('ACTIVITY_SAVE_REQUEST')),
    takeEvery(ACTIVITY_SUBMIT_REQUEST, () => console.log('ACTIVITY_SUBMIT_REQUEST')),
    takeEvery(ACTIVITY_DELETE_REQUEST, handle_ACTIVITY_DELETE_REQUEST),
    takeEvery(ACTIVITY_DELETE_NETWORK_REQUEST, handle_ACTIVITY_DELETE_NETWORK_REQUEST),
    takeEvery(PAN_AND_ZOOM_TO_ACTIVITY, handle_PAN_AND_ZOOM_TO_ACTIVITY),
    ...OFFLINE_ACTIVITY_SAGA_HANDLERS
  ]);
}

export default activityPageSaga;
