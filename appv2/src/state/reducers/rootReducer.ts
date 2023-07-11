import { combineReducers } from "redux";
import appMode from "./appMode";
import { createActivityReducer } from "./activity";
import { createAuthReducer } from "./auth";
import { createBatchReducer } from "./batch";
import { createEmailSettingsReducer } from "./emailSettings";
import { createEmailTemplatesReducer } from "./emailTemplates";
import { createMapReducer } from "./map";
import { createTrainingVideosReducer } from "./training_videos";
import { createUserSettingsReducer } from "./userSettings";
import { createIappsiteReducer } from "./iappsite";
import { createConfigurationReducerWithDefaultState } from "./configuration";
import { config } from "process";
import { createNetworkReducer } from "./network";
import { createUserInfoReducer } from "./userInfo";
import { AppConfig } from "state/config";


    function createRootReducer(config: AppConfig) {
        return combineReducers({
            AppMode: appMode,
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
      