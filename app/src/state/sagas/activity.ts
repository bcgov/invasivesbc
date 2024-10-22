import { all, call, delay, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { buffer } from '@turf/turf';
import {
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
  ACTIVITY_DELETE_REQUEST,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_GET_NETWORK_REQUEST,
  ACTIVITY_GET_REQUEST,
  ACTIVITY_GET_SUCCESS,
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
  ACTIVITY_SUBMIT_REQUEST,
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  MAP_INIT_REQUEST,
  MAP_SET_COORDS,
  PAN_AND_ZOOM_TO_ACTIVITY,
  URL_CHANGE
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
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import { distance, kinks, lineToPolygon } from '@turf/turf';
import GeoShapes from 'constants/geoShapes';
import { calculateGeometryArea } from 'utils/geometryHelpers';
import geomWithinBC from 'utils/geomWithinBC';
import mappingAlertMessages from 'constants/alertMessages';
import AlertMessage from 'interfaces/AlertMessage';
import { selectNetworkConnected } from 'state/reducers/network';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import UserSettings from 'state/actions/userSettings/UserSettings';
import Prompt from 'state/actions/prompts/Prompt';
import Alerts from 'state/actions/alerts/Alerts';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import Activity from 'state/actions/activity/Activity';
import { selectMap } from 'state/reducers/map';

function* handle_USER_SETTINGS_READY(action) {
  // if (action.payload.activeActivity) {
  //    yield put({ type: ACTIVITY_GET_REQUEST, payload: { activityID: action.payload.activeActivity } });
  // }
}

function* handle_ACTIVITY_DEBUG(action) {}

function* handle_ACTIVITY_DELETE_SUCESS(action) {
  yield put(UserSettings.RecordSet.setSelected(null));
  yield put(
    Alerts.create({
      content: 'Activity deleted successfully',
      severity: AlertSeverity.Success,
      subject: AlertSubjects.Form
    })
  );
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
    if (action.type === ACTIVITY_ON_FORM_CHANGE_SUCCESS && !action.payload.unsavedDelay) return;

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
  yield put(
    Alerts.create({
      subject: AlertSubjects.Form,
      content: 'Activity delete failed',
      severity: AlertSeverity.Error
    })
  );
}

function* handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST(action) {
  const isViewing = action.payload.isViewing;
  const activityState = yield select(selectActivity);
  const activity_subtype = activityState?.activity?.activity_subtype;
  const uiSchema = RootUISchemas[activity_subtype];

  let apiSpec;
  var userSettings = yield select(selectUserSettings);
  if (!userSettings?.apiDocsWithViewOptions?.components) {
    yield take(UserSettings.InitState.getSuccess);
    userSettings = yield select(selectUserSettings);
  }
  if (isViewing) {
    apiSpec = userSettings.apiDocsWithViewOptions;
  } else {
    apiSpec = userSettings.apiDocsWithSelectOptions;
  }
  const components = apiSpec.components;
  const subtypeSchema = components?.schemas?.[activity_subtype];

  yield put({ type: ACTIVITY_BUILD_SCHEMA_FOR_FORM_SUCCESS, payload: { schema: subtypeSchema, uiSchema: uiSchema } });
}

/**
 * @desc Handler for starting GPS drawn shapes. Sets geometry to empty array, alerts user feature live.
 */
function* handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_START(action) {
  let message: AlertMessage;
  const shape = (yield select(selectActivity)).track_me_draw_geo.type;
  const coords = (yield select(selectMap))?.userCoords;

  switch (shape) {
    case GeoShapes.LineString:
      message = mappingAlertMessages.trackingStartedLineString;
      break;
    case GeoShapes.Polygon:
      message = mappingAlertMessages.trackingStartedPolygon;
      break;
    default:
      message = mappingAlertMessages.trackingStarted;
  }

  const initCoords = coords?.hasOwnProperty('long') ? [[coords.long, coords.lat]] : [];
  const initGeo = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: GeoShapes.LineString,
      coordinates: initCoords
    }
  };
  yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [initGeo] } });
  yield put(Alerts.create(message));
}

