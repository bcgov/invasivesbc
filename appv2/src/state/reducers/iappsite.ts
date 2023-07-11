import {
  IAPP_GET_SUCCESS,
} from '../actions';

import { AppConfig } from '../config';

class IappsiteState {
  initialized: boolean;
  // error: boolean;
  IAPP: any;

  constructor() {
    this.initialized = false;
  }
}
const initialState = new IappsiteState();

function createIappsiteReducer(configuration: AppConfig): (IappsiteState, AnyAction) => IappsiteState {
  return (state = initialState, action) => {
    switch (action.type) {
      case IAPP_GET_SUCCESS: {
        return {
          ...state,
          IAPP: { ...action.payload.iapp }
        };
      }
      default:
        return state;
    }
  };
}

const selectIappsite: (state) => IappsiteState = (state) => state.IappsitePage;

export { createIappsiteReducer, selectIappsite };
