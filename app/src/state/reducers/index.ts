import { combineReducers } from 'redux';
import { createAuthReducer } from './auth';

import { AppConfig } from '../config';

import { createConfigurationReducerWithDefaultState } from './configuration';

function createRootReducer(config: AppConfig) {
  const rootReducer = combineReducers({
    Configuration: createConfigurationReducerWithDefaultState(config),
    Auth: createAuthReducer(config)
  });

  return rootReducer;
}

export { createRootReducer };

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