/**
 * @desc Handler for Finalizing GPS drawn shapes. Validates points of GPS, including closing point.
 *       If all validation passes, the shape is updated and tracking stops,
 *       else the user is prompted if they wish to abandon progress
 *       if they abandon progress, Alerts are cleared and shape is erased.
 *       If no, all validation messages appear, and user continues as they were.
 */
function* handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP(action) {
  const invalidCoordinatesErrorMessage = (minNumberCoords: number): AlertMessage => ({
    subject: AlertSubjects.Map,
    content: `Unable to get minimum number of coordinates (${minNumberCoords})`,
    severity: AlertSeverity.Error
  });
  let minNumberCoords: number = 0;
  const activityState = yield select(selectActivity);
  const shape = activityState.track_me_draw_geo.type;

  // Early exit on non-existent/zero-length geometry arrays
  if (!activityState.activity?.geometry || activityState.activity?.geometry?.length === 0) {
    yield put(Alerts.create(mappingAlertMessages.trackMyPathStoppedEarly));
    yield put(GeoTracking.earlyExit());
    return;
  }

  const validationErrors: AlertMessage[] = [];
  const currentGeo = activityState.activity.geometry[0];
  let newGeo = currentGeo;
  let geometryIsMinimumLength: boolean = false;

  switch (shape) {
    case GeoShapes.Polygon:
      minNumberCoords = 3;
      geometryIsMinimumLength = currentGeo.geometry.coordinates.length >= minNumberCoords;
      if (geometryIsMinimumLength) {
        // Cast current geometry to Polygon if possible
        newGeo = lineToPolygon(currentGeo) ?? currentGeo;
      }
      break;
    case GeoShapes.LineString:
      minNumberCoords = 2;
      geometryIsMinimumLength = currentGeo.geometry.coordinates.length >= minNumberCoords;
      break;
    default:
      break;
  }

  // Validation Checks

  const geographyWillContainIntersections = kinks(newGeo.geometry).features?.length > 0;
  const geometryHasPositiveArea = Math.floor(calculateGeometryArea(newGeo.geometry)) >= 0;

  // Error Alerts
  try {
    const geometryIsWithinBC = yield call(geomWithinBC, newGeo);
    if (!geometryIsWithinBC) {
      validationErrors.push(mappingAlertMessages.notWithinBC);
    }
  } catch (err) {
    validationErrors.push(mappingAlertMessages.cannotValidateRegion);
    console.error(err);
  }
  if (geographyWillContainIntersections) {
    validationErrors.push(mappingAlertMessages.willContainIntersections);
  }
  if (!geometryHasPositiveArea) {
    validationErrors.push(mappingAlertMessages.noAreaCalculated);
  }
  if (!geometryIsMinimumLength) {
    validationErrors.push(invalidCoordinatesErrorMessage(minNumberCoords));
  }

  if (validationErrors.length === 0) {
    if (shape === GeoShapes.LineString) {
      const lineStringCallback = (width: number) => {
        const bufferedLine = buffer(newGeo, width / 10000);
        return [
          { type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [bufferedLine] } },
          GeoTracking.earlyExit(),
          Alerts.create(mappingAlertMessages.trackingStoppedSuccess)
        ];
      };
      yield put(
        Prompt.number({
          title: 'Buffer needed',
          prompt: 'Enter width in meters for line to be buffered:',
          min: 0.001,
          acceptFloats: true,
          disableCancel: true,
          callback: lineStringCallback,
          label: 'Meters'
        })
      );
    } else {
      yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [newGeo] } });
      yield put(GeoTracking.earlyExit());
      yield put(Alerts.create(mappingAlertMessages.trackingStoppedSuccess));
    }
  } else {
    yield put(GeoTracking.pause());
    yield put(Alerts.create(mappingAlertMessages.canEditInfo));
    for (const error of validationErrors) {
      yield put(Alerts.create(error));
    }
    const callback = (userConfirmsExit: boolean) => {
      if (userConfirmsExit) {
        return [
          Alerts.deleteAll(),
          GeoTracking.earlyExit(),
          { type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [] } },
          Alerts.create(mappingAlertMessages.trackMyPathStoppedEarly)
        ];
      }
    };
    yield put(
      Prompt.confirmation({
        title: 'Errors in current geography',
        prompt: `You've attempted to stop tracking, but ${validationErrors.length} error(s) exist, do you want to abandon your progress?`,
        confirmText: 'Stop Tracking',
        cancelText: 'Continue',
        callback
      })
    );
  }
}

function* handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME() {
  yield put(Alerts.create(mappingAlertMessages.trackingResumed));
}
function* handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE() {
  yield put(Alerts.create(mappingAlertMessages.trackingPaused));
}
/**
 * @desc Handles new coordinates coming in from the TRACK_ME_GEO featureset.
 *       Evaluates distance between new and previous points to eliminate micro adjustments from GPS sway.
 */
function* handle_MAP_SET_COORDS(action) {
  const MINIMUM_DISTANCE_BETWEEN_POINTS_IN_METERS = 1;
  const activityState = yield select(selectActivity);
  const {
    track_me_draw_geo: { isTracking, drawingShape }
  } = activityState;

  if (isTracking && drawingShape) {
    let currentGeo = activityState?.activity?.geometry?.[0];
    if (!currentGeo) {
      currentGeo = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: GeoShapes.LineString,
          coordinates: []
        }
      };
    }

    const nextCoords = [action.payload.position.coords.longitude, action.payload.position.coords.latitude];
    const haveCoordinatesToCompare = currentGeo.geometry.coordinates.length > 0;
    if (haveCoordinatesToCompare) {
      const distanceBetweenPoints = distance(
        currentGeo.geometry.coordinates[currentGeo.geometry.coordinates.length - 1],
        nextCoords,
        { units: 'meters' }
      );
      if (distanceBetweenPoints <= MINIMUM_DISTANCE_BETWEEN_POINTS_IN_METERS) {
        return;
      }
    }
    const newGeo = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: currentGeo?.geometry?.type || GeoShapes.LineString,
        coordinates: [...currentGeo.geometry.coordinates, nextCoords]
      }
    };

    //append to linestring
    yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [newGeo] } });
  }
}
function* handle_ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE() {
  const connected = yield select(selectNetworkConnected);
  try {
    if (connected) {
      const networkReturn = yield InvasivesAPI_Call('GET', '/api/biocontrol-treatments');
      yield put(Activity.Suggestions.biocontrolOnlineSuccess(networkReturn?.data?.result ?? []));
    }
  } catch (ex) {
    console.error(ex);
  }
}

