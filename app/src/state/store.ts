import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import { createRootReducer } from './reducers';
import createSagaMiddleware from 'redux-saga';

import { createLogger } from 'redux-logger';
import authenticationSaga from './sagas/auth';
import { AppConfig } from './config';
import { AUTH_INITIALIZE_REQUEST } from './actions';
import activityPageSaga from './sagas/activity';
import userSettingsSaga from './sagas/userSettings';
import tabsSaga from './sagas/tabs';
import activitiesPageSaga from './sagas/map';
import iappPageSaga from './sagas/iappsite';
import batchSaga from "./sagas/batch";

const setupStore = (configuration: AppConfig) => {
  const sagaMiddleware = createSagaMiddleware();
  const logger = createLogger({
    collapsed: true
  });
  let middlewares;

  if (configuration.DEBUG) {
    middlewares = applyMiddleware(sagaMiddleware, logger);
  } else {
    middlewares = applyMiddleware(sagaMiddleware);
  }

  const store = createStore(createRootReducer(configuration), middlewares);

  // run the sagas
  sagaMiddleware.run(authenticationSaga);
  sagaMiddleware.run(activityPageSaga);
  sagaMiddleware.run(iappPageSaga);
  sagaMiddleware.run(activitiesPageSaga);
  sagaMiddleware.run(userSettingsSaga);
  sagaMiddleware.run(tabsSaga);
  sagaMiddleware.run(batchSaga);

  store.dispatch({ type: AUTH_INITIALIZE_REQUEST });

  return store;
};

export { setupStore };
