import {
  BATCH_CREATE_ERROR,
  BATCH_CREATE_REQUEST,
  BATCH_CREATE_SUCCESS,
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
  BATCH_UPDATE_SUCCESS,
  BATCH_DELETE_REQUEST,
  BATCH_DELETE_SUCCESS,
  BATCH_DELETE_ERROR
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
  item: DeepBatch;
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
    switch (action.type) {
      case BATCH_LIST_SUCCESS:
        return {
          ...state,
          working: false,
          error: false,
          list: action.payload
        };
      case BATCH_LIST_ERROR:
        return {
          ...state,
          working: false,
          error: true,
          list: []
        };
      case BATCH_LIST_REQUEST:
        return {
          ...state,
          working: true,
          error: false,
          list: null
        };
      case BATCH_RETRIEVE_REQUEST:
        return {
          ...state,
          working: true,
          error: false,
          item: null
        };
      case BATCH_RETRIEVE_SUCCESS:
        return {
          ...state,
          working: false,
          error: false,
          item: action.payload
        };
      case BATCH_RETRIEVE_ERROR:
        return {
          ...state,
          working: false,
          error: true,
          item: null
        };
      case BATCH_CREATE_SUCCESS:
        return {
          ...state,
          working: false,
          error: false,
          item: action.payload,
          createdBatchId: action.payload.batchId
        };
      case BATCH_CREATE_ERROR:
        return {
          ...state,
          working: false,
          error: true,
          item: null,
          createdBatchId: null
        };
      case BATCH_CREATE_REQUEST:
        return {
          ...state,
          working: true,
          error: false,
          item: null,
          createdBatchId: null
        };
      case BATCH_EXECUTE_SUCCESS:
        return {
          ...state,
          working: false,
          error: false,
          item: action.payload.result
        };
      case BATCH_EXECUTE_ERROR:
        return {
          ...state,
          working: false,
          error: true,
          item: null
        };
      case BATCH_EXECUTE_REQUEST:
        return {
          ...state,
          working: true,
          error: false,
          item: null
        };
      case BATCH_UPDATE_SUCCESS:
        return {
          ...state,
          working: false,
          error: false,
          item: null
        };
      case BATCH_UPDATE_ERROR:
        return {
          ...state,
          working: false,
          error: true,
          item: null
        };
      case BATCH_UPDATE_REQUEST:
        return {
          ...state,
          working: true,
          error: false,
          item: null
        };
      case BATCH_DELETE_REQUEST:
        return {
          ...state,
          working: true,
          error: false,
          item: null
        };
      case BATCH_DELETE_SUCCESS:
        return {
          ...state,
          working: false,
          error: false,
          item: null
        };
      case BATCH_DELETE_ERROR:
        return {
          ...state,
          working: false,
          error: true,
          errorMessage: 'Could not delete batch',
          item: null
        };
      case BATCH_TEMPLATE_LIST_REQUEST:
        return {
          ...state,
          working: true,
          error: false,
          templates: []
        };
      case BATCH_TEMPLATE_LIST_SUCCESS:
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
              'treatment_chemical_aquatic_plant_temp'
            ].includes(template.key)
          )
        };
      case BATCH_TEMPLATE_LIST_ERROR:
        return {
          ...state,
          working: false,
          error: true,
          templates: []
        };
      case BATCH_TEMPLATE_DOWNLOAD_REQUEST:
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
      case BATCH_TEMPLATE_DOWNLOAD_SUCCESS:
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
      case BATCH_TEMPLATE_DOWNLOAD_ERROR:
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

      default:
        return state;
    }
  };
}

const selectBatch: (state) => Batch = (state) => state.Batch;

export { selectBatch, createBatchReducer };
