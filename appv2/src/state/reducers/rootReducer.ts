import { combineReducers } from 'redux';
import appMode from './appMode';
import { createActivityReducer } from './activity';
import { createAuthReducer } from './auth';
import { createBatchReducer } from './batch';
import { createEmailSettingsReducer } from './emailSettings';
import { createEmailTemplatesReducer } from './emailTemplates';
import { createMapReducer } from './map';
import { createTrainingVideosReducer } from './training_videos';
import { createUserSettingsReducer } from './userSettings';
import { createIAPPSiteReducer } from './iappsite';
import { createConfigurationReducerWithDefaultState } from './configuration';
import { createNetworkReducer } from './network';
import { createUserInfoReducer } from './userInfo';
import { AppConfig } from 'state/config';
import { errorHandlerReducer } from './error_handler';

import storage from 'redux-persist/lib/storage';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel1';

import { persistReducer } from 'redux-persist';
import { createOfflineActivityReducer } from './offlineActivity';

function createRootReducer(config: AppConfig) {
  return combineReducers({
    AppMode: appMode,
    Configuration: createConfigurationReducerWithDefaultState(config),
    Auth: persistReducer({
      key: 'auth',
      storage,
      stateReconciler: autoMergeLevel2,
      whitelist: ['offlineUsers']
    }, createAuthReducer(config)),
    UserInfo: createUserInfoReducer({ loaded: false, accessRequested: false, activated: false }),
    Network: createNetworkReducer({ connected: true }),
    ActivityPage: createActivityReducer(config),
    IAPPSitePage: createIAPPSiteReducer(config),
    UserSettings: createUserSettingsReducer(config),
    Map: createMapReducer(config),
    Batch: createBatchReducer(),
    TrainingVideos: createTrainingVideosReducer(),
    EmailSettings: createEmailSettingsReducer(),
    EmailTemplates: createEmailTemplatesReducer(),
    ErrorHandler: errorHandlerReducer,
    OfflineActivity: persistReducer(
      {
        key: 'offline-activity',
        storage,
        stateReconciler: hardSet
      },
      createOfflineActivityReducer(config)
    )
  });
}

export { createRootReducer };

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
