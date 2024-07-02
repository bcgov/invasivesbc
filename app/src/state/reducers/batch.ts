import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import {
  BATCH_CREATE_ERROR,
  BATCH_CREATE_REQUEST,
  BATCH_CREATE_SUCCESS,
  BATCH_DELETE_ERROR,
  BATCH_DELETE_REQUEST,
  BATCH_DELETE_SUCCESS,
  BATCH_EXECUTE_ERROR,
  BATCH_EXECUTE_REQUEST,
  BATCH_EXECUTE_SUCCESS,
  BATCH_LIST_ERROR,
  BATCH_LIST_REQUEST,
  BATCH_LIST_SUCCESS,
  BATCH_RETRIEVE_ERROR,
  BATCH_RETRIEVE_REQUEST,
  BATCH_RETRIEVE_SUCCESS,
  BATCH_TEMPLATE_DOWNLOAD_ERROR,
  BATCH_TEMPLATE_DOWNLOAD_REQUEST,
  BATCH_TEMPLATE_DOWNLOAD_SUCCESS,
  BATCH_TEMPLATE_LIST_ERROR,
  BATCH_TEMPLATE_LIST_REQUEST,
  BATCH_TEMPLATE_LIST_SUCCESS,
  BATCH_UPDATE_ERROR,
  BATCH_UPDATE_REQUEST,
  BATCH_UPDATE_SUCCESS
} from '../actions';

interface DeepBatch {
  created_at: string;
  id: string | number;
}

interface ShallowBatch {
  created_at: string;
  template: string;
  status: string;
  id: string | number;
}

interface ShallowTemplate {
  name: string;
  key: string;
}

interface DeepTemplate {
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
      switch (action.type) {
        case BATCH_LIST_SUCCESS:
          draftState.working = false;
          draftState.error = false;
          draftState.list = action.payload;
          break;
        case BATCH_LIST_ERROR:
          draftState.working = false;
          draftState.error = true;
          draftState.list = [];
          break;
        case BATCH_LIST_REQUEST:
          draftState.working = true;
          draftState.error = false;
          draftState.list = [];
          break;
        case BATCH_RETRIEVE_REQUEST:
          draftState.working = true;
          draftState.error = false;
          draftState.item = null;
          break;
        case BATCH_RETRIEVE_SUCCESS:
          draftState.working = false;
          draftState.error = false;
          draftState.item = action.payload;
          break;
        case BATCH_RETRIEVE_ERROR:
          draftState.working = false;
          draftState.error = true;
          draftState.item = null;
          break;
        case BATCH_CREATE_SUCCESS:
          draftState.working = false;
          draftState.error = false;
          draftState.item = action.payload;
          draftState.createdBatchId = action.payload.batchId;
          break;
        case BATCH_CREATE_ERROR:
          draftState.working = false;
          draftState.error = true;
          draftState.item = null;
          draftState.createdBatchId = null;
          break;
        case BATCH_CREATE_REQUEST:
          draftState.working = true;
          draftState.error = false;
          draftState.item = null;
          draftState.createdBatchId = null;
          break;
        case BATCH_EXECUTE_SUCCESS:
          draftState.working = false;
          draftState.error = false;
          draftState.item = action.payload.result;
          break;
        case BATCH_EXECUTE_ERROR:
          draftState.working = false;
          draftState.error = true;
          draftState.errorMessage = `Could not execute batch ${JSON.stringify(action.payload?.message, null, 2)}`;
          draftState.item = null;
          break;
        case BATCH_EXECUTE_REQUEST:
          draftState.working = true;
          draftState.error = false;
          draftState.item = null;
          break;
        case BATCH_UPDATE_SUCCESS:
          draftState.working = false;
          draftState.error = false;
          draftState.item = null;
          break;
        case BATCH_UPDATE_ERROR:
          draftState.working = false;
          draftState.error = true;
          draftState.item = null;
          break;
        case BATCH_UPDATE_REQUEST:
          draftState.working = true;
          draftState.error = false;
          draftState.item = null;
          break;
        case BATCH_DELETE_REQUEST:
          draftState.working = true;
          draftState.error = false;
          draftState.item = null;
          break;
        case BATCH_DELETE_SUCCESS:
          draftState.working = false;
          draftState.error = false;
          draftState.item = null;
          break;
        case BATCH_DELETE_ERROR:
          draftState.working = false;
          draftState.error = true;
          draftState.errorMessage = 'Could not delete batch';
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
              'monitoring_mechanical_treatment_temp',
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
    });
  };
}

const selectBatch: (state) => Batch = (state) => state.Batch;

export { selectBatch, createBatchReducer };
