import moment from 'moment';
import { AppConfig } from '../config';
import { EXPORT_CONFIG_LOAD_ERROR, EXPORT_CONFIG_LOAD_REQUEST, EXPORT_CONFIG_LOAD_SUCCESS } from '../actions';

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
    if (EXPORT_CONFIG_LOAD_REQUEST.match(action)) {
      return {
        ...state,
        exportConfigFreshUntil: null,
        exportConfigLoading: true,
        exportConfig: null
      };
    }
    if (EXPORT_CONFIG_LOAD_ERROR.match(action)) {
      return {
        ...state,
        exportConfigFreshUntil: null,
        exportConfigLoading: false,
        exportConfig: null
      };
    }
    if (EXPORT_CONFIG_LOAD_SUCCESS.match(action)) {
      return {
        ...state,
        exportConfigFreshUntil: moment().add('15', 'minutes').valueOf(),
        exportConfigLoading: true,
        exportConfig: action.payload
      };
    }

    return state;
  };
}

const selectConfiguration: (state) => AppConfig = (state) => state.Configuration.current;

const selectRootConfiguration: (state) => AppConfig = (state) => state.Configuration;

export { createConfigurationReducerWithDefaultState, selectConfiguration, selectRootConfiguration };
