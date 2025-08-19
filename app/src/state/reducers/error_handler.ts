import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import AppActions from 'state/actions/appActions/appActions';

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
  return createNextState(state, (draftState: Draft<ErrorHandlerState>) => {
    if (AppActions.crashHandleGlobalError.match(action)) {
      draftState.detail = action.payload.detail;
      draftState.hasCrashed = true;
    }
  });
}

const selectGlobalErrorState: (state) => ErrorHandlerState = (state) => state.ErrorHandler;

export { errorHandlerReducer, selectGlobalErrorState };
