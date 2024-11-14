import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import {
  BATCH_EXECUTE_ERROR,
  BATCH_TEMPLATE_DOWNLOAD_ERROR,
  BATCH_TEMPLATE_DOWNLOAD_REQUEST,
  BATCH_TEMPLATE_DOWNLOAD_SUCCESS,
  BATCH_TEMPLATE_LIST_ERROR,
  BATCH_TEMPLATE_LIST_REQUEST,
  BATCH_TEMPLATE_LIST_SUCCESS
} from '../actions';
import BatchActions from 'state/actions/batch/BatchActions';

export interface DeepBatch {
  created_at: string;
  id: string | number;
}

export interface ShallowBatch {
  created_at: string;
  template: string;
  status: string;
  id: string | number;
}

export interface ShallowTemplate {
  name: string;
  key: string;
}

export interface DeepTemplate {
  name: string;
  key: string;
}

interface Batch {
  working: boolean;
  workingOnTemplateDetail: boolean;
  error: boolean;
  errorMessage: string | null;
  list: ShallowBatch[];
  item: DeepBatch | null;
  createdBatchId: string | null;
  templates: ShallowTemplate[];
  templateDetail: {
    [name: string]: {
      data: DeepTemplate;
      error: boolean;
      working: boolean;
    };
  };
}

function createBatchReducer() {
  const initialState: Batch = {
    working: false,
    workingOnTemplateDetail: false,
    createdBatchId: null,
    error: false,
    errorMessage: null,
    list: [],
    item: null,
    templates: [],
    templateDetail: {}
  };

  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<Batch>) => {
      if (BatchActions.list.match(action)) {
        draftState.working = true;
        draftState.error = false;
        draftState.list = [];
      } else if (BatchActions.listSuccess.match(action)) {
        draftState.working = false;
        draftState.error = false;
        draftState.list = action.payload;
      } else if (BatchActions.retrieve.match(action)) {
        draftState.working = true;
        draftState.error = false;
        draftState.item = null;
      } else if (BatchActions.retrieveSuccess.match(action)) {
        draftState.working = false;
        draftState.error = false;
        draftState.item = action.payload;
      } else if (BatchActions.createSuccess.match(action)) {
        draftState.working = false;
        draftState.error = false;
        draftState.item = action.payload;
        draftState.createdBatchId = action.payload.batchId;
      } else if (BatchActions.update.match(action)) {
        draftState.working = true;
        draftState.error = false;
        draftState.item = null;
      } else if (BatchActions.updateSuccess.match(action)) {
        draftState.working = false;
        draftState.error = false;
        draftState.item = null;
      } else if (BatchActions.delete.match(action)) {
        draftState.working = true;
        draftState.error = false;
        draftState.item = null;
      } else if (BatchActions.deleteSuccess.match(action)) {
        draftState.working = false;
        draftState.error = false;
        draftState.item = null;
      } else if (BatchActions.deleteError.match(action)) {
        draftState.working = false;
        draftState.error = true;
        draftState.errorMessage = 'Could not delete batch';
        draftState.item = null;
      } else if (BatchActions.execute.match(action)) {
        draftState.working = true;
        draftState.error = false;
        draftState.item = null;
      } else if (BatchActions.executeSuccess.match(action)) {
        draftState.working = false;
        draftState.error = false;
        draftState.item = action.payload;
      } else {
        switch (action.type) {
          case BATCH_EXECUTE_ERROR:
            draftState.working = false;
            draftState.error = true;
            draftState.errorMessage = `Could not execute batch ${JSON.stringify(action.payload?.message, null, 2)}`;
            draftState.item = null;
            break;

          case BATCH_TEMPLATE_LIST_REQUEST:
            draftState.working = true;
            draftState.error = false;
            draftState.templates = [];
            break;
          case BATCH_TEMPLATE_LIST_SUCCESS:
            draftState.working = false;
            draftState.error = false;
            draftState.templates = action.payload.filter((template) =>
              [
                'observation_aquatic_plant',
                'observation_aquatic_plant_temp',
                'observation_terrestrial_plant',
                'observation_terrestrial_plant_temp',
                'treatment_mechanical_terrestrial_plant',
                'treatment_mechanical_terrestrial_plant_temp',
                'treatment_mechanical_aquatic_plant',
                'treatment_mechanical_aquatic_plant_temp',
                'treatment_chemical_terrestrial_plant',
                'treatment_chemical_terrestrial_plant_temp',
                'treatment_chemical_aquatic_plant',
                'treatment_chemical_aquatic_plant_temp',
                'biocontrol_release',
                'biocontrol_release_temp',
                'biocontrol_collection',
                'biocontrol_collection_temp',
                'monitoring_biocontrol_dispersal_terrestrial_plant',
                'monitoring_biocontrol_dispersal_terrestrial_plant_temp',
                'monitoring_biocontrol_release_terrestrial_plant',
                'monitoring_chemical_treatment',
                'monitoring_chemical_treatment_temp',
                'monitoring_mechanical_treatment',
                'monitoring_mechanical_treatment_temp'
              ].includes(template.key)
            );
            break;
          case BATCH_TEMPLATE_LIST_ERROR:
            draftState.working = false;
            draftState.error = true;
            draftState.templates = [];
            break;
          case BATCH_TEMPLATE_DOWNLOAD_REQUEST:
            draftState.templateDetail = {
              ...state.templateDetail,
              [action.payload.key]: {
                working: true,
                error: false,
                data: null
              }
            };
            break;
          case BATCH_TEMPLATE_DOWNLOAD_SUCCESS:
            draftState.templateDetail = {
              ...state.templateDetail,
              [action.payload.key]: {
                working: false,
                error: false,
                data: action.payload.data
              }
            };
            break;
          case BATCH_TEMPLATE_DOWNLOAD_ERROR:
            draftState.templateDetail = {
              ...state.templateDetail,
              [action.payload.key]: {
                working: false,
                error: true,
                data: null
              }
            };
            break;
          default:
            break;
        }
      }
    });
  };
}

const selectBatch: (state) => Batch = (state) => state.Batch;

export { selectBatch, createBatchReducer };
