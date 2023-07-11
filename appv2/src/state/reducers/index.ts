import { combineReducers } from 'redux';
import { createAuthReducer } from './auth';

import { AppConfig } from '../config';

import { createConfigurationReducerWithDefaultState } from './configuration';
import { createUserInfoReducer } from './userInfo';
import { createNetworkReducer } from './network';
import { createActivityReducer } from './activity';
import { createUserSettingsReducer } from './userSettings';
import { createMapReducer } from './map';
import { createIappsiteReducer } from './iappsite';
import { createTrainingVideosReducer } from "./training_videos";
import { createEmailSettingsReducer } from './emailSettings';
import { createEmailTemplatesReducer } from './emailTemplates';
import { createBatchReducer } from './batch';

function createRootReducer(config: AppConfig) {
  return combineReducers({
    Configuration: createConfigurationReducerWithDefaultState(config),
    Auth: createAuthReducer(config),
    UserInfo: createUserInfoReducer({ loaded: false, accessRequested: false, activated: false }),
    Network: createNetworkReducer({ connected: true }),
    ActivityPage: createActivityReducer(config),
    IappsitePage: createIappsiteReducer(config),
    UserSettings: createUserSettingsReducer(config),
    Map: createMapReducer(config),
    Batch: createBatchReducer(),
    TrainingVideos: createTrainingVideosReducer(),
    EmailSettings: createEmailSettingsReducer(),
    EmailTemplates: createEmailTemplatesReducer(),
  });
}

export { createRootReducer };

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
