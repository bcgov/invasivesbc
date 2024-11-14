import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
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
      data: DeepTemplate | null;
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
      } else if (BatchActions.executeError.match(action)) {
        draftState.working = false;
        draftState.error = true;
        draftState.errorMessage = `Could not execute batch: ${action.payload}`;
        draftState.item = null;
      } else if (BatchActions.templateList.match(action)) {
        draftState.working = true;
        draftState.error = false;
        draftState.templates = [];
      } else if (BatchActions.templateListSuccess.match(action)) {
        draftState.working = false;
        draftState.error = false;
        draftState.templates = action.payload;
      } else if (BatchActions.downloadTemplate.match(action)) {
        draftState.templateDetail = {
          ...state.templateDetail,
          [action.payload]: {
            working: true,
            error: false,
            data: null
          }
        };
      } else if (BatchActions.downloadTemplateSuccess.match(action)) {
        draftState.templateDetail = {
          ...state.templateDetail,
          [action.payload.key]: {
            working: false,
            error: false,
            data: action.payload.data
          }
        };
      }
    });
  };
}

const selectBatch: (state) => Batch = (state) => state.Batch;

export { selectBatch, createBatchReducer };
