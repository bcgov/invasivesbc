import { configureStore, ThunkDispatch } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import { createBrowserHistory } from 'history';
import { persistStore } from 'redux-persist';
import { Store } from 'redux';
import { createRootReducer } from './reducers/rootReducer';
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
import { createSagaCrashHandler } from './sagas/error_handler';
import { AppConfig } from './config';
import { DEBUG } from './build-time-config';

const historySingleton = createBrowserHistory();

export function setupStore(configuration: AppConfig) {
  const storeRef: { store: Store | null } = {
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
    diffPredicate: (getState, action) =>
      ['MAP_TOGGLE_TRACK_ME_DRAW_GEO', 'ACTIVITY_UPDATE_GEO', 'GET_SUGGESTED_JURISDICTIONS'].filter((item) =>
        action.type.includes(item)
      ).length > 0
  });

  const store = (() => {
    if (DEBUG) {
      return configureStore({
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
      return configureStore({
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
  })();

  sagaMiddleware.run(authenticationSaga);
  sagaMiddleware.run(activityPageSaga);
  sagaMiddleware.run(iappPageSaga);
  sagaMiddleware.run(activitiesPageSaga);
  sagaMiddleware.run(userSettingsSaga);
  sagaMiddleware.run(batchSaga);
  sagaMiddleware.run(trainingVideosSaga);
  sagaMiddleware.run(emailSettingsSaga);
  sagaMiddleware.run(emailTemplatesSaga);

  store.dispatch({ type: AUTH_INITIALIZE_REQUEST });

  historySingleton.listen((location) => {
    store.dispatch({
      type: URL_CHANGE,
      payload: {
        url: location.pathname
      }
    });
  });

  storeRef.store = store;

  return { store, persistor: persistStore(store) };
}

export { historySingleton };

export default setupStore;
