import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { CRASH_HANDLE_GLOBAL_ERROR } from '../actions';

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
    switch (action.type) {
      case CRASH_HANDLE_GLOBAL_ERROR: {
        draftState.detail = action.payload.detail;
        draftState.hasCrashed = true;
      }
    }
  });
}

const selectGlobalErrorState: (state) => ErrorHandlerState = (state) => state.ErrorHandler;

export { errorHandlerReducer, selectGlobalErrorState };
