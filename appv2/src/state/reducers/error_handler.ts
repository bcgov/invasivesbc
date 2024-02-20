import { AppConfig } from '../config';
import { CRASH_HANDLE_GLOBAL_ERROR } from '../actions';

interface ErrorHandlerState {
  detail: {
    error: Error | null;
    errorInfo: {
      sagaStack: string;
    } | null;
  } | null;
  actions: Array<{ name: string; execute: () => void }>;
  hasCrashed: boolean;
}

const initialState: ErrorHandlerState = {
  hasCrashed: false,
  actions: [],
  detail: null
};

function errorHandlerReducer(state = initialState, action) {
  switch (action.type) {
    case CRASH_HANDLE_GLOBAL_ERROR: {
      return {
        detail: action.payload.detail,
        actions: action.payload.actions,
        hasCrashed: true
      };
    }
  }
  return state;
}

const selectGlobalErrorState: (state) => ErrorHandlerState = (state) => state.ErrorHandler;

export { errorHandlerReducer, selectGlobalErrorState };
