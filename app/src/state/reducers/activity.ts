import { Draft } from 'immer';
import { createNextState } from '@reduxjs/toolkit';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import {
  ACTIVITY_BUILD_SCHEMA_FOR_FORM_SUCCESS,
  ACTIVITY_COPY_SUCCESS,
  ACTIVITY_CREATE_REQUEST,
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_ERRORS,
  ACTIVITY_GET_FAILURE,
  ACTIVITY_GET_REQUEST,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_PASTE_SUCCESS,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_SET_CURRENT_HASH_SUCCESS,
  ACTIVITY_SET_SAVED_HASH_SUCCESS,
  ACTIVITY_UPDATE_GEO_SUCCESS
} from '../actions';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import GeoShapes from 'constants/geoShapes';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import Activity from 'state/actions/activity/Activity';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';

export interface ActivityState {
  [MIGRATION_VERSION_KEY]: number;
  activity: any;
  activeActivity: string | null;
  activityErrors: any[];
  current_activity_hash: string | null;
  error: boolean;
  pasteCount: number;
  failCode: number | null;
  initialized: boolean;
  loading: boolean;
  saved_activity_hash: string | null;
  suggestedJurisdictions: Record<string, any>[];
  biocontrol: {
    plantToAgentMap: Record<string, any>[];
  };
  suggestedPersons: Record<string, any>[];
  suggestedTreatmentIDs: SuggestedTreatmentId[];
  track_me_draw_geo: {
    isTracking: boolean;
    type: GeoShapes | null;
    drawingShape: boolean;
  };
  activity_copy_buffer: Record<string, any> | null;
  uiSchema: UiSchema | undefined;
  schema: RJSFSchema | undefined;
}

const initialState: ActivityState = {
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,
  activity: null,
  activeActivity: null,
  activityErrors: [],
  current_activity_hash: null,
  error: false,
  pasteCount: 0,
  failCode: null,
  initialized: false,
  loading: false,
  track_me_draw_geo: {
    isTracking: false,
    type: null,
    drawingShape: false
  },
  saved_activity_hash: null,
  biocontrol: {
    plantToAgentMap: []
  },
  suggestedJurisdictions: [],
  suggestedPersons: [],
  suggestedTreatmentIDs: [],
  activity_copy_buffer: null,
  schema: undefined,
  uiSchema: undefined
};

function createActivityReducer(): (ActivityState: ActivityState, AnyAction) => ActivityState {
  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<ActivityState>) => {
      if (GeoTracking.start.match(action)) {
        draftState.track_me_draw_geo = {
          isTracking: true,
          type: action.payload.type,
          drawingShape: true
        };
      } else if (GeoTracking.earlyExit.match(action)) {
        draftState.track_me_draw_geo = {
          isTracking: false,
          type: null,
          drawingShape: false
        };
      } else if (GeoTracking.pause.match(action)) {
        draftState.track_me_draw_geo.drawingShape = false;
      } else if (GeoTracking.resume.match(action)) {
        draftState.track_me_draw_geo.drawingShape = true;
      } else if (Activity.Photo.addSuccess.match(action)) {
        if (draftState.activity.media == undefined) {
          draftState.activity.media = [];
        }
        draftState.activity.media.push(action.payload);
      } else if (Activity.Photo.editSuccess.match(action)) {
        draftState.activity.media = action.payload;
      } else if (Activity.Photo.deleteSuccess.match(action)) {
        draftState.activity = action.payload;
      } else if (Activity.Suggestions.jurisdictionsSuccess.match(action)) {
        draftState.suggestedJurisdictions = [...action.payload];
      } else if (Activity.Suggestions.biocontrolOnlineSuccess.match(action)) {
        draftState.biocontrol.plantToAgentMap = [...action.payload];
      } else if (Activity.Suggestions.personsSuccess.match(action)) {
        draftState.suggestedPersons = [...action.payload];
      } else if (Activity.Suggestions.treatmentIdsSuccess.match(action)) {
        draftState.suggestedTreatmentIDs = [...action.payload];
        if (draftState?.schema?.properties?.activity_type_data?.properties?.linked_id)
          draftState.schema.properties.activity_type_data.properties.linked_id.options = action.payload;
      } else {
        switch (action.type) {
          case ACTIVITY_ERRORS: {
            if (action.payload.errors !== undefined)
              draftState.activityErrors = getCustomErrorTransformer()(action.payload.errors);
            break;
          }
          case ACTIVITY_DELETE_SUCCESS: {
            Object.assign(draftState, {
              activity: null,
              current_activity_hash: null,
              error: false,
              pasteCount: 0,
              failCode: null,
              initialized: false,
              loading: false,
              saved_activity_hash: null,
              biocontrol: {
                plantToAgentMap: draftState.biocontrol.plantToAgentMap ?? []
              },
              suggestedJurisdictions: [],
              suggestedPersons: [],
              suggestedTreatmentIDs: []
            });
            break;
          }
          case ACTIVITY_CREATE_REQUEST: {
            const activity_copy_buffer = JSON.parse(JSON.stringify(draftState.activity_copy_buffer));
            Object.assign(draftState, {
              activity: null,
              current_activity_hash: null,
              error: false,
              pasteCount: 0,
              failCode: null,
              initialized: false,
              loading: false,
              saved_activity_hash: null,
              biocontrol: {
                plantToAgentMap: draftState.biocontrol.plantToAgentMap ?? []
              },
              suggestedJurisdictions: [],
              suggestedPersons: [],
              suggestedTreatmentIDs: [],
              activity_copy_buffer
            });
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
            draftState.activity.form_data.activity_data.utm_northing = action.payload.utm
              ? action.payload.utm[2]
              : null;
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
            draftState.activity.form_data = JSON.parse(JSON.stringify(draftState.activity_copy_buffer?.form_data));
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
            break;
        }
      }
    }) as ActivityState;
  };
}

const selectActivity: (state) => ActivityState = (state) => state.ActivityPage;

export { createActivityReducer, selectActivity };