function* activityPageSaga() {
  yield all([
    takeEvery(URL_CHANGE, handle_URL_CHANGE),
    takeEvery(ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST, handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST),
    takeEvery(ACTIVITY_GET_REQUEST, handle_ACTIVITY_GET_REQUEST),
    takeEvery(ACTIVITY_COPY_REQUEST, handle_ACTIVITY_COPY_REQUEST),
    takeEvery(ACTIVITY_PASTE_REQUEST, handle_ACTIVITY_PASTE_REQUEST),
    takeEvery(ACTIVITY_GET_NETWORK_REQUEST, handle_ACTIVITY_GET_NETWORK_REQUEST),
    takeEvery(MAP_SET_COORDS, handle_MAP_SET_COORDS),
    takeEvery(UserSettings.InitState.getSuccess, handle_USER_SETTINGS_READY),
    takeEvery(UserSettings.Activity.setActiveActivityIdSuccess, handle_USER_SETTINGS_READY),
    takeEvery(ACTIVITY_UPDATE_GEO_REQUEST, handle_ACTIVITY_UPDATE_GEO_REQUEST),
    takeEvery(ACTIVITY_UPDATE_GEO_SUCCESS, handle_ACTIVITY_UPDATE_GEO_SUCCESS),
    takeEvery(Activity.Suggestions.jurisdictions, handle_GET_SUGGESTED_JURISDICTIONS_REQUEST),
    takeEvery(Activity.Suggestions.jurisdictionsOnline, handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE),
    takeLatest(Activity.Suggestions.jurisdictionsSuccess, handle_ACTIVITY_SET_CURRENT_HASH_REQUEST),
    takeLatest(ACTIVITY_ON_FORM_CHANGE_SUCCESS, handle_ACTIVITY_SET_CURRENT_HASH_REQUEST),
    takeEvery(ACTIVITY_SAVE_SUCCESS, handle_ACTIVITY_SET_SAVED_HASH_REQUEST),
    takeEvery(Activity.Suggestions.persons, handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST),
    takeEvery(Activity.Suggestions.personsOnline, handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE),
    takeEvery(Activity.Suggestions.treatmentIdsRequest, handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST),
    takeEvery(Activity.Suggestions.biocontrolOnline, handle_ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE),
    takeEvery(
      Activity.Suggestions.treatmentIdsRequestOnline,
      handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE
    ),
    takeEvery(ACTIVITY_SAVE_REQUEST, handle_ACTIVITY_SAVE_REQUEST),
    takeEvery(ACTIVITY_SAVE_SUCCESS, handle_ACTIVITY_SAVE_SUCCESS),
    takeEvery(ACTIVITY_SAVE_NETWORK_REQUEST, handle_ACTIVITY_SAVE_NETWORK_REQUEST),
    takeEvery(ACTIVITY_RESTORE_OFFLINE, handle_ACTIVITY_RESTORE_OFFLINE),
    takeEvery(ACTIVITY_CREATE_REQUEST, handle_ACTIVITY_CREATE_REQUEST),
    takeEvery(ACTIVITY_CREATE_NETWORK, handle_ACTIVITY_CREATE_NETWORK),
    takeEvery(ACTIVITY_CREATE_SUCCESS, handle_ACTIVITY_CREATE_SUCCESS),
    takeEvery(ACTIVITY_SUBMIT_REQUEST, handle_ACTIVITY_SUBMIT_REQUEST),
    takeEvery(ACTIVITY_DEBUG, handle_ACTIVITY_DEBUG),
    takeEvery(ACTIVITY_GET_SUCCESS, handle_ACTIVITY_GET_SUCCESS),
    takeEvery(Activity.Photo.delete, handle_ACTIVITY_DELETE_PHOTO_REQUEST),
    takeEvery(Activity.Photo.add, handle_ACTIVITY_ADD_PHOTO_REQUEST),
    takeEvery(Activity.Photo.edit, handle_ACTIVITY_EDIT_PHOTO_REQUEST),
    takeEvery(ACTIVITY_DELETE_SUCCESS, handle_ACTIVITY_DELETE_SUCESS),
    takeEvery(ACTIVITY_DELETE_FAILURE, handle_ACTIVITY_DELETE_FAILURE),
    takeEvery(ACTIVITY_ON_FORM_CHANGE_REQUEST, handle_ACTIVITY_ON_FORM_CHANGE_REQUEST),
    takeEvery(
      ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
      handle_ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST
    ),
    takeEvery(Activity.Autofill.update, () => console.log('Activity.Autofill.update')),
    takeEvery(Activity.Photo.update, () => console.log('Activity.Photo.update')),
    takeEvery(ACTIVITY_LINK_RECORD_REQUEST, () => console.log('ACTIVITY_LINK_RECORD_REQUEST')),
    takeEvery(ACTIVITY_PERSIST_REQUEST, () => console.log('ACTIVITY_PERSIST_REQUEST')),
    takeEvery(ACTIVITY_SAVE_REQUEST, () => console.log('ACTIVITY_SAVE_REQUEST')),
    takeEvery(ACTIVITY_SUBMIT_REQUEST, () => console.log('ACTIVITY_SUBMIT_REQUEST')),
    takeEvery(ACTIVITY_DELETE_REQUEST, handle_ACTIVITY_DELETE_REQUEST),
    takeEvery(ACTIVITY_DELETE_NETWORK_REQUEST, handle_ACTIVITY_DELETE_NETWORK_REQUEST),
    takeEvery(PAN_AND_ZOOM_TO_ACTIVITY, handle_PAN_AND_ZOOM_TO_ACTIVITY),
    takeEvery(GeoTracking.start, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_START),
    takeEvery(GeoTracking.stop, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP),
    takeEvery(GeoTracking.pause, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE),
    takeEvery(GeoTracking.resume, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME),
    ...OFFLINE_ACTIVITY_SAGA_HANDLERS
  ]);
}

export default activityPageSaga;
