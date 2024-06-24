import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
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

function createIAPPSiteReducer(configuration: AppConfig) {
  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<IAPPSiteState>) => {
      switch (action.type) {
        case IAPP_GET_REQUEST: {
          draftState.failCode = null;
          draftState.loading = true;
          break;
        }
        case IAPP_GET_FAILURE: {
          draftState.loading = false;
          draftState.failCode = action.payload?.failNetworkObj?.status;
          break;
        }
        case IAPP_GET_SUCCESS: {
          draftState.site = { ...action.payload.iapp };
          draftState.loading = false;
          break;
        }
        default:
          break;
      }
    });
  };
}

const selectIAPPSite: (state) => IAPPSiteState = (state) => state.IAPPSitePage;

export { createIAPPSiteReducer, selectIAPPSite };
