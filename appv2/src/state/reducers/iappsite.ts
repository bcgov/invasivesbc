import {
  IAPP_GET_SUCCESS,
  IAPP_GET_FAILURE,
  IAPP_GET_REQUEST
} from '../actions';

import {AppConfig} from '../config';


class IAPPSiteState {
  initialized: boolean;
  loading: boolean;
  failCode: unknown | null;
  site: unknown | null;

  constructor() {
    this.initialized = false;
    this.failCode = null;
  }
}

const initialState = new IAPPSiteState();

function createIAPPSiteReducer(configuration: AppConfig): (IAPPSiteState, AnyAction) => IAPPSiteState {
  return (state = initialState, action) => {
    switch (action.type) {

      case IAPP_GET_REQUEST: {
        return {
          ...state,
          failCode: null,
          loading: true
        };
      }
      case IAPP_GET_FAILURE: {
        return {
          ...state,
          loading: false,
          failCode: action.payload?.failNetworkObj?.status
        }
      }
      case IAPP_GET_SUCCESS: {
        return {
          ...state,
          site: {...action.payload.iapp},
          loading: false
        };
      }
      default:
        return state;
    }
  };
}

const selectIAPPSite: (state) => IAPPSiteState = (state) => state.IAPPSitePage;

export {createIAPPSiteReducer, selectIAPPSite};

