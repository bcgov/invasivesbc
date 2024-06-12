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
  item: null | DeepBatch;
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
    if (BATCH_LIST_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        list: action.payload
      };
    }
    if (BATCH_LIST_ERROR.match(action)) {
      return {
        ...state,
        working: false,
        error: true,
        list: []
      };
    }
    if (BATCH_LIST_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        list: null
      };
    }
    if (BATCH_RETRIEVE_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        item: null
      };
    }
    if (BATCH_RETRIEVE_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        item: action.payload
      };
    }
    if (BATCH_RETRIEVE_ERROR.match(action)) {
      return {
        ...state,
        working: false,
        error: true,
        item: null
      };
    }
    if (BATCH_CREATE_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        item: action.payload,
        createdBatchId: action.payload.batchId
      };
    }
    if (BATCH_CREATE_ERROR.match(action)) {
      return {
        ...state,
        working: false,
        error: true,
        item: null,
        createdBatchId: null
      };
    }
    if (BATCH_CREATE_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        item: null,
        createdBatchId: null
      };
    }
    if (BATCH_EXECUTE_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        item: action.payload.result
      };
    }
    if (BATCH_EXECUTE_ERROR.match(action)) {
      return {
        ...state,
        working: false,
        error: true,
        errorMessage: `Could not execute batch ${JSON.stringify(action.payload.message, null, 2)}`,
        item: null
      };
    }
    if (BATCH_EXECUTE_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        item: null
      };
    }
    if (BATCH_UPDATE_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        item: null
      };
    }
    if (BATCH_UPDATE_ERROR.match(action)) {
      return {
        ...state,
        working: false,
        error: true,
        item: null
      };
    }
    if (BATCH_UPDATE_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        item: null
      };
    }
    if (BATCH_DELETE_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        item: null
      };
    }
    if (BATCH_DELETE_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        item: null
      };
    }
    if (BATCH_DELETE_ERROR.match(action)) {
      return {
        ...state,
        working: false,
        error: true,
        errorMessage: 'Could not delete batch',
        item: null
      };
    }
    if (BATCH_TEMPLATE_LIST_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        templates: []
      };
    }
    if (BATCH_TEMPLATE_LIST_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        templates: action.payload.filter((template) =>
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
            'monitoring_biocontrol_dispersal_terrestrial_plant_temp'

          ].includes(template.key)
        )
      };
    }
    if (BATCH_TEMPLATE_LIST_ERROR.match(action)) {
      return {
        ...state,
        working: false,
        error: true,
        templates: []
      };
    }
    if (BATCH_TEMPLATE_DOWNLOAD_REQUEST.match(action)) {
      return {
        ...state,
        templateDetail: {
          ...state.templateDetail,
          [action.payload.key]: {
            working: true,
            error: false,
            data: null
          }
        }
      };
    }
    if (BATCH_TEMPLATE_DOWNLOAD_SUCCESS.match(action)) {
      return {
        ...state,
        templateDetail: {
          ...state.templateDetail,
          [action.payload.key]: {
            working: false,
            error: false,
            data: action.payload.data
          }
        }
      };
    }
    if (BATCH_TEMPLATE_DOWNLOAD_ERROR.match(action)) {
      return {
        ...state,
        templateDetail: {
          ...state.templateDetail,
          [action.payload.key]: {
            working: false,
            error: true,
            data: null
          }
        }
      };
    }
    return state;
  };
}

const selectBatch: (state) => Batch = (state) => state.Batch;

export { selectBatch, createBatchReducer };
