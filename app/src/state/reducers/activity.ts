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
ACTIVITY_GET_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class ActivityState {
  initialized: boolean;
  error: boolean;

  persistedActivityData: Object;
  rjsfFormData: Object;
  geometry: any;
  activity: any;
  
  //?
  requestHeaders: {
    authorization: string;
  };

  activeActivity: number;

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
          ...state, activity: action.payload.activity
        };
      }
      case ACTIVITY_UPDATE_GEO_SUCCESS: {
        return {
          ...state, activity: {...state.activity, geometry: action.payload.geometry,
           formData: {...state.activity.formData, 
            latitude: action.payload.lat, longitude: action.payload.long,
            utm_zone: action.payload.utm[0], utm_easting: action.payload.utm[1], utm_northing: action.payload.utm[2], 
            reported_area: action.payload.reported_area} 
        }};
      }
      case ACTIVITY_UPDATE_GEO_FAILURE: {
        return {
          ...state,
        };
      }
      default:
        return state;
    }
  };
}

const selectActivity: (state) => ActivityState = (state) => state.ActivityPage;

export { createActivityReducer, selectActivity};
