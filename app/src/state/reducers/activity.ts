import { calculateGeometryArea } from 'utils/geometryHelpers';
import {
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  ACTIVITY_UPDATE_GEO_FAILURE,
  ACTIVITY_UPDATE_AUTOFILL_REQUEST,
  ACTIVITY_UPDATE_AUTOFILL_SUCCESS,
  ACTIVITY_UPDATE_AUTOFILL_FAILURE,
  ACTIVITY_UPDATE_PHOTO_REQUEST,
  ACTIVITY_UPDATE_PHOTO_SUCCESS,
  ACTIVITY_UPDATE_PHOTO_FAILURE,
  ACTIVITY_LINK_RECORD_REQUEST,
  ACTIVITY_LINK_RECORD_SUCCESS,
  ACTIVITY_LINK_RECORD_FAILURE,
  ACTIVITY_PERSIST_REQUEST,
  ACTIVITY_PERSIST_SUCCESS,
  ACTIVITY_PERSIST_FAILURE,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_SAVE_FAILURE,
  ACTIVITY_SUBMIT_REQUEST,
  ACTIVITY_SUBMIT_SUCCESS,
  ACTIVITY_SUBMIT_FAILURE,
  ACTIVITY_DELETE_REQUEST,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_DELETE_FAILURE,
  ACTIVITY_GET_INITIAL_STATE_REQUEST,
  ACTIVITY_SET_ACTIVE_REQUEST,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
  ACTIVITY_CREATE_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class ActivityState {
  initialized: boolean;
  error: boolean;
  activity: any;
  suggestedJurisdictions: [];
  suggestedPersons: [];

  constructor() {
    this.initialized = false;
  }
}
const initialState = new ActivityState();

function createActivityReducer(configuration: AppConfig): (ActivityState, AnyAction) => ActivityState {
  return (state = initialState, action) => {
    switch (action.type) {
      case ACTIVITY_GET_SUCCESS: {
        return {
          ...state,
          activity: { ...action.payload.activity }
        };
      }
      case ACTIVITY_UPDATE_GEO_SUCCESS: {
        return {
          ...state,
          activity: {
            ...state.activity,
            geometry: action.payload.geometry,
            form_data: {
              ...state.activity.form_data,
              activity_data: {
                ...state.activity.form_data.activity_data,
                latitude: action.payload.lat,
                longitude: action.payload.long,
                utm_zone: action.payload.utm ? action.payload.utm[0] : null,
                utm_easting: action.payload.utm ? action.payload.utm[1] : null,
                utm_northing: action.payload.utm ? action.payload.utm[2] : null,
                reported_area: action.payload.reported_area
              },
              activity_subtype_data: {
                ...state.activity.activity_subtype_data,
                Well_Information: action.payload.Well_Information
              }
            }
          }
        };
      }
      case ACTIVITY_ON_FORM_CHANGE_SUCCESS: {
        return {
          ...state,
          activity: { ...action.payload.activity }
        };
      }
      case ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS: {
        return {
          ...state,
          suggestedJurisdictions: [...action.payload.jurisdictions]
        };
      }
      case ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS: {
        if (state.activity.activity_subtype === 'Observation' && !state.activity.initial_autofill_done) {
          return {
            ...state,
            suggestedPersons: [...action.payload.suggestedPersons]
          };
        }
        if (state.activity.activity_subtype === 'Treatment' && !state.activity.initial_autofill_done) {
          return {
            ...state,
            suggestedPersons: [...action.payload.suggestedPersons]
          };
        }
        return {
          ...state,
          suggestedPersons: [...action.payload.suggestedPersons]
        };
      }
      case ACTIVITY_CREATE_SUCCESS: {
        return {
          ...state,
          activeActivity: action.payload.activity_id
        };
      }
      case ACTIVITY_SAVE_SUCCESS: {
        return {
          ...state,
          activity: { ...action.payload.activity }
        };
      }
      default:
        return state;
    }
  };
}

const selectActivity: (state) => ActivityState = (state) => state.ActivityPage;

export { createActivityReducer, selectActivity };
