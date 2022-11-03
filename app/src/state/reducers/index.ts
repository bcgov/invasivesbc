import { combineReducers } from 'redux';
import { createAuthReducer } from './auth';

import { AppConfig } from '../config';

import { createConfigurationReducerWithDefaultState } from './configuration';
import { createUserInfoReducer } from './userInfo';
import { createNetworkReducer } from './network';
import { createActivityReducer } from './activity';
import { createUserSettingsReducer } from './userSettings';
import { createTabsReducer } from './tabs';
import { createActivitiesReducer } from './activities';

function createRootReducer(config: AppConfig) {
  return combineReducers({
    Configuration: createConfigurationReducerWithDefaultState(config),
    Auth: createAuthReducer(config),
    UserInfo: createUserInfoReducer({ loaded: false, accessRequested: false, activated: false }),
    Network: createNetworkReducer({ connected: true }),
    ActivityPage: createActivityReducer(config),
    UserSettings: createUserSettingsReducer(config),
    Tabs: createTabsReducer(config),
    Activities: createActivitiesReducer(config)
  });
}

export { createRootReducer };

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
