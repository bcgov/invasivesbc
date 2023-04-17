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
import batchSaga from './sagas/batch';
import { selectAuth } from './reducers/auth';
import { call, select } from 'redux-saga/effects';
import { InvasivesAPI_Call, getRequestOptions } from 'hooks/useInvasivesApi';
import  co from 'co';
import { InvasivesAPI_Callback } from 'hooks/useInvasivesApi';

const setupStore = (configuration: AppConfig) => {
  const logger = createLogger({
    collapsed: true
  });
  let middlewares;

  const sagaMiddleware = createSagaMiddleware({
    onError:  async (e, errorInfo) => {
      console.log('there was an error');
      const state = store.getState();
      if (state.Auth.authenticated) {
        let loggingState = JSON.parse(JSON.stringify(state));
        loggingState.Map.activitiesGeoJSON = state.Map.activitiesGeoJSON?.features?.length;
        loggingState.Map.IAPPGeoJSON = state.Map.IAPPGeoJSON?.features?.length;
        const postObj = { error: { message: e.message + '' + e.stack}, clientState: loggingState, commitHash: COMMIT_HASH };
        const requestOptions = state.Auth.requestHeaders;
        const config = state.Configuration.current;
        const options = getRequestOptions(config, requestOptions);

        await InvasivesAPI_Callback('POST', '/api/error', postObj, options)
      }
    }
  });

  let store;
  if (configuration.DEBUG) {
    store = createStore(createRootReducer(configuration), applyMiddleware(sagaMiddleware, logger));
  } else {
    store = createStore(createRootReducer(configuration), applyMiddleware(sagaMiddleware));
  }

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
