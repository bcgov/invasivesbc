import { AppConfig } from '../config';

interface ConfigurationState {
  current: AppConfig;
}

function createConfigurationReducerWithDefaultState(configuration: AppConfig) {
  const initialState: ConfigurationState = {
    current: configuration
  };

  return (state = initialState, action) => {
    return state;
  };
}

const selectConfiguration: (state) => AppConfig = (state) => state.Configuration.current;

export { createConfigurationReducerWithDefaultState, selectConfiguration };
