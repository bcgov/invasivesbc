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
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS,
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_ADD_PHOTO_REQUEST,
  ACTIVITY_DELETE_PHOTO_SUCCESS,
  ACTIVITY_ADD_PHOTO_SUCCESS,
  ACTIVITY_EDIT_PHOTO_SUCCESS,
  ACTIVITY_COPY_SUCCESS,
  ACTIVITY_PASTE_SUCCESS,
  ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
  ACTIVITY_SET_CURRENT_HASH_SUCCESS,
  ACTIVITY_SET_SAVED_HASH_SUCCESS,
  ACTIVITY_SET_UNSAVED_NOTIFICATION,
  ACTIVITY_GET_REQUEST,
  ACTIVITY_GET_FAILURE,
  ACTIVITY_CREATE_REQUEST,
  ACTIVITY_ERRORS
} from '../actions';

import { AppConfig } from '../config';

class ActivityState {
  initialized: boolean;
  loading: boolean;
  error: boolean;
  activity: any;
  suggestedJurisdictions: [];
  suggestedPersons: [];
  suggestedTreatmentIDs: [];
  current_activity_hash: string;
  saved_activity_hash: string;
  unsaved_notification: any;
  failCode: number;
  constructor() {
    this.initialized = false;
    this.current_activity_hash = null;
    this.saved_activity_hash = null;
  }
  notification: any;
}
const initialState = new ActivityState();

function createActivityReducer(configuration: AppConfig): (ActivityState, AnyAction) => ActivityState {
  return (state = initialState, action) => {
    switch (action.type) {
      case ACTIVITY_ERRORS: {
        const errorsFromCustomTransformer = action.payload.source === 'custom error transformer'?  action.payload.errors : null
        const errorsFromCustomValidator = action.payload.source === 'custom validator'?  action.payload.errors : null
        return {
          ...state,
          errorsFromCustomTransformer: errorsFromCustomTransformer,
          errorsFromCustomValidator: errorsFromCustomValidator
        };
      }
      case ACTIVITY_DELETE_SUCCESS: {
        return {
          ...new ActivityState()
        };
      }
      case ACTIVITY_CREATE_REQUEST: {
        return {
          ...new ActivityState()
        };
      }
      case ACTIVITY_GET_FAILURE: {
        return {
          ...state,
          loading: false,
          failCode: action.payload?.failNetworkObj?.status
        };
      }
      case ACTIVITY_GET_REQUEST: {
        return {
          ...state,
          failCode: null,
          loading: true
        };
      }
      case ACTIVITY_GET_SUCCESS: {
        return {
          ...state,
          activity: { ...action.payload.activity },
          suggestedTreatmentIDs: [],
          loading: false
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
                ...state.activity.form_data.activity_subtype_data,
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
      case ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS: {
        return {
          ...state,
          suggestedTreatmentIDs: [...action.payload.suggestedTreatmentIDs]
        };
      }
      case ACTIVITY_CREATE_SUCCESS: {
        return {
          ...state,
          activeActivity: action.payload.activity_id,
          current_activity_hash: null,
          saved_activity_hash: null
        };
      }
      case ACTIVITY_SAVE_SUCCESS: {
        return {
          ...state,
          activity: { ...action.payload.activity }
        };
      }
      case ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS: {
        return {
          ...state,
          notification: action.payload.notification
        };
      }
      case ACTIVITY_COPY_SUCCESS: {
        return {
          ...state,
          activity_copy_buffer: {
            form_data: action.payload.form_data
          }
        };
      }
      case ACTIVITY_PASTE_SUCCESS: {
        const newFormData = JSON.parse(JSON.stringify(state.activity_copy_buffer.form_data))
        return {
          ...state,
          activity: {
            ...state.activity,
            form_data: {
              ...newFormData
            }
          },
        };
      }
      case ACTIVITY_ADD_PHOTO_SUCCESS: {
        return {
          ...state,
          activity: {
            ...state.activity,
            media: [
              ...state.activity.media,
              action.payload.photo
            ]
          }
        };
      }
      case ACTIVITY_DELETE_PHOTO_SUCCESS: {
        return {
          ...state,
          activity: action.payload.activity
        };
      }
      case ACTIVITY_EDIT_PHOTO_SUCCESS: {
        return {
          ...state,
          activity: {
            ...state.activity,
            media: [...action.payload.media]
          }
        };
      }
      case ACTIVITY_SET_CURRENT_HASH_SUCCESS: {
        return {
          ...state,
          current_activity_hash: action.payload.current
        };
      }
      case ACTIVITY_SET_SAVED_HASH_SUCCESS: {
        return {
          ...state,
          saved_activity_hash: action.payload.saved
        };
      }
      case ACTIVITY_SET_UNSAVED_NOTIFICATION: {
        return {
          ...state,
          unsaved_notification: action.payload.unsaved_notification
        };
      }
      default:
        return state;
    }
  };
}

const selectActivity: (state) => ActivityState = (state) => state.ActivityPage;

export { createActivityReducer, selectActivity };
