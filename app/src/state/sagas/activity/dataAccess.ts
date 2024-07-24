import { call, put, select, take } from 'redux-saga/effects';
import center from '@turf/center';
import centroid from '@turf/centroid';
import booleanContains from '@turf/boolean-contains';
import {
  activity_create_function,
  ActivityStatus,
  ActivitySubtype,
  ActivityType,
  MAX_AREA,
  populateSpeciesArrays
} from 'sharedAPI';
import { kinks } from '@turf/turf';
import { selectMap } from 'state/reducers/map';

import {
  autoFillNameByPAC,
  autoFillSlopeAspect,
  autoFillTotalBioAgentQuantity,
  autoFillTotalReleaseQuantity
} from 'rjsf/business-rules/populateCalculatedFields';
import {
  ACTIVITY_ADD_PHOTO_FAILURE,
  ACTIVITY_ADD_PHOTO_SUCCESS,
  ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST,
  ACTIVITY_COPY_FAILURE,
  ACTIVITY_COPY_SUCCESS,
  ACTIVITY_CREATE_FAILURE,
  ACTIVITY_CREATE_LOCAL,
  ACTIVITY_CREATE_NETWORK,
  ACTIVITY_DELETE_FAILURE,
  ACTIVITY_DELETE_NETWORK_REQUEST,
  ACTIVITY_DELETE_PHOTO_FAILURE,
  ACTIVITY_DELETE_PHOTO_SUCCESS,
  ACTIVITY_EDIT_PHOTO_FAILURE,
  ACTIVITY_EDIT_PHOTO_SUCCESS,
  ACTIVITY_GET_INITIAL_STATE_FAILURE,
  ACTIVITY_GET_LOCAL_REQUEST,
  ACTIVITY_GET_NETWORK_REQUEST,
  ACTIVITY_GET_REQUEST,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST,
  ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
  ACTIVITY_ON_FORM_CHANGE_REQUEST,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_PASTE_FAILURE,
  ACTIVITY_PASTE_SUCCESS,
  ACTIVITY_SAVE_NETWORK_FAILURE,
  ACTIVITY_SAVE_NETWORK_REQUEST,
  ACTIVITY_SAVE_OFFLINE,
  ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  MAIN_MAP_MOVE,
  MAP_INIT_REQUEST,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
  USER_SETTINGS_SET_MAP_CENTER_REQUEST
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectAuth } from 'state/reducers/auth';
import { isLinkedTreatmentSubtype, populateJurisdictionArray } from 'utils/addActivity';
import { getFieldsToCopy } from 'rjsf/business-rules/formDataCopyFields';
import { getClosestWells } from 'utils/closestWellsHelpers';
import { calc_utm } from 'utils/utm';
import { calculateGeometryArea, calculateLatLng } from 'utils/geometryHelpers';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { selectConfiguration } from 'state/reducers/configuration';
import { selectNetworkConnected } from 'state/reducers/network';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';

let BC_AREA: any = null;

