import { IAPP_GET_FAILURE, IAPP_GET_REQUEST, IAPP_GET_SUCCESS } from '../actions';

import { AppConfig } from '../config';

interface IAPPSiteState {
  initialized: boolean;
  loading: boolean;
  failCode: unknown | null;
  site: unknown | null;
}

const initialState: IAPPSiteState = {
  initialized: false,
  loading: false,
  failCode: null,
  site: null
};

function createIAPPSiteReducer(configuration: AppConfig): (IAPPSiteState, AnyAction) => IAPPSiteState {
  return (state = initialState, action) => {
    if (IAPP_GET_REQUEST.match(action)) {
      return {
        ...state,
        failCode: null,
        loading: true
      };
    }
    if (IAPP_GET_FAILURE.match(action)) {
      return {
        ...state,
        loading: false,
        failCode: action.payload.reason
      };
    }
    if (IAPP_GET_SUCCESS.match(action)) {
      return {
        ...state,
        site: { ...action.payload.iapp },
        loading: false
      };
    }

    return state;
  };
}

const selectIAPPSite: (state) => IAPPSiteState = (state) => state.IAPPSitePage;

export { createIAPPSiteReducer, selectIAPPSite };
