import { combineReducers } from 'redux';
import localForage from 'localforage';
import autoMergeLevel1 from 'redux-persist/lib/stateReconciler/autoMergeLevel1';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import appMode from './appMode';
import { ActivityState, createActivityReducer } from './activity';
import { AuthState, createAuthReducer } from './auth';
import { createBatchReducer } from './batch';
import { createEmailSettingsReducer } from './emailSettings';
import { createEmailTemplatesReducer } from './emailTemplates';
import { createMapReducer, MapState } from './map';
import { createTrainingVideosReducer } from './training_videos';
import { createUserSettingsReducer, UserSettingsState } from './userSettings';
import { createIAPPSiteReducer } from './iappsite';
import { createConfigurationReducerWithDefaultState } from './configuration';
import { createNetworkReducer } from './network';
import { createUserInfoReducer } from './userInfo';
import { errorHandlerReducer } from './error_handler';
import { createOfflineActivityReducer, OfflineActivityState } from './offlineActivity';
import { createAlertsAndPromptsReducer } from './alertsAndPrompts';
import { AppConfig } from 'state/config';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import { createTileCacheReducer } from 'state/reducers/tile_cache';
import { MOBILE } from 'state/build-time-config';

// it will try indexdb first, then fall back to localstorage if not available.

const platformStorage = localForage;

/* this should be replaced with an sqlite driver on mobile builds
 eg
 if (import.meta.env.VITE_MOBILE && import.meta.env.VITE_MOBILE.toLowerCase() === 'true') {
   platformStorage = someSQLiteDriver
 }
*/

const purgeOldStateOnVersionUpgrade = async (state: any) => {
  // finer-grained or per-reducer controls are possible -- this is a big hammer to reset saved state when this version changes
  if (state[MIGRATION_VERSION_KEY] && state[MIGRATION_VERSION_KEY] < CURRENT_MIGRATION_VERSION) {
    console.warn(
      `${state[MIGRATION_VERSION_KEY]} older than current version ${CURRENT_MIGRATION_VERSION}, purging old persistent data`
    );
    // return an empty object, meaning reducer-defaults will be used
    return {};
  } else {
    // pass-through unmodified
    return state;
  }
};

function createRootReducer(config: AppConfig) {
  return combineReducers({
    AppMode: appMode,
    AlertsAndPrompts: createAlertsAndPromptsReducer(config),
    Configuration: createConfigurationReducerWithDefaultState(config),
    Auth: persistReducer<AuthState>(
      {
        key: 'auth',
        storage: platformStorage,
        stateReconciler: autoMergeLevel1,
        migrate: purgeOldStateOnVersionUpgrade,
        whitelist: [MIGRATION_VERSION_KEY, 'offlineUsers']
      },
      createAuthReducer(config)
    ),
    UserInfo: createUserInfoReducer({ loaded: false, accessRequested: false, activated: false }),
    Network: createNetworkReducer({ connected: true }),
    ActivityPage: persistReducer<ActivityState>(
      {
        key: 'activity',
        storage: platformStorage,
        stateReconciler: autoMergeLevel1,
        migrate: purgeOldStateOnVersionUpgrade,
        whitelist: [MIGRATION_VERSION_KEY, 'biocontrol']
      },
      createActivityReducer()
    ),
    IAPPSitePage: createIAPPSiteReducer(config),
    UserSettings: persistReducer<UserSettingsState>(
      {
        key: 'user-settings',
        storage: platformStorage,
        stateReconciler: autoMergeLevel2,
        migrate: purgeOldStateOnVersionUpgrade,
        whitelist: [
          MIGRATION_VERSION_KEY,
          'activeActivity',
          'activeActivityDescription',
          'activeIAPP',
          'recordSets',
          'recordsExpanded',
          'newRecordDialogState',
          'darkTheme',
          'boundaries',
          'mapCenter'
        ]
      },
      createUserSettingsReducer(config)
    ),
    Map: persistReducer<MapState>(
      {
        key: 'map',
        storage: platformStorage,
        stateReconciler: autoMergeLevel2,
        migrate: purgeOldStateOnVersionUpgrade,
        whitelist: [
          MIGRATION_VERSION_KEY,
          'MapMode',
          'HDToggle',
          'accuracyToggle',
          'simplePickerLayers2',
          'clientBoundaries',
          'serverBoundaries'
        ]
      },
      createMapReducer(config)
    ),
    Batch: createBatchReducer(),
    TrainingVideos: createTrainingVideosReducer(),
    EmailSettings: createEmailSettingsReducer(),
    EmailTemplates: createEmailTemplatesReducer(),
    ErrorHandler: errorHandlerReducer,
    OfflineActivity: persistReducer<OfflineActivityState>(
      {
        key: 'offline-activity',
        storage: platformStorage,
        migrate: purgeOldStateOnVersionUpgrade,
        stateReconciler: autoMergeLevel1
      },
      createOfflineActivityReducer(config)
    ),
    ...(() => {
      if (MOBILE) {
        return { TileCache: createTileCacheReducer() };
      }
      return {};
    })()
  });
}

export { createRootReducer };

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;
