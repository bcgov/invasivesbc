import {
  IAPP_GET_MEDIA_SUCCESS,
  IAPP_GET_SUCCESS,
} from '../actions';

import { AppConfig } from '../config';

class IappsiteState {
  initialized: boolean;
  // error: boolean;
  IAPP: any;
  media: [];

  constructor() {
    this.initialized = false;
    this.media = [];
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
      case IAPP_GET_MEDIA_SUCCESS: {
        return {
          ...state,
          media: [...state.media, action.payload.media]
        }
      }
      default:
        return state;
    }
  };
}

const selectIappsite: (state) => IappsiteState = (state) => state.IappsitePage;

export { createIappsiteReducer, selectIappsite };