export function* handle_ACTIVITY_GET_REQUEST(action) {
  const { MOBILE } = yield select(selectConfiguration);

  try {
    if (MOBILE) {
      yield put({ type: ACTIVITY_GET_LOCAL_REQUEST, payload: { activityID: action.payload.activityID } });
    } else {
      yield put({ type: ACTIVITY_GET_NETWORK_REQUEST, payload: { activityID: action.payload.activityID } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_COPY_REQUEST(action) {
  try {
    const activityState = yield select(selectActivity);
    const activityData = { ...activityState.activity.form_data.activity_data };
    const activitySubtypeData = { ...activityState.activity.form_data.activity_subtype_data };

    // call business rule function to exclude certain fields of the activity_data of the form data
    const activityDataToCopy = getFieldsToCopy(activityData, activitySubtypeData).activityData;

    const formDataToCopy = {
      ...activityState.activity.form_data,
      activity_data: activityDataToCopy
    };
    yield put({
      type: ACTIVITY_COPY_SUCCESS,
      payload: {
        form_data: formDataToCopy
      }
    });
  } catch (e) {
    yield put({ type: ACTIVITY_COPY_FAILURE, payload: {} });
  }
}

export function* handle_ACTIVITY_PASTE_REQUEST(action) {
  try {
    yield put({ type: ACTIVITY_PASTE_SUCCESS, payload: {} });
  } catch (e) {
    yield put({ type: ACTIVITY_PASTE_FAILURE, payload: {} });
  }
}

const checkForMisLabledMultiPolygon = (input) => {
  if (input.geometry.type !== 'MultiPolygon') {
    return false;
  }
  if (
    input.geometry.type === 'MultiPolygon' &&
    input.geometry.coordinates.length === 1 &&
    input.geometry.coordinates[0][0][0].length === 2
  ) {
    console.log('MultiPolygon mislabeled as Polygon, correcting...');
    return true;
  }
  return false;
};

const fixMisLabledMultiPolygon = (input) => {
  if (checkForMisLabledMultiPolygon(input)) {
    return {
      ...input,
      type: 'Feature',
      geometry: { ...input.geometry, type: 'Polygon', coordinates: [...input.geometry.coordinates[0]] }
    };
  } else {
    return input;
  }
};

function isNumber(value?: string | number): boolean {
  return value != null && value !== '' && !isNaN(Number(value.toString()));
}

export function* handle_ACTIVITY_UPDATE_GEO_REQUEST(action) {
  const activityState = yield select(selectActivity);
  try {
    // get spatial fields based on geo
    const { latitude, longitude } = calculateLatLng(action.payload.geometry) || {};
    let utm;
    if (latitude && longitude) utm = calc_utm(longitude, latitude);
    const modifiedPayload = JSON.parse(JSON.stringify(action.payload.geometry));

    if (action.payload.geometry && action.payload.geometry.length > 0) {
      if (action.payload.geometry[0].geometry.type === 'Point') {
        // if not radius in properties:
        if (!action.payload.geometry[0].properties.radius) {
          let userEnteredArea = undefined;
          while (
            !(isNumber(userEnteredArea) && userEnteredArea !== null && [1, 5, 10].includes(Number(userEnteredArea)))
          ) {
            userEnteredArea = parseInt(prompt('Enter area of geometry in square meters (1, 5, or 10):'));
          }
          const radiusBasedOnArea = Math.sqrt(userEnteredArea / Math.PI);
          modifiedPayload[0].properties.radius = radiusBasedOnArea;
        }
      }
    }

    let reported_area = calculateGeometryArea(modifiedPayload.geometry);

    if (modifiedPayload.length < 1) {
      yield put({
        type: ACTIVITY_UPDATE_GEO_SUCCESS,
        payload: {
          geometry: modifiedPayload.geometry,
          utm: utm,
          lat: latitude,
          long: longitude,
          reported_area: reported_area,
          Well_Information: []
        }
      });
      return;
    }
    const sanitizedGeo = fixMisLabledMultiPolygon(modifiedPayload[0]);
    const isWIPLinestring = sanitizedGeo.geometry.type === 'LineString';
    const isPointGeometry = sanitizedGeo.geometry.type === 'Point';
    reported_area = calculateGeometryArea([sanitizedGeo]);
    if (!isPointGeometry) {
      const hasSelfIntersections = kinks(sanitizedGeo.geometry).features.length > 0;
      if (hasSelfIntersections) {
        yield put({
          type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
          payload: {
            severity: AlertSeverity.Error,
            subject: AlertSubjects.Map,
            content: 'Activity geometry intersects itself',
          }
        });

        return;
      }
    }

    let wellInformationArr = [];
    let nearestWells = null;
    let areWellsInside = false;
    if (reported_area < MAX_AREA && !isWIPLinestring) {
      if (latitude && longitude) {
        nearestWells = yield getClosestWells(sanitizedGeo, true);
      }
      if (!nearestWells || !nearestWells.well_objects || nearestWells.well_objects.length < 1) {
        wellInformationArr = [
          {
            well_id: 'No wells found',
            well_proximity: 'No wells found'
          }
        ];
      } else {
        const { well_objects } = nearestWells;
        areWellsInside = nearestWells.areWellsInside;
        console.dir(well_objects);
        well_objects.forEach((well) => {
          if (well.proximity || well.inside) {
            wellInformationArr.push({
              well_id: well.properties.WELL_TAG_NUMBER.toString(),
              well_proximity: well.inside ? '0' : well.proximity.toString()
            });
          }
        });
      }
    }

    //validate its in bc and within max geometry:

    let isWithinBC = false;
    let geoToTest;
    if (sanitizedGeo.geometry.type === 'MultiPolygon') {
      geoToTest = centroid(sanitizedGeo.geometry);
    } else {
      geoToTest = sanitizedGeo;
    }
    if (sanitizedGeo) {
      if (BC_AREA === null) {
        try {
          BC_AREA = (yield import('./_bcArea')).default;
        } catch (e) {
          console.error('could not load bc geometry file, unable to validate bounds');
        }
      }
      // it's possible it's still null if the import failed
      if (BC_AREA !== null) {
        isWithinBC = booleanContains(BC_AREA.features[0] as any, geoToTest as any);
      }
    }

    if (activityState.activity.activity_subtype === 'Activity_Treatment_ChemicalPlantTerrestrial' && areWellsInside) {
      yield put({
        type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
        payload: {
          notification: {
            visible: true,
            message: 'Warning!  Wells inside treatment area',
            severity: 'warning'
          }
        }
      });
    }

    if (!isWithinBC && !isWIPLinestring) {
      yield put({
        type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
        payload: {
          notification: {
            visible: true,
            message: 'Activity is not within BC',
            severity: 'error'
          }
        }
      });

      return;
    }

    yield put({
      type: ACTIVITY_UPDATE_GEO_SUCCESS,
      payload: {
        geometry: [sanitizedGeo],
        utm: utm,
        lat: latitude,
        long: longitude,
        reported_area: reported_area,
        Well_Information: wellInformationArr
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_SAVE_SUCCESS(action) {
  const activity_id = yield select((state) => state.ActivityPage.activity.activity_id);
  try {
    yield put({ type: ACTIVITY_GET_REQUEST, payload: { activityID: activity_id } });
    yield put({
      type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
      payload: {
        notification: {
          visible: true,
          message: 'Activity saved successfully',
          severity: 'success'
        }
      }
    });

    yield put({ type: MAP_INIT_REQUEST });
  } catch (e) {
    console.error(e);
  }
}

export function* handle_ACTIVITY_SAVE_REQUEST(action) {
  const activityState = yield select(selectActivity);
  const { MOBILE } = yield select(selectConfiguration);

  if (MOBILE) {
    yield put({
      type: ACTIVITY_SAVE_OFFLINE,
      payload: { id: activityState?.activity?.activity_id, data: activityState?.activity }
    });
  } else {
    try {
      yield put({
        type: ACTIVITY_SAVE_NETWORK_REQUEST,
        payload: { activity_id: activityState.activity_id, updatedFormData: action.payload?.updatedFormData }
      });
    } catch (e) {
      console.error(e);
      yield put({ type: ACTIVITY_SAVE_NETWORK_FAILURE });
    }
  }
}

export function* handle_ACTIVITY_TOGGLE_NOTIFICATION_REQUEST(action) {
  try {
    yield put({
      type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
      payload: {
        notification: {
          ...action.payload.notification
        }
      }
    });
  } catch (e) {
    console.error(e);
  }
}

export function* handle_ACTIVITY_CREATE_REQUEST(action) {
  const { MOBILE } = yield select(selectConfiguration);

  try {
    const authState = yield select(selectAuth);
    //    const { extendedInfo, displayName, roles } = useSelector(selectAuth);

    const newActivity = yield call(
      activity_create_function,
      action.payload.type,
      action.payload.subType,
      authState.username,
      authState.displayName,
      authState.extendedInfo.pac_number
    );

    if (MOBILE) {
      yield put({ type: ACTIVITY_CREATE_LOCAL, payload: { id: newActivity.activity_id, data: newActivity } });
    } else {
      yield put({ type: ACTIVITY_CREATE_NETWORK, payload: { activity: newActivity } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_CREATE_FAILURE });
  }
}

export function* handle_ACTIVITY_CREATE_SUCCESS(action) {
  try {
    yield put({
      type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
      payload: { activeActivity: action.payload.activity_id, id: action.payload.activity_id }
    });
    yield put({
      type: ACTIVITY_GET_REQUEST,
      payload: {
        activityID: action.payload.activity_id
      }
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
    const mapState = yield select(selectMap);

    let updatedFormData = action.payload.eventFormData;

    updatedFormData = autoFillSlopeAspect(updatedFormData, lastField);

    if (
      beforeActivity.activity_type === ActivityType.Biocontrol ||
      beforeActivity.activity_subtype === ActivitySubtype.Treatment_BiologicalPlant ||
      beforeActivity.activity_subtype === ActivitySubtype.Monitoring_BiologicalDispersal ||
      beforeActivity.activity_subtype === ActivitySubtype.Monitoring_BiologicalTerrestrialPlant
    ) {
      //auto fills total release quantity (only on biocontrol release activity)
      updatedFormData = autoFillTotalReleaseQuantity(updatedFormData);
      //auto fills total bioagent quantity (only on biocontrol release monitoring activity)
      updatedFormData = autoFillTotalBioAgentQuantity(updatedFormData);
      // Autofills total bioagent quantity specifically for biocontrol collections
      // updatedFormData = autofillBiocontrolCollectionTotalQuantity(updatedFormData);
    }

    if (beforeState.activity.activity_type === ActivityType.Treatment && beforeState.suggestedPersons) {
      updatedFormData = autoFillNameByPAC(updatedFormData, beforeState.suggestedPersons);
    }
    let updatedActivity = populateSpeciesArrays({ ...beforeActivity, form_data: updatedFormData });
    updatedActivity = populateJurisdictionArray({ ...updatedActivity });

    //handleRecordLinking(updatedFormData);

    yield put({
      type: ACTIVITY_ON_FORM_CHANGE_SUCCESS,
      payload: {
        activity: updatedActivity,
        lastField: action.payload.lastField,
        unsavedDelay: action.payload.unsavedDelay
      }
    });

    // try to reduce calls to copy geometry
    const linked_id = updatedFormData.activity_type_data?.linked_id;
    const oldLinkedId = beforeActivity.form_data.activity_type_data?.linked_id;
    const oldCopyGeometry = beforeActivity.form_data.activity_type_data?.copy_geometry;

    if (
      updatedFormData.activity_type_data?.copy_geometry === 'Yes' &&
      linked_id &&
      (oldLinkedId !== linked_id || oldCopyGeometry !== 'Yes')
    ) {
      const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${linked_id}`);
      const linked_geo = networkReturn.data.geometry[0];
      yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [linked_geo] } });
      yield take(ACTIVITY_UPDATE_GEO_SUCCESS);
    } else if (
      beforeActivity.form_data.activity_type_data?.copy_geometry === 'Yes' &&
      updatedFormData.activity_type_data.copy_geometry === 'No'
    ) {
      yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [] } });
      yield take(ACTIVITY_UPDATE_GEO_SUCCESS);
    }

    //call autofill events
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_CREATE_FAILURE });
  }
}

export function* handle_ACTIVITY_SUBMIT_REQUEST(action) {
  const activityState = yield select(selectActivity);
  try {
    yield put({
      type: ACTIVITY_SAVE_NETWORK_REQUEST,
      payload: { activity_id: activityState.activity_id, form_status: ActivityStatus.SUBMITTED }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_DELETE_REQUEST(action) {
  const activityState = yield select(selectActivity);
  try {
    yield put({
      type: ACTIVITY_DELETE_NETWORK_REQUEST,
      payload: { activity_id: activityState.activity_id }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_DELETE_FAILURE });
  }
}

export function* handle_ACTIVITY_UPDATE_GEO_SUCCESS(action) {
  try {
    const currentState = yield select(selectActivity);
    const currentActivity = currentState.activity;

    const wipLinestring = currentActivity?.geometry?.[0]?.geometry?.type === 'LineString';

    if (currentActivity?.geometry && currentActivity?.form_data?.activity_data?.reported_area < MAX_AREA && !wipLinestring) {
      yield put({
        type: ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST,
        payload: { search_feature: currentActivity.geometry }
      });

      if (isLinkedTreatmentSubtype(currentActivity.activity_subtype)) {
        yield put({
          type: ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST,
          payload: {
            activity: currentActivity
          }
        });
      }
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_GET_SUGGESTED_JURISDICTIONS_REQUEST(action) {
  const connected = yield select(selectNetworkConnected);

  try {
    if (connected) {
      yield put({
        type: ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE,
        payload: { search_feature: action.payload.search_feature }
      });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST(action) {
  const connected = yield select(selectNetworkConnected);

  try {
    if (connected) {
      yield put({
        type: ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE,
        payload: {}
      });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST(action) {
  const payloadActivity = action.payload.activity;
  const AuthState = yield select(selectAuth);
  try {
    // filter Treatments and/or Biocontrol
    let linkedActivitySubtypes = [];

    switch (payloadActivity.activity_subtype) {
      case 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant':
        linkedActivitySubtypes = [
          ActivitySubtype.Treatment_MechanicalPlant,
          ActivitySubtype.Treatment_MechanicalPlantAquatic
        ];
        break;
      case 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant':
        linkedActivitySubtypes = [
          ActivitySubtype.Treatment_ChemicalPlant,
          ActivitySubtype.Treatment_ChemicalPlantAquatic
        ];
        break;
      case 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant':
        linkedActivitySubtypes = [ActivitySubtype.Treatment_BiologicalPlant];
        break;
      default:
        break;
    }

    const search_feature = payloadActivity.geometry?.[0]
      ? {
        type: 'FeatureCollection',
        features: payloadActivity.geometry
      }
      : false;

    if (linkedActivitySubtypes.length > 0) {
      yield put({
        type: ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
        payload: {
          activity_subtype: linkedActivitySubtypes,
          user_roles: AuthState.accessRoles,
          search_feature
        }
      });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_PAN_AND_ZOOM_TO_ACTIVITY(action) {
  const activityState = yield select(selectActivity);

  const geometry = activityState?.activity?.geometry?.[0];
  if (geometry) {
    const isPoint = geometry.geometry?.type === 'Point' ? true : false;
    let target;
    if (isPoint) {
      target = geometry.geometry;
    } else {
      const acentroid = centroid(geometry);

      target = acentroid.geometry;
    }

    console.dir(target);
    yield put({
      type: MAIN_MAP_MOVE,
      payload: { center: { lat: target.coordinates[1], lng: target.coordinates[0] }, zoom: 16 }
    });
  }
}

// some form autofill on create stuff will likely need to go here
export function* handle_ACTIVITY_GET_SUCCESS(action) {
  try {
    const activityState = yield select(selectActivity);
    const type = activityState?.activity?.activity_subtype;

    yield put({
      type: ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST,
      payload: {}
    });
    yield put({
      type: ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST,
      payload: { search_feature: activityState.activity.geometry }
    });

    // needs to be latlng expression
    const isGeo = action.payload.activity?.geometry?.[0]?.geometry?.coordinates ? true : false;
    //const centerPoint = center(action.payload.activity?.geometry[0]?.geometry?.coordinates);

    let centerPoint;
    if (isGeo) {
      centerPoint = center(action.payload.activity?.geometry[0]?.geometry);
    }
    if (centerPoint && isGeo) {
      yield put({
        type: USER_SETTINGS_SET_MAP_CENTER_REQUEST,
        payload: {
          center: centerPoint.geometry.coordinates
        }
      });
    }
    if (isLinkedTreatmentSubtype(type)) {
      yield put({
        type: ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST,
        payload: {
          ...action.payload
        }
      });
    }
    let isViewing = true;
    const authState = yield select(selectAuth);
    const userName = authState.username;
    const created_by = action.payload.activity.created_by;
    const accessRoles = authState.accessRoles;
    const createdByUser = userName === created_by;
    const userIsAdmin = accessRoles?.some((
      (role: Record<string, any>) => [1, 18].includes(role.role_id)
    ));

    if (userIsAdmin || createdByUser) {
      isViewing = false;
    }

    yield put({
      type: ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST,
      payload: {
        isViewing: isViewing
      }
    });

  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST(action) {
  try {
    yield put({
      type: ACTIVITY_ON_FORM_CHANGE_REQUEST,
      payload: { eventFormData: action.payload.eventFormData }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_ADD_PHOTO_REQUEST(action) {
  try {
    if (action.payload.photo) {
      yield put({ type: ACTIVITY_ADD_PHOTO_SUCCESS, payload: { ...action.payload } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_ADD_PHOTO_FAILURE });
  }
}

export function* handle_ACTIVITY_DELETE_PHOTO_REQUEST(action) {
  try {
    if (action.payload.photo) {
      const beforeState = yield select(selectActivity);
      const beforeActivity = beforeState.activity;

      const media = beforeActivity.media.filter((photo) => {
        if (photo.media_key) {
          return photo.media_key !== action.payload.photo.media_key;
        } else {
          return photo.file_name !== action.payload.photo.file_name;
        }
      });

      let media_keys = [];
      if (beforeActivity.media_keys) {
        media_keys = beforeActivity.media_keys.filter((key) => {
          if (action.payload.photo.media_key) {
            return key !== action.payload.photo.media_key;
          }
        });
      }

      let delete_keys = [];
      if (beforeActivity.media_delete_keys?.length) {
        delete_keys = [...beforeActivity.media_delete_keys];
      }
      if (action.payload.photo.media_key) {
        delete_keys.push(action.payload.photo.media_key);
      }

      yield put({
        type: ACTIVITY_DELETE_PHOTO_SUCCESS,
        payload: {
          activity: {
            ...beforeActivity,
            media: media.length ? media : [],
            media_keys: media_keys.length ? media_keys : [],
            media_delete_keys: delete_keys
          }
        }
      });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_DELETE_PHOTO_FAILURE });
  }
}

export function* handle_ACTIVITY_EDIT_PHOTO_REQUEST(action) {
  try {
    const beforeState = yield select(selectActivity);
    const beforeActivityMedia = JSON.parse(JSON.stringify(beforeState.activity.media));
    const photoIndex = beforeActivityMedia.findIndex((photo) => photo.file_name === action.payload.photo.file_name);

    if (photoIndex >= 0) {
      beforeActivityMedia[photoIndex] = action.payload.photo;
    }

    yield put({
      type: ACTIVITY_EDIT_PHOTO_SUCCESS,
      payload: {
        media: beforeActivityMedia
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_EDIT_PHOTO_FAILURE });
  }
}
