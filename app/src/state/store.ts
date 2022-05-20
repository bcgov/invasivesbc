import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import { createRootReducer } from './reducers';
import createSagaMiddleware from 'redux-saga';

import logger from 'redux-logger';
import authenticationSaga from './sagas/auth';
import { AppConfig } from './config';

const setupStore = (configuration: AppConfig) => {
  const sagaMiddleware = createSagaMiddleware();

  let middlewares;

  if (configuration.DEBUG) {
    middlewares = applyMiddleware(sagaMiddleware, logger);
  } else {
    middlewares = applyMiddleware(sagaMiddleware);
  }

  const store = createStore(createRootReducer(configuration), middlewares);

  // run the sagas
  sagaMiddleware.run(authenticationSaga);

  return store;
};

export { setupStore };
