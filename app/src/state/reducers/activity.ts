import { Draft } from 'immer';
import { createNextState } from '@reduxjs/toolkit';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import {
  ACTIVITY_BUILD_SCHEMA_FOR_FORM_SUCCESS,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_SET_CURRENT_HASH_SUCCESS,
  ACTIVITY_UPDATE_GEO_SUCCESS
} from 'state/actions';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import GeoShapes from 'constants/geoShapes';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import Activity from 'state/actions/activity/Activity';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';
import IActivityPermissions from 'interfaces/IActivityPermissions';
import { GeoTrackingStatus } from 'constants/geoTrackingStatus';

interface ActivityState {
  [MIGRATION_VERSION_KEY]: number;
  activity: any;
  activeActivity: string | null;
  activeActivityPermissions?: IActivityPermissions;
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
    status: GeoTrackingStatus;
    shapeType: GeoShapes | null;
    // type: GeoShapes | null;
    // drawingShape: boolean;
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
    status: GeoTrackingStatus.IDLE,
    shapeType: null
    // type: null,
    // drawingShape: false
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

function createActivityReducer() {
  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<ActivityState>) => {
      if (GeoTracking.start.match(action)) {
        draftState.track_me_draw_geo = {
          status: GeoTrackingStatus.TRACKING_AND_DRAWING,
          shapeType: action.payload.type
          // isTracking: true,
          // type: action.payload.type,
          // drawingShape: true
        };
      } else if (GeoTracking.earlyExit.match(action)) {
        draftState.track_me_draw_geo = {
          status: GeoTrackingStatus.EXITED,
          shapeType: null
          // isTracking: false,
          // type: null,
          // drawingShape: false
        };
      } else if (GeoTracking.pause.match(action)) {
        draftState.track_me_draw_geo.status = GeoTrackingStatus.ONLY_TRACKING;
        // draftState.track_me_draw_geo.drawingShape = false;
      } else if (GeoTracking.resume.match(action)) {
        draftState.track_me_draw_geo.status = GeoTrackingStatus.TRACKING_AND_DRAWING;
        // draftState.track_me_draw_geo.drawingShape = true
      } else if (GeoTracking.exitDrawing.match(action)) {
        draftState.track_me_draw_geo = {
          status: GeoTrackingStatus.EXITED,
          shapeType: draftState.track_me_draw_geo.shapeType
          // isTracking: false,
          // type: draftState.track_me_draw_geo.type,
          // drawingShape: false
        };
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
      } else if (Activity.createReq.match(action)) {
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
      } else if (Activity.saveSuccess.match(action)) {
        draftState.activity = { ...action.payload };
      } else if (Activity.setSavedHashSuccess.match(action)) {
        draftState.saved_activity_hash = action.payload;
      } else if (Activity.createSuccess.match(action)) {
        draftState.activeActivity = action.payload;
        draftState.current_activity_hash = null;
        draftState.saved_activity_hash = null;
      } else if (Activity.deleteSuccess.match(action)) {
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
      } else if (Activity.paste.match(action)) {
        const shallow = draftState?.activity_copy_buffer?.form_data;
        if (!shallow) return;

        // Copy keys 1 deep into the form_data object.
        Object.keys(shallow).forEach((key) => {
          if (typeof shallow[key] === 'object') {
            Object.assign(draftState.activity.form_data[key], shallow[key]);
          } else {
            draftState.activity.form_data[key] = shallow[key];
          }
        });
        draftState.activity.form_data = JSON.parse(JSON.stringify(draftState.activity.form_data)); // Sever memory reference
        draftState.pasteCount++;
      } else if (Activity.copySuccess.match(action)) {
        const copiedData = action.payload;
        // Prevent Form status and Activity date from being copied over.
        delete copiedData?.form_status;
        delete copiedData?.activity_data?.activity_date_time;
        draftState.activity_copy_buffer = {
          form_data: copiedData
        };
      } else if (Activity.get.match(action)) {
        draftState.failCode = null;
        draftState.loading = true;
      } else if (Activity.getSuccess.match(action)) {
        const { activity, permissions } = action.payload;
        draftState.activity = { ...activity };
        draftState.activeActivityPermissions = { ...permissions };
        draftState.suggestedTreatmentIDs = [];
        draftState.loading = false;
      } else if (Activity.getFailure.match(action)) {
        draftState.activeActivityPermissions = undefined;
        draftState.activity = null;
        draftState.suggestedTreatmentIDs = [];
        draftState.loading = false;
        draftState.failCode = action.payload?.status ?? 404;
      } else if (Activity.setErrors.match(action)) {
        draftState.activityErrors = getCustomErrorTransformer()(action.payload ?? []);
      } else if (Activity.updateGeoFailure.match(action)) {
        draftState.activity.geometry = action.payload.geometry;

        draftState.activity.form_data.activity_data.latitude = undefined;
        draftState.activity.form_data.activity_data.longitude = undefined;
        draftState.activity.form_data.activity_data.utm_zone = undefined;
        draftState.activity.form_data.activity_data.utm_easting = undefined;
        draftState.activity.form_data.activity_data.utm_northing = undefined;
        draftState.activity.form_data.activity_data.reported_area = undefined;
      } else {
        switch (action.type) {
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
            draftState.activity.form_data = JSON.parse(JSON.stringify(action.payload.activity.form_data));
            draftState.activity.species_positive = action.payload.activity.species_positive;
            draftState.activity.species_negative = action.payload.activity.species_negative;
            draftState.activity.species_treated = action.payload.activity.species_treated;
            draftState.activity.map_symbol = action.payload.activity.map_symbol;
            draftState.activity.jurisdiction = action.payload.activity.jurisdiction;
            break;
          }
          case ACTIVITY_SET_CURRENT_HASH_SUCCESS: {
            draftState.current_activity_hash = action.payload.current;
            break;
          }
          default:
            break;
        }
      }
    });
  };
}

const selectActivity: (state) => ActivityState = (state) => state.ActivityPage;

export { createActivityReducer, selectActivity };
export type { ActivityState };
