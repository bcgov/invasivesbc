import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { AppConfig } from '../config';
import IappActions from 'state/actions/activity/Iapp';
import IappRecord from 'interfaces/IappRecord';

interface IAPPSiteState {
  initialized: boolean;
  loading: boolean;
  failCode: unknown | null;
  site: IappRecord | null;
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
      if (IappActions.get.match(action)) {
        draftState.failCode = null;
        draftState.loading = true;
      } else if (IappActions.getSuccess.match(action)) {
        draftState.site = { ...action.payload };
        draftState.loading = false;
      } else if (IappActions.getFailure.match(action)) {
        draftState.loading = false;
      }
    });
  };
}

const selectIAPPSite: (state) => IAPPSiteState = (state) => state.IAPPSitePage;

export { createIAPPSiteReducer, selectIAPPSite };
