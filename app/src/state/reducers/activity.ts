import { Draft } from 'immer';
import { createNextState, isRejectedWithValue } from '@reduxjs/toolkit';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Feature } from 'geojson';
import { ActivitySubtypes } from 'sharedAPI';
import { RootState } from './rootReducer';
import FormActions from 'state/actions/activity/FormActions';
import FormCode from 'interfaces/FormCode';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import GeoShapes from 'constants/geoShapes';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import GeoTracking from 'state/actions/geotracking/GeoTracking';
import Activity from 'state/actions/activity/Activity';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';
import IActivityPermissions from 'interfaces/IActivityPermissions';
import { GeoTrackingStatus } from 'constants/geoTrackingStatus';
import DrawToolActions from 'state/actions/drawtool/drawToolActions';
import { FormSchema, TerrestrialChemicalTreatmentSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { RecordAction, RecordMetadata } from 'api/api-schema';

interface ActivityState {
  [MIGRATION_VERSION_KEY]: number;
  activity: any;
  activeActivity: string | null;
  activeActivityPermissions?: IActivityPermissions; // TODO: Remove all relations to this legacy state.
  recordActions?: Array<RecordAction>;
  activityErrors: any[]; // TODO: Remove all relations to this legacy state
  formCodes: Record<PropertyKey, Array<FormCode>>;
  error: boolean;
  formMetadata?: RecordMetadata;
  pasteCount: number;
  failCode: number | null;
  formType?: ActivitySubtypes;
  formState?: FormSchema;
  recordNotFound?: boolean;
  wellsInRecordArea?: TerrestrialChemicalTreatmentSchema['subtype_data']['well_entries'];
  formId?: string;
  geometry_details?: {
    shape: Feature;
    area_m?: number;
    latitude?: number;
    longitude?: number;
    utm_zone?: number;
    utm_easting?: number;
    utm_northing?: number;
  };
  pristine: boolean; // TODO: Remove all relations (Legacy form)
  initialized: boolean; // TODO: Remove
  loading: boolean; // TODO: Remove
  suggestions: {
    jurisdictions: Array<{ label: string; full: string }>;
    recordsInArea: Array<{ label: string; full: string }>;
  };
  suggestedJurisdictions: Record<string, any>[];
  biocontrol: {
    plantToAgentMap: Record<string, any>[];
  };
  suggestedPersons: Record<string, any>[];
  suggestedTreatmentIDs: SuggestedTreatmentId[];
  track_me_draw_geo: {
    status: GeoTrackingStatus;
    shapeType: GeoShapes | null;
    isEditingShape: boolean;
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
  pristine: true,
  error: false,
  formCodes: {},
  pasteCount: 0,
  failCode: null,
  initialized: false,
  loading: false,
  track_me_draw_geo: {
    status: GeoTrackingStatus.IDLE,
    shapeType: null,
    isEditingShape: false
  },
  biocontrol: {
    plantToAgentMap: []
  },
  suggestedJurisdictions: [], // TODO: REMOVE
  suggestions: {
    jurisdictions: [],
    recordsInArea: []
  },
  suggestedPersons: [],
  suggestedTreatmentIDs: [],
  activity_copy_buffer: null,
  schema: undefined,
  uiSchema: undefined
};

/**
 * @desc Reusable pass-by-reference delete for states related to Activities
 * @param draftState Current state of reducer
 */
const deleteFormState = (draftState: ActivityState) => {
  delete draftState.formState;
  delete draftState.geometry_details;
  delete draftState.wellsInRecordArea;
  delete draftState.recordNotFound;
  delete draftState.recordActions;
  delete draftState.formId;
  delete draftState.formType;
  delete draftState.formMetadata;
  return draftState;
};

function createActivityReducer() {
  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<ActivityState>) => {
      if (GeoTracking.start.match(action)) {
        draftState.track_me_draw_geo = {
          ...draftState.track_me_draw_geo,
          status: GeoTrackingStatus.TRACKING_AND_DRAWING,
          shapeType: action.payload.type
        };
      } else if (GeoTracking.pause.match(action)) {
        draftState.track_me_draw_geo.status = GeoTrackingStatus.ONLY_TRACKING;
      } else if (GeoTracking.edit.match(action)) {
        draftState.track_me_draw_geo = {
          ...draftState.track_me_draw_geo,
          isEditingShape: action.payload
        };
      } else if (GeoTracking.resume.match(action)) {
        draftState.track_me_draw_geo = {
          ...draftState.track_me_draw_geo,
          status: GeoTrackingStatus.TRACKING_AND_DRAWING,
          isEditingShape: false
        };
      } else if (GeoTracking.exitDrawing.match(action)) {
        draftState.track_me_draw_geo = {
          status: GeoTrackingStatus.EXITED,
          shapeType: draftState.track_me_draw_geo.shapeType,
          isEditingShape: false
        };
      } else if (GeoTracking.exit.match(action)) {
        draftState.track_me_draw_geo = {
          status: GeoTrackingStatus.EXITED,
          shapeType: null,
          isEditingShape: false
        };
      } else if (GeoTracking.end.match(action)) {
        draftState.track_me_draw_geo = {
          ...draftState.track_me_draw_geo,
          status: GeoTrackingStatus.COMPLETED,
          shapeType: null,
          isEditingShape: false
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
      } else if (Activity.Suggestions.getJurisdictions.fulfilled.match(action)) {
        draftState.suggestedJurisdictions = [...action.payload];
      } else if (Activity.Suggestions.getBiocontrolTreatments.fulfilled.match(action)) {
        draftState.biocontrol.plantToAgentMap = [...action.payload];
      } else if (Activity.Suggestions.getLinkedRecordIDs.fulfilled.match(action)) {
        draftState.suggestions.recordsInArea = action.payload;
      } else if (Activity.createReq.match(action)) {
        const activity_copy_buffer = JSON.parse(JSON.stringify(draftState.activity_copy_buffer));
        Object.assign(draftState, {
          activity: null,
          error: false,
          pasteCount: 0,
          failCode: null,
          initialized: false,
          loading: false,
          biocontrol: {
            plantToAgentMap: draftState.biocontrol.plantToAgentMap ?? []
          },
          suggestedJurisdictions: [],
          suggestedPersons: [],
          suggestedTreatmentIDs: [],
          activity_copy_buffer
        });
      } else if (Activity.saveSuccess.match(action)) {
        draftState.pristine = true;
        draftState.activity = { ...action.payload };
      } else if (Activity.deleteSuccess.match(action)) {
        Object.assign(draftState, {
          activity: null,
          error: false,
          pasteCount: 0,
          failCode: null,
          initialized: false,
          loading: false,
          biocontrol: {
            plantToAgentMap: draftState.biocontrol.plantToAgentMap ?? []
          },
          suggestedJurisdictions: [],
          suggestedPersons: [],
          suggestedTreatmentIDs: []
        });
      } else if (FormActions.delete.fulfilled.match(action)) {
        deleteFormState(draftState);
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
      } else if (Activity.refreshFormCodes.fulfilled.match(action)) {
        draftState.formCodes = action.payload;
      } else if (FormActions.createNewForm.fulfilled.match(action)) {
        // Clear stale formstate if exists.
        deleteFormState(draftState);

        draftState.formId = action.payload.newFormId;
        draftState.formType = action.payload.subtype;
        draftState.recordActions = action.payload.available_actions;
      } else if (FormActions.clearFormState.match(action) && draftState.formState) {
        delete draftState.geometry_details;
        delete draftState.wellsInRecordArea;
        if (draftState.formType) {
          Object.assign(draftState.formState, {
            ...getDefaultFormState(draftState.formType, draftState.formState.created_by),
            id: draftState.formId,
            short_id: draftState.formState?.short_id,
            subtype: draftState.formType
          });
        }
      } else if (FormActions.duplicateForm.fulfilled.match(action)) {
        const { data, available_actions, metadata } = action.payload;
        draftState.formType = data.subtype;
        draftState.formId = data.id;
        draftState.formState = data;
        draftState.recordActions = available_actions;
        draftState.formMetadata = metadata;
      } else if (FormActions.updateState.match(action)) {
        draftState.formState = structuredClone(action.payload);
      } else if (FormActions.sendForm.fulfilled.match(action)) {
        if (!draftState.formState) return;
        draftState.formId = action.payload.id;
        draftState.activeActivity = action.payload.id;
      } else if (Activity.get.match(action)) {
        draftState.failCode = null;
        draftState.loading = true;
      } else if (Activity.getActivity.pending.match(action)) {
        // Clear Form State at beginning of fetch
        deleteFormState(draftState);
      } else if (Activity.getActivity.fulfilled.match(action)) {
        const { data, available_actions, metadata } = action.payload;
        draftState.formType = data.subtype as ActivitySubtypes;
        draftState.formId = data.id;
        draftState.formState = data as unknown as FormSchema;
        draftState.recordActions = available_actions;
        draftState.formMetadata = metadata as RecordMetadata;
      } else if (Activity.getActivity.rejected.match(action) && isRejectedWithValue(action) && action.payload === 404) {
        draftState.recordNotFound = true;
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
        delete draftState.geometry_details;
        delete draftState.wellsInRecordArea;

        draftState.activity.geometry = action.payload.geometry;
        // Reset all fields in form.
        draftState.activity.form_data.activity_data.latitude = undefined;
        draftState.activity.form_data.activity_data.longitude = undefined;
        draftState.activity.form_data.activity_data.utm_zone = undefined;
        draftState.activity.form_data.activity_data.utm_easting = undefined;
        draftState.activity.form_data.activity_data.utm_northing = undefined;
        draftState.activity.form_data.activity_data.reported_area = undefined;
      } else if (Activity.buildFormSchemaSuccess.match(action)) {
        draftState.pristine = true;
        draftState.uiSchema = action.payload.uiSchema;
        draftState.schema = action.payload.schema;
      } else if (DrawToolActions.deleteGeo.match(action)) {
        delete draftState.geometry_details;
        delete draftState.wellsInRecordArea;
      } else if (DrawToolActions.updateGeoSuccess.match(action)) {
        const { geometry, lat, long, utm, reported_area, Well_Information } = action.payload;
        //TODO: Refactor Well information and Geometry_Details to be more cleanly implemented as old source removed
        const formattedWells = Well_Information?.slice(0, 5).map((well) => ({
          well_tag: well.well_id,
          distance: parseInt(well.well_proximity)
        }));
        draftState.wellsInRecordArea = structuredClone(formattedWells);
        draftState.geometry_details = {
          shape: geometry?.[0] as Feature,
          area_m: reported_area ?? undefined,
          latitude: lat ?? undefined,
          longitude: long ?? undefined,
          utm_zone: utm?.[0],
          utm_easting: utm?.[1],
          utm_northing: utm?.[2]
        };
        if (draftState.activity?.activity_data) {
          // Prevent Crash when using RHF and Activity state empty
          // TODO: Remove this
          draftState.activity.geometry = geometry;
          draftState.activity.form_data.activity_data.latitude = lat;
          draftState.activity.form_data.activity_data.longitude = long;
          draftState.activity.form_data.activity_data.utm_zone = utm?.[0].toString(); // RJSF expects this value to be a string
          draftState.activity.form_data.activity_data.utm_easting = utm?.[1];
          draftState.activity.form_data.activity_data.utm_northing = utm?.[2];
          draftState.activity.form_data.activity_data.reported_area = reported_area;
          draftState.activity.form_data.activity_subtype_data.Well_Information = Well_Information;
        }
      } else if (Activity.OnFormChangeRequestSuccess.match(action)) {
        draftState.pristine = false;
        draftState.activity.form_data = JSON.parse(JSON.stringify(action.payload.form_data));
        draftState.activity.species_positive = action.payload?.species_positive;
        draftState.activity.species_negative = action.payload?.species_negative;
        draftState.activity.species_treated = action.payload?.species_treated;
        draftState.activity.map_symbol = action.payload?.map_symbol;
        draftState.activity.jurisdiction = action.payload?.jurisdiction;
      }
    });
  };
}

const selectActivity: (state) => ActivityState = (state) => state.ActivityPage;

const isActivityObservation: (state: RootState) => boolean | undefined = (state) =>
  state.ActivityPage.formType &&
  [ActivitySubtypes.Observation_Plant_Aquatic, ActivitySubtypes.Observation_Plant_Terrestrial].includes(
    state.ActivityPage.formType
  );

const isActivityChemicalTreatment: (state: RootState) => boolean | undefined = (state) =>
  state.ActivityPage.formType &&
  [ActivitySubtypes.Treatment_Chemical_Plant_Aquatic, ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial].includes(
    state.ActivityPage.formType
  );

export { createActivityReducer, selectActivity, isActivityChemicalTreatment, isActivityObservation };
export type { ActivityState };
