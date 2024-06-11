import { createNextState } from '@reduxjs/toolkit';
import {
  ACTIVITY_ADD_PHOTO_SUCCESS,
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
  ACTIVITY_SET_UNSAVED_NOTIFICATION,
  ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  MAP_TOGGLE_TRACK_ME_DRAW_GEO
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
  notification: any | null;
  saved_activity_hash: string | null;
  suggestedJurisdictions: [];
  suggestedPersons: [];
  suggestedTreatmentIDs: [];
  track_me_draw_geo: boolean;
  unsaved_notification: any | null;
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
  notification: null,
  saved_activity_hash: null,
  suggestedJurisdictions: [],
  suggestedPersons: [],
  suggestedTreatmentIDs: [],
  unsaved_notification: null,
  activity_copy_buffer: null
};

function createActivityReducer(configuration: AppConfig): (ActivityState, AnyAction) => ActivityState {
  return (state = initialState, action) => {
    return createNextState(state, (draftState) => {
      if (ACTIVITY_ERRORS.match(action)) {
        if (action.payload.errors !== undefined)
          draftState.activityErrors = getCustomErrorTransformer()(action.payload.errors);
      }
      if (ACTIVITY_DELETE_SUCCESS.match(action)) {
        draftState = {
          activity: null,
          current_activity_hash: null,
          error: false,
          pasteCount: 0,
          failCode: null,
          initialized: false,
          loading: false,
          notification: null,
          saved_activity_hash: null,
          suggestedJurisdictions: [],
          suggestedPersons: [],
          suggestedTreatmentIDs: [],
          unsaved_notification: null
        };
      }
      if (ACTIVITY_CREATE_REQUEST.match(action)) {
        const activity_copy_buffer = JSON.parse(JSON.stringify(draftState.activity_copy_buffer));
        draftState = {
          activity: null,
          current_activity_hash: null,
          error: false,
          pasteCount: 0,
          failCode: null,
          initialized: false,
          loading: false,
          notification: null,
          saved_activity_hash: null,
          suggestedJurisdictions: [],
          suggestedPersons: [],
          suggestedTreatmentIDs: [],
          unsaved_notification: null,
          activity_copy_buffer
        };
      }
      if (ACTIVITY_GET_FAILURE.match(action)) {
        draftState.loading = false;
        draftState.failCode = action.payload?.failNetworkObj?.status;
      }
      if (ACTIVITY_GET_REQUEST.match(action)) {
        draftState.failCode = null;
        draftState.loading = true;
      }
      if (ACTIVITY_GET_SUCCESS.match(action)) {
        draftState.activity = { ...action.payload.activity };
        draftState.suggestedTreatmentIDs = [];
        draftState.loading = false;
      }
      if (ACTIVITY_UPDATE_GEO_SUCCESS.match(action)) {
        draftState.activity.geometry = action.payload.geometry;
        draftState.activity.form_data.activity_data.latitude = action.payload.lat;
        draftState.activity.form_data.activity_data.longitude = action.payload.long;
        draftState.activity.form_data.activity_data.utm_zone = action.payload.utm ? action.payload.utm[0] : null;
        draftState.activity.form_data.activity_data.utm_easting = action.payload.utm ? action.payload.utm[1] : null;
        draftState.activity.form_data.activity_data.utm_northing = action.payload.utm ? action.payload.utm[2] : null;
        draftState.activity.form_data.activity_data.reported_area = action.payload.reported_area;
        draftState.activity.form_data.activity_subtype_data.Well_Information = action.payload.Well_Information;
      }
      if (ACTIVITY_ON_FORM_CHANGE_SUCCESS.match(action)) {
        draftState.activity.form_data = action.payload.activity.form_data;
        draftState.activity.species_positive = action.payload.activity.species_positive;
        draftState.activity.species_negative = action.payload.activity.species_negative;
        draftState.activity.species_treated = action.payload.activity.species_treated;
        draftState.activity.jurisdiction = action.payload.activity.jurisdiction;
      }
      if (ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS.match(action)) {
        draftState.suggestedJurisdictions = [...action.payload.jurisdictions];
      }
      if (ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS.match(action)) {
        if (draftState.activity.activity_subtype === 'Observation' && !draftState.activity.initial_autofill_done) {
          draftState.suggestedPersons = [...action.payload.suggestedPersons];
        }
        if (draftState.activity.activity_subtype === 'Treatment' && !draftState.activity.initial_autofill_done) {
          draftState.suggestedPersons = [...action.payload.suggestedPersons];
        }
        draftState.suggestedPersons = [...action.payload.suggestedPersons];
      }
      if (ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS.match(action)) {
        draftState.suggestedTreatmentIDs = [...action.payload.suggestedTreatmentIDs];
      }
      if (ACTIVITY_CREATE_SUCCESS.match(action)) {
        draftState.activeActivity = action.payload.activity_id;
        draftState.current_activity_hash = null;
        draftState.saved_activity_hash = null;
      }
      if (ACTIVITY_SAVE_SUCCESS.match(action)) {
        draftState.activity = { ...action.payload.activity };
      }
      if (ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS.match(action)) {
        draftState.notification = action.payload.notification;
        //setTimeout(()=> { draftState.notification = null }, 5000)
      }
      if (ACTIVITY_COPY_SUCCESS.match(action)) {
        draftState.activity_copy_buffer = {
          form_data: action.payload.form_data
        };
      }
      if (ACTIVITY_PASTE_SUCCESS.match(action)) {
        draftState.pasteCount = draftState.pasteCount + 1;
        draftState.activity.form_data = JSON.parse(JSON.stringify(draftState.activity_copy_buffer.form_data));
      }
      if (ACTIVITY_ADD_PHOTO_SUCCESS.match(action)) {
        draftState.activity.media.push(action.payload.photo);
      }
      if (ACTIVITY_DELETE_PHOTO_SUCCESS.match(action)) {
        draftState.activity = action.payload.activity;
      }
      if (ACTIVITY_EDIT_PHOTO_SUCCESS.match(action)) {
        draftState.activity.media = action.payload.media;
      }
      if (ACTIVITY_SET_CURRENT_HASH_SUCCESS.match(action)) {
        draftState.current_activity_hash = action.payload.current;
      }
      if (ACTIVITY_SET_SAVED_HASH_SUCCESS.match(action)) {
        draftState.saved_activity_hash = action.payload.saved;
      }
      if (ACTIVITY_SET_UNSAVED_NOTIFICATION.match(action)) {
        draftState.unsaved_notification = action.payload.unsaved_notification;
      }
      if (MAP_TOGGLE_TRACK_ME_DRAW_GEO.match(action)) {
        draftState.track_me_draw_geo = !draftState.track_me_draw_geo;
      }
    }) as unknown as ActivityState;
  };
}

const selectActivity: (state) => ActivityState = (state) => state.ActivityPage;

export { createActivityReducer, selectActivity };
