import { combineReducers } from 'redux';
import { createAuthReducer } from './auth';

import { AppConfig } from '../config';

import { createConfigurationReducerWithDefaultState } from './configuration';
import {createUserInfoReducer} from "./userInfo";

function createRootReducer(config: AppConfig) {
  const rootReducer = combineReducers({
    Configuration: createConfigurationReducerWithDefaultState(config),
    Auth: createAuthReducer(config),
    UserInfo: createUserInfoReducer({loaded: true, accessRequested: false, activated: true})
  });

  return rootReducer;
}

export { createRootReducer };

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
