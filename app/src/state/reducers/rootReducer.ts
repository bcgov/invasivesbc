import { combineReducers } from 'redux';
import localForage from 'localforage';
import autoMergeLevel1 from 'redux-persist/lib/stateReconciler/autoMergeLevel1';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { createTransform, persistReducer } from 'redux-persist';
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
import { createNetworkReducer, NetworkState } from './network';
import { createUserInfoReducer } from './userInfo';
import { errorHandlerReducer } from './error_handler';
import { createOfflineActivityReducer, OfflineActivityState } from './offlineActivity';
import { createAlertsAndPromptsReducer } from './alertsAndPrompts';
import { createDownloadStateReducer } from './downloads';
import { AppConfig } from 'state/config';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import { createTileCacheReducer } from 'state/reducers/tile_cache';
import { MOBILE, PLATFORM, Platform } from 'state/build-time-config';
import { UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { CacheDownloadMode } from 'utils/record-cache';
import { SQLiteStorage } from 'utils/redux-persist-sqlite';

// intended to be more durable than localStorage, and not purged when the application is reset
const durableStorage = (() => {
  if (PLATFORM == Platform.IOS) {
    return new SQLiteStorage();
  } else {
    return localForage;
  }
})();

const platformStorage = localForage;

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

const preserveStateOnVersionUpgrade = async (state: any) => {
  return state;
};

// executes during app restart or when the page reloads
const handleActiveDownloadsOnRehydration = createTransform(
  (inboundState) => inboundState,

  (outboundState) => {
    if (outboundState && typeof outboundState === 'object') {
      Object.keys(outboundState).forEach((key) => {
        // updates state correctly when page reloads during an active download
        if (outboundState[key]?.cacheMetadataStatus === UserRecordCacheStatus.DOWNLOADING) {
          outboundState[key].cacheMetadataStatus = UserRecordCacheStatus.PAUSED;
          outboundState[key].cacheDownloadProgress.downloadMode = CacheDownloadMode.PAUSE;
          outboundState[key].cacheDownloadProgress.message =
            `Mode: ${CacheDownloadMode.PAUSE.toLocaleString().toUpperCase()} Caching`;
        } else if (outboundState[key].cacheMetadataStatus === UserRecordCacheStatus.QUEUED) {
          outboundState[key].cacheMetadataStatus = UserRecordCacheStatus.NOT_CACHED;
        }
      });
    }
    return outboundState;
  },
  { whitelist: ['recordSets'] }
);

// Sets the working state to false on app reload
const handleSyncTermination = createTransform(
  (inboundState) => inboundState,
  () => false,
  { whitelist: ['working'] }
);
function createRootReducer(config: AppConfig) {
  return combineReducers({
    AppMode: appMode,
    AlertsAndPrompts: createAlertsAndPromptsReducer(config),
    Configuration: createConfigurationReducerWithDefaultState(config),
    DownloadState: createDownloadStateReducer,
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
    Network: persistReducer<NetworkState>(
      {
        key: 'network',
        storage: platformStorage,
        stateReconciler: autoMergeLevel1,
        whitelist: ['connected', 'administrativeStatus', 'operationalStatus']
      },
      createNetworkReducer()
    ),
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
          'boundaries',
          'layerPickerIsAccordion',
          'mapCenter',
          'offlineDocs',
          'tableColumns'
        ],
        transforms: [handleActiveDownloadsOnRehydration]
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
    OfflineActivity: (() => {
      const persistedReducer = persistReducer<OfflineActivityState>(
        {
          key: 'offline-activity',
          storage: durableStorage,
          migrate: preserveStateOnVersionUpgrade,
          stateReconciler: autoMergeLevel1,
          transforms: [handleSyncTermination]
        },
        createOfflineActivityReducer(config)
      );

      return (state, action) => {
        if (action.type === 'persist/PURGE') {
          // protect this reducer from the purge action
          return state;
        } else {
          return persistedReducer(state, action);
        }
      };
    })(),
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
