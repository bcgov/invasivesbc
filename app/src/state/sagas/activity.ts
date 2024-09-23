import { all, call, delay, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { buffer } from '@turf/turf';
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
  ACTIVITY_SUBMIT_REQUEST,
  ACTIVITY_UPDATE_AUTOFILL_REQUEST,
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  ACTIVITY_UPDATE_PHOTO_REQUEST,
  GET_API_DOC_SUCCESS,
  MAP_INIT_REQUEST,
  MAP_SET_COORDS,
  MAP_SET_WHATS_HERE_SECTION,
  MAP_TOGGLE_TRACKING,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_START,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE,
  NEW_ALERT,
  PAN_AND_ZOOM_TO_ACTIVITY,
  URL_CHANGE,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
  CLEAR_ALERTS,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME,
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE_SUCCESS,
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS,
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS_SUCCESS
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
import { promptConfirmationInput, promptNumberInput } from 'utils/userPrompts';
import { selectNetworkConnected } from 'state/reducers/network';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';

function* handle_USER_SETTINGS_READY(action) {
  // if (action.payload.activeActivity) {
  //    yield put({ type: ACTIVITY_GET_REQUEST, payload: { activityID: action.payload.activeActivity } });
  // }
}

function* handle_ACTIVITY_DEBUG(action) {}

function* handle_ACTIVITY_DELETE_SUCESS(action) {
  yield put({
    type: USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
    payload: {
      activeActivity: null
    }
  });
  yield put({
    type: NEW_ALERT,
    payload: {
      content: 'Activity deleted successfully',
      severity: AlertSeverity.Success,
      subject: AlertSubjects.Form
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
    type: NEW_ALERT,
    payload: {
      subject: AlertSubjects.Form,
      message: 'Activity delete failed',
      severity: AlertSeverity.Error
    }
  });
}

function* handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST(action) {
  const isViewing = action.payload.isViewing;
  const activityState = yield select(selectActivity);
  const activity_subtype = activityState?.activity?.activity_subtype;
  const uiSchema = RootUISchemas[activity_subtype];

  let apiSpec;
  var userSettings = yield select(selectUserSettings);
  if (!userSettings?.apiDocsWithViewOptions?.components) {
    yield take(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS);
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
  const shape = (yield select(selectActivity))?.track_me_draw_geo?.type;
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
  yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [] } });
  yield put({ type: NEW_ALERT, payload: message });
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
    yield put({ type: NEW_ALERT, payload: mappingAlertMessages.trackMyPathStoppedEarly });
    yield put({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE });
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

  const geometryIsWithinBC = yield call(geomWithinBC, newGeo);
  const geographyWillContainIntersections = kinks(newGeo.geometry).features?.length > 0;
  const geometryHasPositiveArea = Math.floor(calculateGeometryArea(newGeo.geometry)) >= 0;

  // Error Alerts
  if (!geometryIsWithinBC) {
    validationErrors.push(mappingAlertMessages.notWithinBC);
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
          { type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE },
          { type: NEW_ALERT, payload: mappingAlertMessages.trackingStoppedSuccess }
        ];
      };
      yield put(
        promptNumberInput({
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
      yield put({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE });
      yield put({ type: NEW_ALERT, payload: mappingAlertMessages.trackingStoppedSuccess });
    }
  } else {
    yield put({ type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE });
    yield put({ type: NEW_ALERT, payload: mappingAlertMessages.canEditInfo });
    for (const error of validationErrors) {
      yield put({ type: NEW_ALERT, payload: error });
    }
    const callback = (userConfirmsExit: boolean) => {
      if (userConfirmsExit) {
        return [
          { type: CLEAR_ALERTS },
          { type: MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE },
          { type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [] } },
          { type: NEW_ALERT, payload: mappingAlertMessages.trackMyPathStoppedEarly }
        ];
      }
    };
    yield put(
      promptConfirmationInput({
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
  yield put({ type: NEW_ALERT, payload: mappingAlertMessages.trackingResumed });
}
function* handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE() {
  yield put({ type: NEW_ALERT, payload: mappingAlertMessages.trackingPaused });
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
      yield put({
        type: ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE_SUCCESS,
        payload: { suggestedBiocontrolTreatments: networkReturn?.data?.result ?? [] }
      });
    }
  } catch (ex) {
    console.error(ex);
  }
}

function* handle_ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS(action) {
  const activityState = yield select(selectActivity);
  const { agentListTarget, plantCode } = action.payload;

  // Get the complete list of Biocontrol agents
  const biocontrolState =
    activityState?.biocontrol?.listOfAgents ??
    activityState?.schema?.properties?.activity_subtype_data?.properties?.[agentListTarget]?.items?.properties
      ?.biological_agent_code.options ??
    null;

  if (plantCode && biocontrolState) {
    const treatmentsBasedOnPlant = activityState.biocontrol.plantToAgentMap.map(
      (item: Record<string, any>) => item.plant_code_name === plantCode && item.agent_code_name
    );
    const filteredAgents = biocontrolState.filter((item: Record<string, any>) =>
      treatmentsBasedOnPlant.includes(item.value)
    );
    yield put({
      type: ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS_SUCCESS,
      payload: { suggestedBiocontrolTreatments: filteredAgents, agentListTarget }
    });
  } else if (biocontrolState) {
    yield put({
      type: ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS_SUCCESS,
      payload: { suggestedBiocontrolTreatments: biocontrolState, agentListTarget }
    });
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
      ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE,
      handle_ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE
    ),
    takeEvery(ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS, handle_ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS),
    takeEvery(
      ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
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
    takeEvery(MAP_TOGGLE_TRACK_ME_DRAW_GEO_START, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_START),
    takeEvery(MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP),
    takeEvery(MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE),
    takeEvery(MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME),
    ...OFFLINE_ACTIVITY_SAGA_HANDLERS
  ]);
}

export default activityPageSaga;
