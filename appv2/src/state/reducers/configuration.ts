import { AppConfig } from '../config';
import { EXPORT_CONFIG_LOAD_ERROR, EXPORT_CONFIG_LOAD_REQUEST, EXPORT_CONFIG_LOAD_SUCCESS } from '../actions';
import moment from 'moment';

interface ConfigurationState {
  current: AppConfig;
  exportConfigLoading: boolean;
  exportConfigFreshUntil: number | null;
  exportConfig: null | unknown;
}

function createConfigurationReducerWithDefaultState(configuration: AppConfig) {
  const initialState: ConfigurationState = {
    current: configuration,
    exportConfig: null | Array,
    exportConfigLoading: false,
    exportConfigFreshUntil: moment.Moment
  };

  return (state = initialState, action) => {
    switch (action.type) {
      case EXPORT_CONFIG_LOAD_REQUEST: {
        return {
          ...state,
          exportConfigFreshUntil: null,
          exportConfigLoading: true,
          exportConfig: null
        };
      }
      case EXPORT_CONFIG_LOAD_ERROR: {
        return {
          ...state,
          exportConfigFreshUntil: null,
          exportConfigLoading: false,
          exportConfig: null
        };
      }
      case EXPORT_CONFIG_LOAD_SUCCESS: {
        return {
          ...state,
          exportConfigFreshUntil: moment().add('15', 'minutes'),
          exportConfigLoading: true,
          exportConfig: action.payload
        };
      }
    }
    return state;
  };
}

const selectConfiguration: (state) => AppConfig = (state) => state.Configuration.current;

const selectRootConfiguration: (state) => AppConfig = (state) => state.Configuration;

export { createConfigurationReducerWithDefaultState, selectConfiguration, selectRootConfiguration };
