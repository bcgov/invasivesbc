import { all, call, put, select, take, takeEvery } from 'redux-saga/effects';
import { buffer, distance, kinks, lineToPolygon } from '@turf/turf';
import { PayloadAction } from '@reduxjs/toolkit';
import { Feature } from 'geojson';
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
  handle_PAN_AND_ZOOM_TO_ACTIVITY
} from './activity/dataAccess';
import {
  handle_ACTIVITY_CREATE_NETWORK,
  handle_ACTIVITY_DELETE_NETWORK_REQUEST,
  handle_ACTIVITY_GET_NETWORK_REQUEST,
  handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE,
  handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
  handle_ACTIVITY_SAVE_NETWORK_REQUEST
} from './activity/online';
import { OFFLINE_ACTIVITY_SAGA_HANDLERS } from './activity/offline';
import { getCurrentJWT } from './auth/auth';
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
import AppActions, { IUserCoord } from 'state/actions/appActions/appActions';
import DrawToolActions from 'state/actions/drawtool/drawToolActions';
import { selectConfiguration, selectRootConfiguration } from 'state/reducers/configuration';
import { RootState } from 'state/reducers/rootReducer';

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

function* handle_LOAD_ACTIVITY_IF_REQUIRED(action: PayloadAction<string>) {
  // this replaces an urlChange handler with more specific handling
  const id = action.payload;
  const activityPageState: RootState['ActivityPage'] = yield select(selectActivity);
  const appModeUrl: string = yield select((state: RootState) => state.AppMode.url);

  if (!id || id.length !== 36) return;
  if (appModeUrl.match(/\/Activity\//) && id !== activityPageState?.formId) {
    yield put(Activity.getActivity(id));
  } else if (appModeUrl.match(/\/LegacyForm\//) && id !== activityPageState?.activity?.activity_id) {
    yield put(Activity.get(id));
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

function* handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST(action: PayloadAction<{ formCreatedByUser: boolean }>) {
  const { formCreatedByUser } = action.payload;
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

  /**
   * If a user creates a form, they should be restricted in agency/employer options (apiDocsWithselectOptions).
   * The exception to this rule is administrative users.
   * Admins need access to all codes because their responsibilities include creating forms on behalf of other users.
   */
  if (formCreatedByUser && !isAdmin) {
    // Contains Codes specific to the users account (Agencies/employers). These were entered from their `Request access` request.
    // If a regular user creates or accesses their own form, they should ALWAYS see their own applicable codes, not all of them.
    apiSpec = userSettings.apiDocsWithSelectOptions;
  } else {
    // Contains All Codes (Needed to render other peoples forms properly) Contains all the employer/agency codes so that forms render as expected.
    apiSpec = userSettings.apiDocsWithViewOptions;
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
  const userHasTrackingEnabled = coords && 'long' in coords;

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
  if (!activityState.geometry_details?.shape) {
    yield put(Alerts.create(mappingAlertMessages.trackMyPathStoppedEarly));
    yield put(GeoTracking.exit());
    return;
  }

  const validationErrors: AlertMessage[] = [];
  const currentGeo = activityState.geometry_details?.shape;
  if (!currentGeo) return;
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
      } else {
        return [MapActions.trackLocationStart()];
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
      } else {
        return [MapActions.trackLocationStart()];
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
function* handle_MAP_SET_COORDS(action: PayloadAction<IUserCoord>) {
  const MINIMUM_DISTANCE_BETWEEN_POINTS_IN_METERS = 1;
  const activityState = yield select(selectActivity);
  const status = activityState.track_me_draw_geo.status;
  const { longitude, latitude } = action.payload.position.coords;

  if (!isDrawing(status) || !longitude || !latitude) return;

  try {
    const currentGeo = activityState?.geometry_details?.shape ?? {
      type: 'Feature',
      properties: {},
      geometry: {
        type: GeoShapes.LineString,
        coordinates: []
      }
    };

    const nextCoords = [longitude, latitude];
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

    // append to linestring
    yield put(DrawToolActions.updateGeo([newGeo]));
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
/**
 * @desc Take a geometry from an existing record and apply it to the active record. Hooks into Draw tools so the shape can be edited after if needed
 * @param {PayloadAction} action Activity ID of Record
 */
function* handle_copyGeometry(action: PayloadAction<string>) {
  const { API_V2_BASE } = yield select(selectConfiguration);
  const baseConfig = yield select(selectRootConfiguration);
  const connected = yield select(selectNetworkConnected);
  const MOBILE = baseConfig.current.build.MOBILE;

  if (connected) {
    try {
      const res = yield fetch(`${API_V2_BASE}/ninja/activities/${action.payload}`, {
        headers: { authorization: yield getCurrentJWT(), 'Content-Type': 'application/json' }
      });
      if (res?.ok) {
        const { data } = yield res.json();
        if (data.shape) {
          yield put(DrawToolActions.createShape(data.shape));
          return; // Shape was extracted, no need to continue
        }
      }
    } catch (e) {
      console.error('[handle_copyGeometry]', e);
    }
  }
  if (MOBILE) {
    try {
      // Try getting the shape from our local cache
      const service = yield RecordCacheServiceFactory.getPlatformInstance();
      const data = yield service.loadActivity(action.payload);
      if (data.shape) {
        yield put(DrawToolActions.createShape(data.shape));
        return; // Shape was extracted, no need to continue
      }
    } catch (e) {
      console.error('[handle_copyGeometry]', e);
    }
  }
  // Neither the API nor local cache could get us the shape we wanted.
  yield put(
    Alerts.create({
      content: 'Failed to copy shape from record.',
      severity: AlertSeverity.Error,
      autoClose: 3,
      subject: AlertSubjects.Form
    })
  );
}

// Force updates to occur (Populating species arrays, jurisdictions, shapes if needed, etc)
function* handle_PASTE() {
  const activityState = yield select(selectActivity);
  yield put(Activity.onFormChangeRequest(activityState.activity.form_data));
}

function* activityPageSaga() {
  yield all([
    takeEvery(UserSettings.InitState.get, handle_UPDATE_CACHED_RECORDS),
    takeEvery(Activity.Autofill.copyGeometry, handle_copyGeometry),
    takeEvery(Activity.loadActivityIfRequired, handle_LOAD_ACTIVITY_IF_REQUIRED),
    takeEvery(Activity.buildFormSchema, handle_ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST),
    takeEvery(Activity.get, handle_ACTIVITY_GET_REQUEST),
    takeEvery(Activity.copy, handle_ACTIVITY_COPY_REQUEST),
    takeEvery(Activity.paste, handle_PASTE),
    takeEvery(Activity.getNetworkRequest, handle_ACTIVITY_GET_NETWORK_REQUEST),
    takeEvery(AppActions.setUserCoords, handle_MAP_SET_COORDS),
    takeEvery(DrawToolActions.updateGeo, handle_ACTIVITY_UPDATE_GEO_REQUEST),
    takeEvery(DrawToolActions.updateGeoSuccess, handle_ACTIVITY_UPDATE_GEO_SUCCESS),
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
    takeEvery(Activity.onFormChangeRequest, handle_ACTIVITY_ON_FORM_CHANGE_REQUEST),
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
