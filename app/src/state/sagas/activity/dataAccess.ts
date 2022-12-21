import { getClosestWells } from 'components/activity/closestWellsHelpers';
import { calc_utm } from 'components/map/Tools/ToolTypes/Nav/DisplayPosition';
import { ActivityStatus, ActivitySubtype, ActivityType } from 'constants/activities';
import { put, select } from 'redux-saga/effects';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import center from '@turf/center';

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
  ACTIVITY_CREATE_FAILURE,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST,
  ACTIVITY_ON_FORM_CHANGE_REQUEST,
  ACTIVITY_DEBUG,
  ACTIVITY_DELETE_PHOTO_REQUEST,
  ACTIVITY_DELETE_PHOTO_SUCCESS,
  ACTIVITY_DELETE_PHOTO_FAILURE,
  ACTIVITY_ADD_PHOTO_SUCCESS,
  ACTIVITY_ADD_PHOTO_FAILURE,
  ACTIVITY_EDIT_PHOTO_SUCCESS,
  ACTIVITY_EDIT_PHOTO_FAILURE,
  USER_SETTINGS_SET_MAP_CENTER_REQUEST
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectAuth } from 'state/reducers/auth';
import {
  generateDBActivityPayload,
  populateSpeciesArrays,
  isLinkedTreatmentSubtype,
  populateJurisdictionArray
} from 'utils/addActivity';
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
    let utm;
    if (latitude && longitude) utm = calc_utm(longitude, latitude);
    const reported_area = calculateGeometryArea(action.payload.geometry);

    let wellInformationArr = [];
    let nearestWells = null;
    if (latitude && longitude) {
      nearestWells = yield getClosestWells(action.payload.geometry, true);
    }
    if (!nearestWells || !nearestWells.well_objects || nearestWells.well_objects.length < 1) {
      wellInformationArr = [
        {
          well_id: 'No wells found',
          well_proximity: 'No wells found'
        }
      ];
    } else {
      const { well_objects, areWellsInside } = nearestWells;
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

    yield put({
      type: ACTIVITY_UPDATE_GEO_SUCCESS,
      payload: {
        geometry: action.payload.geometry,
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
    //    const { extendedInfo, displayName, roles } = useSelector(selectAuth);

    let activityV1 = generateDBActivityPayload({}, null, action.payload.type, action.payload.subType);
    let activityV2 = populateSpeciesArrays(activityV1);
    activityV2.created_by = authState.username;
    activityV2.user_role = authState.accessRoles.map((role) => role.role_id);

    //    if ([ActivityType.Observation, ActivityType.Treatment].includes(activityV2.activity_type))
    {
      activityV2.form_data.activity_type_data.activity_persons = [{ person_name: authState.displayName }];
    }

    if ([ActivityType.Treatment].includes(activityV2.activity_type)) {
      activityV2.form_data.activity_type_data.activity_persons[0].applicator_license =
        authState.extendedInfo.pac_number;
    }

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
      payload: { activeActivity: action.payload.activity_id, id: action.payload.activity_id }
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

    if (beforeState.activity.activity_type === ActivityType.Treatment) {
      updatedFormData = autoFillNameByPAC(updatedFormData, beforeState.suggestedPersons);
    }
    let updatedActivity = populateSpeciesArrays({ ...beforeActivity, form_data: updatedFormData });
    updatedActivity = populateJurisdictionArray({ ...updatedActivity });

    //handleRecordLinking(updatedFormData);

    yield put({
      type: ACTIVITY_ON_FORM_CHANGE_SUCCESS,
      payload: { activity: updatedActivity, lastField: action.payload.lastField }
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

export function* handle_ACTIVITY_UPDATE_GEO_SUCCESS(action) {
  try {
    const currentState = yield select(selectActivity);
    const currentActivity = currentState.activity;

    if (currentActivity?.geometry) {
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
  try {
    yield put({
      type: ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE,
      payload: { search_feature: action.payload.search_feature }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST(action) {
  try {
    yield put({
      type: ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE,
      payload: {}
    });
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

// some form autofill on create stuff will likely need to go here
export function* handle_ACTIVITY_GET_SUCCESS(action) {
  try {
    const activityState = yield select(selectActivity);
    const type = activityState?.activity?.activity_subtype;

    yield put({
      type: ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST,
      payload: {}
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
    const beforeActivity = beforeState.activity;
    const photoIndex = beforeActivity.media.findIndex((photo) => photo.file_name === action.payload.photo.file_name);

    if (photoIndex >= 0) {
      beforeActivity.media[photoIndex] = action.payload.photo;
    }

    yield put({
      type: ACTIVITY_EDIT_PHOTO_SUCCESS,
      payload: {
        media: beforeActivity.media
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_EDIT_PHOTO_FAILURE });
  }
}
