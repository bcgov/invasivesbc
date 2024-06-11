import { CRASH_HANDLE_GLOBAL_ERROR } from 'state/actions';

interface ErrorHandlerState {
  detail: {
    error: Error | null;
    errorInfo: {
      sagaStack: string;
    } | null;
  } | null;
  hasCrashed: boolean;
}

const initialState: ErrorHandlerState = {
  hasCrashed: false,
  detail: null
};

function errorHandlerReducer(state = initialState, action) {
  if (CRASH_HANDLE_GLOBAL_ERROR.match(action)) {
    return {
      detail: action.payload.detail,
      hasCrashed: true
    };
  }

  return state;
}

const selectGlobalErrorState: (state) => ErrorHandlerState = (state) => state.ErrorHandler;

export { errorHandlerReducer, selectGlobalErrorState };
