import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createRootReducer } from './reducers/rootReducer';
import { createLogger } from 'redux-logger';
import { AUTH_INITIALIZE_REQUEST, URL_CHANGE } from './actions';
import activityPageSaga from './sagas/activity';
import authenticationSaga from './sagas/auth/auth';
import batchSaga from './sagas/batch';
import emailSettingsSaga from './sagas/email-setup/emailSettings';
import emailTemplatesSaga from './sagas/email-setup/emailTemplates';
import iappPageSaga from './sagas/iappsite';
import activitiesPageSaga from './sagas/map';
import trainingVideosSaga from './sagas/training_videos';
import userSettingsSaga from './sagas/userSettings';
import { AppConfig } from './config';
import { createBrowserHistory } from 'history';
import { createSagaCrashHandler } from './sagas/error_handler';
import { persistStore } from 'redux-persist';

const historySingleton = createBrowserHistory();

export let globalStore;

export function setupStore(configuration: AppConfig) {
  const storeRef = {
    store: null
  };
  const sagaMiddleware = createSagaMiddleware({
    onError: createSagaCrashHandler(storeRef)
  });

  const logger = createLogger({
    level: 'log',
    collapsed: true,
    duration: true,
    timestamp: true,
    logErrors: true,
    diff: true,
    diffPredicate: (getState, action) => {
      if (action.type.includes('RECORDSET_SET_SORT')) {
        return true;
      }
      return false;
    }
  });

  if (!configuration.TEST && configuration.DEBUG) {
    globalStore = configureStore({
      reducer: createRootReducer(configuration),
      middleware: (getDefaultMiddleware) => {
        // these checks are useful but very slow
        return getDefaultMiddleware({
          actionCreatorCheck: false,
          serializableCheck: false,
          immutableCheck: false
        }).concat([sagaMiddleware, logger]);
      }
    });
  } else {
    globalStore = configureStore({
      reducer: createRootReducer(configuration),
      middleware: (getDefaultMiddleware) => {
        // these checks are useful but very slow
        return getDefaultMiddleware({
          actionCreatorCheck: false,
          serializableCheck: false,
          immutableCheck: false
        }).concat([sagaMiddleware]);
      }
    });
  }

  sagaMiddleware.run(authenticationSaga);
  sagaMiddleware.run(activityPageSaga);
  sagaMiddleware.run(iappPageSaga);
  sagaMiddleware.run(activitiesPageSaga);
  sagaMiddleware.run(userSettingsSaga);
  sagaMiddleware.run(batchSaga);
  sagaMiddleware.run(trainingVideosSaga);
  sagaMiddleware.run(emailSettingsSaga);
  sagaMiddleware.run(emailTemplatesSaga);

  globalStore.dispatch({ type: AUTH_INITIALIZE_REQUEST });

  historySingleton.listen((location) => {
    globalStore.dispatch({
      type: URL_CHANGE,
      payload: {
        url: location.pathname
      }
    });
  });

  storeRef.store = globalStore;

  return { store: globalStore, persistor: persistStore(globalStore) };
}

export { historySingleton };

export default setupStore;
