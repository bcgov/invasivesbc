import { AppConfig } from 'state/configuration/runtime-config';
import { UnifiedConfig } from 'state/configuration/unified-config';

interface ConfigurationState {
  current: UnifiedConfig;
}

function createConfigurationReducerWithDefaultState(configuration: UnifiedConfig) {
  const initialState: ConfigurationState = {
    current: configuration
  };
  return (state = initialState, _action) => state;
}

const selectConfiguration: (state) => AppConfig = (state) => state.Configuration.current.runtime;

const selectRootConfiguration: (state) => AppConfig = (state) => state.Configuration;

export { createConfigurationReducerWithDefaultState, selectConfiguration, selectRootConfiguration };
