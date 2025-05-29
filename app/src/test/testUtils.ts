/**
 * Helpers and Shorthand functions for Writing Tests and Mocks
 */
import { configureStore, Reducer } from '@reduxjs/toolkit';
import { UnifiedConfig } from 'state/configuration/unified-config';
import { Platform } from 'state/configuration/build-time-config';
import { BASELINE_FEATURES } from 'state/configuration/feature-flags';
import { RootState } from 'state/reducers/rootReducer';

/**
 * @param key Key of { RootState } Enforces Type Guards for creation
 * @param config Slice of RootState key to create
 * @returns mock reducer with type guards added
 */
function mockSliceReducer<K extends keyof RootState>(
  key: K,
  config: Partial<RootState[K]>
): { [P in K]: (state: Partial<RootState[K]>) => Partial<RootState[K]> } {
  const reducer = (state: Partial<RootState[K]> = config): Partial<RootState[K]> => state;
  return { [key]: reducer } as { [P in K]: (state: Partial<RootState[K]>) => Partial<RootState[K]> };
}

/**
 * @desc Shorthand for creating and implementing a mock redux store
 * @param reducers Supplied reducers for creation. e.g. {Configuration: createConfigurationReducer()}
 */
const createMockStore = (reducers: Record<PropertyKey, Reducer>) =>
  configureStore({
    reducer: {
      ...reducers
    }
  });

const DEFAULT_TEST_CONFIGURATION: UnifiedConfig = {
  runtime: {
    API_BASE: 'http://localhost/',
    COMMIT_HASH: 'testtesttest',
    KEYCLOAK_CLIENT_ID: 'test',
    KEYCLOAK_REALM: 'test',
    KEYCLOAK_URL: 'http://localhost',
    REDIRECT_URI: '',
    SILENT_CHECK_URI: '',
    PUBLIC_MAP_URL: '',
    IOS_APP_STORE_URL: 'http://localhost/',
    ANDROID_APP_STORE_URL: 'http://localhost/'
  },
  build: {
    MOBILE: false,
    DEBUG: false,
    PLATFORM: Platform.WEB
  },
  features: BASELINE_FEATURES
};

const IOS_TEST_CONFIGURATION: UnifiedConfig = {
  runtime: {
    API_BASE: 'http://localhost/',
    COMMIT_HASH: 'testtesttest',
    KEYCLOAK_CLIENT_ID: 'test',
    KEYCLOAK_REALM: 'test',
    KEYCLOAK_URL: 'http://localhost',
    REDIRECT_URI: '',
    SILENT_CHECK_URI: '',
    PUBLIC_MAP_URL: '',
    IOS_APP_STORE_URL: 'http://localhost/',
    ANDROID_APP_STORE_URL: 'http://localhost/'
  },
  build: {
    MOBILE: true,
    DEBUG: false,
    PLATFORM: Platform.IOS
  },
  features: BASELINE_FEATURES
};

const ANDROID_TEST_CONFIGURATION: UnifiedConfig = {
  runtime: {
    API_BASE: 'http://localhost/',
    COMMIT_HASH: 'testtesttest',
    KEYCLOAK_CLIENT_ID: 'test',
    KEYCLOAK_REALM: 'test',
    KEYCLOAK_URL: 'http://localhost',
    REDIRECT_URI: '',
    SILENT_CHECK_URI: '',
    PUBLIC_MAP_URL: '',
    IOS_APP_STORE_URL: 'http://localhost/',
    ANDROID_APP_STORE_URL: 'http://localhost/'
  },
  build: {
    MOBILE: true,
    DEBUG: false,
    PLATFORM: Platform.ANDROID
  },
  features: BASELINE_FEATURES
};

/**
 * @desc type-safe configuration reducer mock
 **/
function createMockConfigurationReducer(config: UnifiedConfig = DEFAULT_TEST_CONFIGURATION) {
  return (
    state = {
      current: config
    }
  ) => state;
}

export {
  createMockStore,
  createMockConfigurationReducer,
  mockSliceReducer,
  DEFAULT_TEST_CONFIGURATION,
  ANDROID_TEST_CONFIGURATION,
  IOS_TEST_CONFIGURATION
};
