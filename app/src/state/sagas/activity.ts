import { all, call, put, select, take, takeEvery } from 'redux-saga/effects';
import { buffer, distance, kinks, lineToPolygon } from '@turf/turf';
import { PayloadAction } from '@reduxjs/toolkit';
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
import { OFFLINE_ACTIVITY_SAGA_HANDLERS } from './activity/offline';
import { ACTIVITY_ON_FORM_CHANGE_REQUEST, ACTIVITY_UPDATE_GEO_SUCCESS } from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectUserSettings } from 'state/reducers/userSettings';
import RootUISchemas from 'rjsf/uiSchema/RootUISchemas';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import GeoShapes from 'constants/geoShapes';
import { calculateGeometryArea } from 'utils/geometryHelpers';
import geomWithinBC from 'utils/geomWithinBC';
import mappingAlertMessages from 'constants/alerts/mappingAlerts';
import AlertMessage from 'interfaces/AlertMessage';
import { selectNetworkConnected, selectNetworkState } from 'state/reducers/network';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import UserSettings from 'state/actions/userSettings/UserSettings';
import Prompt from 'state/actions/prompts/Prompt';
import Alerts from 'state/actions/alerts/Alerts';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import Activity from 'state/actions/activity/Activity';
import { selectMap } from 'state/reducers/map';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import cacheAlertMessages from 'constants/alerts/cacheAlerts';
import MapActions from 'state/actions/map';
import { selectAuth } from 'state/reducers/auth';
import { Role } from 'constants/roles';
import { GEO_TRACKING_FEATURE } from 'UI/Features/LegacyMap/helpers/functional/constants';
import { isDrawing } from 'utils/geoTrackingHelpers';
import AppActions from 'state/actions/appActions/appActions';
import DrawToolActions from 'state/actions/drawtool/drawToolActions';
import { Feature } from 'geojson';

function* handle_ACTIVITY_DELETE_SUCCESS() {
  yield put(UserSettings.RecordSet.setSelected(null));
  yield put(
    Alerts.create({
      content: 'Activity deleted successfully',
      severity: AlertSeverity.Success,
      subject: AlertSubjects.Form
    })
  );
  yield put(MapActions.initRequest());
}

function* handle_URL_CHANGE(action: PayloadAction<string>) {
  const activityPageState = yield select(selectActivity);
  const isActivityURL = action.payload.includes('/Records/Activity:');
  if (isActivityURL) {
    const afterColon = action.payload.split(':')?.[1];
    let id;
    if (afterColon) {
      id = afterColon.includes('/') ? afterColon.split('/')[0] : afterColon;
    }
    if (id && id.length === 36 && activityPageState?.activity?.activity_id !== id) yield put(Activity.get(id));
  }
}

function* handle_ACTIVITY_DELETE_FAILURE() {
  yield put(
    Alerts.create({
      subject: AlertSubjects.Form,
      content: 'Activity delete failed',
      severity: AlertSeverity.Error
    })
  );
}

function* handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST(action: PayloadAction<{ isViewing: boolean }>) {
  const { isViewing } = action.payload;
  const activityState = yield select(selectActivity);
  const activity_subtype = activityState?.activity?.activity_subtype;
  const uiSchema = RootUISchemas[activity_subtype];
  const isAdmin = ((yield select(selectAuth))?.accessRoles ?? []).some(
    (role) => role.role_name === Role.MASTER_ADMINISTRATOR || role.role_name === Role.ADMIN_PLANTS
  );
  let apiSpec;
  let userSettings = yield select(selectUserSettings);
  if (!userSettings?.apiDocsWithViewOptions?.components) {
    yield take(UserSettings.InitState.getSuccess);
    userSettings = yield select(selectUserSettings);
  }

  if (isViewing || isAdmin) {
    // Admins get all codes as they fill out data on behalf of other users
    apiSpec = userSettings.apiDocsWithViewOptions;
  } else {
    apiSpec = userSettings.apiDocsWithSelectOptions;
  }

  const components = apiSpec.components;
  const subtypeSchema = components?.schemas?.[activity_subtype];
  yield put(Activity.buildFormSchemaSuccess({ schema: subtypeSchema, uiSchema: uiSchema }));
}

/**
 * @desc Handler for starting GPS drawn shapes. Sets geometry to empty array, alerts user feature live.
 */
function* handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_START() {
  const shape = (yield select(selectActivity)).track_me_draw_geo.shapeType;
  const coords = (yield select(selectMap))?.userCoords;

  const message = (() => {
    switch (shape) {
      case GeoShapes.LineString:
        return mappingAlertMessages.trackingStartedLineString;
      case GeoShapes.Polygon:
        return mappingAlertMessages.trackingStartedPolygon;
      default:
        return mappingAlertMessages.trackingStarted;
    }
  })();
  const userHasTrackingEnabled = 'long' in coords;

  if (userHasTrackingEnabled) {
    const initGeo: Feature = {
      id: GEO_TRACKING_FEATURE,
      type: 'Feature',
      properties: {},
      geometry: {
        type: GeoShapes.LineString,
        coordinates: [[coords.long, coords.lat]]
      }
    };
    yield put(DrawToolActions.updateGeo([initGeo]));
    yield put(Alerts.create(message));
    yield put(Alerts.create(mappingAlertMessages.geoTrackingModeLocked));
  } else {
    yield put(GeoTracking.stop());
    yield put(Alerts.create(mappingAlertMessages.cannotGetUsersCoordinates));
  }
}

/**
 * @desc Handler for Finalizing GPS drawn shapes. Validates points of GPS, including closing point.
 *       If all validation passes, the shape is updated and tracking stops,
 *       else the user is prompted if they wish to abandon progress
 *       if they abandon progress, Alerts are cleared and shape is erased.
 *       If no, all validation messages appear, and user continues as they were.
 */
function* handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP() {
  const invalidCoordinatesErrorMessage = (minNumberCoords: number): AlertMessage => ({
    subject: AlertSubjects.Map,
    content: `Unable to get minimum number of coordinates (${minNumberCoords})`,
    severity: AlertSeverity.Error
  });
  let minNumberCoords: number = 0;
  const activityState = yield select(selectActivity);
  const shape = activityState.track_me_draw_geo.shapeType;

  // Early exit on non-existent/zero-length geometry arrays
  if (!activityState.activity?.geometry || activityState.activity?.geometry?.length === 0) {
    yield put(Alerts.create(mappingAlertMessages.trackMyPathStoppedEarly));
    yield put(GeoTracking.exit());
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
    const callback = (userConfirmsExit: boolean) => {
      if (userConfirmsExit) {
        return [
          Alerts.deleteAll(),
          GeoTracking.exit(),
          DrawToolActions.updateGeo([]),
          Alerts.create(mappingAlertMessages.trackMyPathStoppedEarly)
        ];
      }
    };
    yield put(
      Prompt.confirmation({
        title: 'Errors in current geography',
        prompt: `You've attempted to stop tracking, but the shape intersects itself, do you want to abandon your progress?`,
        confirmText: 'Stop Tracking',
        cancelText: 'Continue',
        callback
      })
    );

    return;
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
        const bufferedLine = buffer(newGeo, width / 10000) as Feature;
        return [
          DrawToolActions.updateGeo([bufferedLine]),
          GeoTracking.end(),
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
      yield put(DrawToolActions.updateGeo([newGeo]));
      yield put(GeoTracking.end());
      yield put(Alerts.create(mappingAlertMessages.trackingStoppedSuccess));
    }
  } else {
    yield put(GeoTracking.pause());
    for (const error of validationErrors) {
      yield put(Alerts.create(error));
    }
    const callback = (userConfirmsExit: boolean) => {
      if (userConfirmsExit) {
        return [
          Alerts.deleteAll(),
          GeoTracking.exit(),
          DrawToolActions.updateGeo([]),
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
  yield put(Alerts.create(mappingAlertMessages.canEditInfo));
}

/**
 * @desc Handles new coordinates coming in from the TRACK_ME_GEO featureset.
 *       Evaluates distance between new and previous points to eliminate micro adjustments from GPS sway.
 */
function* handle_MAP_SET_COORDS(action) {
  const MINIMUM_DISTANCE_BETWEEN_POINTS_IN_METERS = 1;
  const activityState = yield select(selectActivity);
  const {
    track_me_draw_geo: { status }
  } = activityState;
  try {
    if (isDrawing(status)) {
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
      const newGeo: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: currentGeo?.geometry?.type || GeoShapes.LineString,
          coordinates: [...currentGeo.geometry.coordinates, nextCoords]
        }
      };
      //append to linestring
      yield put(DrawToolActions.updateGeo([newGeo]));
    }
  } catch (err) {
    console.error(err);
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

/**
 * @desc Once per day, synchronize Activity record caches.
 */
function* handle_UPDATE_CACHED_RECORDS() {
  try {
    const { connected } = yield select(selectNetworkState);
    if (buildTimeConfig.MOBILE && connected) {
      const recordsWereUpdated = yield (yield RecordCacheServiceFactory.getPlatformInstance()).updateActivityCaches();
      if (recordsWereUpdated) {
        yield Alerts.create(cacheAlertMessages.updateCachesSuccess);
      }
    }
  } catch (_e) {
    yield Alerts.create(cacheAlertMessages.updateCachesFailed);
  }
}

function* activityPageSaga() {
  yield all([
    takeEvery(UserSettings.InitState.get, handle_UPDATE_CACHED_RECORDS),
    takeEvery(AppActions.urlChange, handle_URL_CHANGE),
    takeEvery(Activity.buildFormSchema, handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST),
    takeEvery(Activity.get, handle_ACTIVITY_GET_REQUEST),
    takeEvery(Activity.copy, handle_ACTIVITY_COPY_REQUEST),
    takeEvery(Activity.getNetworkRequest, handle_ACTIVITY_GET_NETWORK_REQUEST),
    takeEvery(AppActions.setUserCoords, handle_MAP_SET_COORDS),
    takeEvery(DrawToolActions.updateGeo, handle_ACTIVITY_UPDATE_GEO_REQUEST),
    takeEvery(ACTIVITY_UPDATE_GEO_SUCCESS, handle_ACTIVITY_UPDATE_GEO_SUCCESS),
    takeEvery(Activity.Suggestions.jurisdictions, handle_GET_SUGGESTED_JURISDICTIONS_REQUEST),
    takeEvery(Activity.Suggestions.jurisdictionsOnline, handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE),
    takeEvery(Activity.Suggestions.persons, handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST),
    takeEvery(Activity.Suggestions.personsOnline, handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE),
    takeEvery(Activity.Suggestions.treatmentIdsRequest, handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST),
    takeEvery(Activity.Suggestions.biocontrolOnline, handle_ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE),
    takeEvery(
      Activity.Suggestions.treatmentIdsRequestOnline,
      handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE
    ),
    takeEvery(Activity.save, handle_ACTIVITY_SAVE_REQUEST),
    takeEvery(Activity.saveSuccess, handle_ACTIVITY_SAVE_SUCCESS),
    takeEvery(Activity.saveNetworkRequest, handle_ACTIVITY_SAVE_NETWORK_REQUEST),
    takeEvery(Activity.createReq, handle_ACTIVITY_CREATE_REQUEST),
    takeEvery(Activity.createNetwork, handle_ACTIVITY_CREATE_NETWORK),
    takeEvery(Activity.createSuccess, handle_ACTIVITY_CREATE_SUCCESS),
    takeEvery(Activity.submit, handle_ACTIVITY_SUBMIT_REQUEST),
    takeEvery(Activity.getSuccess, handle_ACTIVITY_GET_SUCCESS),
    takeEvery(Activity.Photo.delete, handle_ACTIVITY_DELETE_PHOTO_REQUEST),
    takeEvery(Activity.Photo.add, handle_ACTIVITY_ADD_PHOTO_REQUEST),
    takeEvery(Activity.Photo.edit, handle_ACTIVITY_EDIT_PHOTO_REQUEST),
    takeEvery(Activity.deleteSuccess, handle_ACTIVITY_DELETE_SUCCESS),
    takeEvery(Activity.deleteFailure, handle_ACTIVITY_DELETE_FAILURE),
    takeEvery(ACTIVITY_ON_FORM_CHANGE_REQUEST, handle_ACTIVITY_ON_FORM_CHANGE_REQUEST),
    takeEvery(
      Activity.ChemicalTreatments.onChemicalTreatmentsUpdate,
      handle_ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST
    ),
    takeEvery(Activity.deleteReq, handle_ACTIVITY_DELETE_REQUEST),
    takeEvery(Activity.deleteNetwork, handle_ACTIVITY_DELETE_NETWORK_REQUEST),
    takeEvery(MapActions.panToActivity, handle_PAN_AND_ZOOM_TO_ACTIVITY),
    takeEvery(GeoTracking.start, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_START),
    takeEvery(GeoTracking.stop, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_STOP),
    takeEvery(GeoTracking.pause, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_PAUSE),
    takeEvery(GeoTracking.resume, handle_MAP_TOGGLE_TRACK_ME_DRAW_GEO_RESUME),
    ...OFFLINE_ACTIVITY_SAGA_HANDLERS
  ]);
}

export default activityPageSaga;
