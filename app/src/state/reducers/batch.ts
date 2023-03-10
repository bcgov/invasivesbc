import {
  BATCH_LIST_ERROR,
  BATCH_LIST_REQUEST,
  BATCH_LIST_SUCCESS, BATCH_RETRIEVE_ERROR,
  BATCH_RETRIEVE_REQUEST,
  BATCH_RETRIEVE_SUCCESS
} from "../actions";

interface Batch {
  working: boolean,
  error: boolean,
  list: unknown[],
  item: unknown
}

function createBatchReducer() {

  const initialState: Batch = {
    working: false,
    error: false,
    list: [],
    item: null
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
      default:
        return state;
    }
  };
}

const selectBatch: (state) => Batch = (state) => state.Batch;

export {selectBatch, createBatchReducer};
