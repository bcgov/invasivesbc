import { combineReducers } from 'redux';
import { createAuthReducer } from './auth';

import { AppConfig } from '../config';

import { createConfigurationReducerWithDefaultState } from './configuration';
import { createUserInfoReducer } from './userInfo';
import { createNetworkReducer } from './network';
import { createActivityReducer } from './activity';

function createRootReducer(config: AppConfig) {
  return combineReducers({
    Configuration: createConfigurationReducerWithDefaultState(config),
    Auth: createAuthReducer(config),
    UserInfo: createUserInfoReducer({ loaded: false, accessRequested: false, activated: false }),
    Network: createNetworkReducer({ connected: true }),
    ActivityPage: createActivityReducer(config)
  });
}

export { createRootReducer };

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
