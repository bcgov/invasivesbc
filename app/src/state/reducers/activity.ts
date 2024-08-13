import { createNextState } from '@reduxjs/toolkit';
import {
  ACTIVITY_ADD_PHOTO_SUCCESS,
  ACTIVITY_BUILD_SCHEMA_FOR_FORM_SUCCESS,
  ACTIVITY_COPY_SUCCESS,
  ACTIVITY_CREATE_REQUEST,
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_DELETE_PHOTO_SUCCESS,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_EDIT_PHOTO_SUCCESS,
  ACTIVITY_ERRORS,
  ACTIVITY_GET_FAILURE,
  ACTIVITY_GET_REQUEST,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_PASTE_SUCCESS,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_SET_CURRENT_HASH_SUCCESS,
  ACTIVITY_SET_SAVED_HASH_SUCCESS,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO_START
} from '../actions';

import { AppConfig } from '../config';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';

interface ActivityState {
  activity: any;
  current_activity_hash: string | null;
  error: boolean;
  pasteCount: number;
  failCode: number | null;
  initialized: boolean;
  loading: boolean;
  saved_activity_hash: string | null;
  suggestedJurisdictions: [];
  suggestedPersons: [];
  suggestedTreatmentIDs: [];
  track_me_draw_geo: boolean;
  activity_copy_buffer: object | null;
}

const initialState: ActivityState = {
  activity: null,
  current_activity_hash: null,
  error: false,
  pasteCount: 0,
  failCode: null,
  initialized: false,
  loading: false,
  track_me_draw_geo: false,
  saved_activity_hash: null,
  suggestedJurisdictions: [],
  suggestedPersons: [],
  suggestedTreatmentIDs: [],
  activity_copy_buffer: null
};

