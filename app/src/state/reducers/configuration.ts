import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import moment from 'moment/moment';
import { AppConfig } from '../config';
import { EXPORT_CONFIG_LOAD_ERROR, EXPORT_CONFIG_LOAD_REQUEST, EXPORT_CONFIG_LOAD_SUCCESS } from 'state/actions';

interface ConfigurationState {
  current: AppConfig;
  exportConfigLoading: boolean;
  exportConfigFreshUntil: number | null;
  exportConfig: null | unknown;
}

function createConfigurationReducerWithDefaultState(configuration: AppConfig) {
  const initialState: ConfigurationState = {
    current: configuration,
    exportConfig: null,
    exportConfigLoading: false,
    exportConfigFreshUntil: 0
  };

  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<ConfigurationState>) => {
      switch (action.type) {
        case EXPORT_CONFIG_LOAD_REQUEST: {
          draftState.exportConfigFreshUntil = null;
          draftState.exportConfigLoading = true;
          draftState.exportConfig = null;
          break;
        }
        case EXPORT_CONFIG_LOAD_ERROR: {
          draftState.exportConfigFreshUntil = null;
          draftState.exportConfigLoading = false;
          draftState.exportConfig = null;
          break;
        }
        case EXPORT_CONFIG_LOAD_SUCCESS: {
          draftState.exportConfigFreshUntil = moment().add('15', 'minutes').valueOf();
          draftState.exportConfigLoading = true;
          draftState.exportConfig = action.payload;
          break;
        }
      }
    });
  };
}

const selectConfiguration: (state) => AppConfig = (state) => state.Configuration.current;

const selectRootConfiguration: (state) => AppConfig = (state) => state.Configuration;

export { createConfigurationReducerWithDefaultState, selectConfiguration, selectRootConfiguration };