function createActivityReducer(configuration: AppConfig): (ActivityState, AnyAction) => ActivityState {
  return (state = initialState, action) => {
    return createNextState(state, (draftState) => {
      switch (action.type) {
        case ACTIVITY_ERRORS: {
          if (action.payload.errors !== undefined)
            draftState.activityErrors = getCustomErrorTransformer()(action.payload.errors);
          break;
        }
        case ACTIVITY_DELETE_SUCCESS: {
          draftState = {
            activity: null,
            current_activity_hash: null,
            error: false,
            pasteCount: 0,
            failCode: null,
            initialized: false,
            loading: false,
            saved_activity_hash: null,
            suggestedJurisdictions: [],
            suggestedPersons: [],
            suggestedTreatmentIDs: []
          };
          break;
        }
        case ACTIVITY_CREATE_REQUEST: {
          const activity_copy_buffer = JSON.parse(JSON.stringify(draftState.activity_copy_buffer));
          draftState = {
            activity: null,
            current_activity_hash: null,
            error: false,
            pasteCount: 0,
            failCode: null,
            initialized: false,
            loading: false,
            saved_activity_hash: null,
            suggestedJurisdictions: [],
            suggestedPersons: [],
            suggestedTreatmentIDs: [],
            activity_copy_buffer
          };
          break;
        }
        case ACTIVITY_GET_FAILURE: {
          draftState.loading = false;
          draftState.failCode = action.payload?.failNetworkObj?.status;
          break;
        }
        case ACTIVITY_GET_REQUEST: {
          draftState.failCode = null;
          draftState.loading = true;
          break;
        }
        case ACTIVITY_GET_SUCCESS: {
          draftState.activity = { ...action.payload.activity };
          draftState.suggestedTreatmentIDs = [];
          draftState.loading = false;
          break;
        }
        case ACTIVITY_BUILD_SCHEMA_FOR_FORM_SUCCESS: {
          draftState.uiSchema = action.payload.uiSchema;
          draftState.schema = action.payload.schema;
          break;
        }
        case ACTIVITY_UPDATE_GEO_SUCCESS: {
          draftState.activity.geometry = action.payload.geometry;
          draftState.activity.form_data.activity_data.latitude = action.payload.lat ? action.payload.lat : null;
          draftState.activity.form_data.activity_data.longitude = action.payload.long ? action.payload.long : null;
          draftState.activity.form_data.activity_data.utm_zone = action.payload.utm ? action.payload.utm[0] : null;
          draftState.activity.form_data.activity_data.utm_easting = action.payload.utm ? action.payload.utm[1] : null;
          draftState.activity.form_data.activity_data.utm_northing = action.payload.utm ? action.payload.utm[2] : null;
          draftState.activity.form_data.activity_data.reported_area = action.payload.reported_area
            ? action.payload.reported_area
            : null;
          draftState.activity.form_data.activity_subtype_data.Well_Information = action.payload.Well_Information;
          break;
        }
        case ACTIVITY_ON_FORM_CHANGE_SUCCESS: {
          draftState.activity.form_data = action.payload.activity.form_data;
          draftState.activity.species_positive = action.payload.activity.species_positive;
          draftState.activity.species_negative = action.payload.activity.species_negative;
          draftState.activity.species_treated = action.payload.activity.species_treated;
          draftState.activity.jurisdiction = action.payload.activity.jurisdiction;
          break;
        }
        case ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS: {
          draftState.suggestedJurisdictions = [...action.payload.jurisdictions];
          break;
        }
        case ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS: {
          if (draftState.activity.activity_subtype === 'Observation' && !draftState.activity.initial_autofill_done) {
            draftState.suggestedPersons = [...action.payload.suggestedPersons];
          }
          if (draftState.activity.activity_subtype === 'Treatment' && !draftState.activity.initial_autofill_done) {
            draftState.suggestedPersons = [...action.payload.suggestedPersons];
          }
          draftState.suggestedPersons = [...action.payload.suggestedPersons];
          break;
        }
        case ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS: {
          draftState.suggestedTreatmentIDs = [...action.payload.suggestedTreatmentIDs];
          break;
        }
        case ACTIVITY_CREATE_SUCCESS: {
          draftState.activeActivity = action.payload.activity_id;
          draftState.current_activity_hash = null;
          draftState.saved_activity_hash = null;
          break;
        }
        case ACTIVITY_SAVE_SUCCESS: {
          draftState.activity = { ...action.payload.activity };
          break;
        }
        case ACTIVITY_COPY_SUCCESS: {
          draftState.activity_copy_buffer = {
            form_data: action.payload.form_data
          };
          break;
        }
        case ACTIVITY_PASTE_SUCCESS: {
          draftState.pasteCount = draftState.pasteCount + 1;
          draftState.activity.form_data = JSON.parse(JSON.stringify(draftState.activity_copy_buffer.form_data));
          break;
        }
        case ACTIVITY_ADD_PHOTO_SUCCESS: {
          draftState.activity.media.push(action.payload.photo);
          break;
        }
        case ACTIVITY_DELETE_PHOTO_SUCCESS: {
          draftState.activity = action.payload.activity;
          break;
        }
        case MAP_TOGGLE_TRACK_ME_DRAW_GEO_START: {
          draftState.track_me_draw_geo = true;
          break;
        }
        case MAP_TOGGLE_TRACK_ME_DRAW_GEO_CLOSE: {
          draftState.track_me_draw_geo = false;
          break;
        }
        case ACTIVITY_EDIT_PHOTO_SUCCESS: {
          draftState.activity.media = action.payload.media;
          break;
        }
        case ACTIVITY_SET_CURRENT_HASH_SUCCESS: {
          draftState.current_activity_hash = action.payload.current;
          break;
        }
        case ACTIVITY_SET_SAVED_HASH_SUCCESS: {
          draftState.saved_activity_hash = action.payload.saved;
          break;
        }
        default:
          return state;
      }
    }) as unknown as ActivityState;
  };
}

const selectActivity: (state) => ActivityState = (state) => state.ActivityPage;

export { createActivityReducer, selectActivity };
