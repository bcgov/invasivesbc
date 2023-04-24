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
import { getRequestOptions, InvasivesAPI_Callback } from 'hooks/useInvasivesApi';

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
        const postObj = { error: { message: e.message + '' + e.stack}, clientState: loggingState, commitHash: configuration.COMMIT_HASH };
        const requestOptions = state.Auth.requestHeaders;
        const config = state.Configuration.current;
        const options = getRequestOptions(config, requestOptions);
        await InvasivesAPI_Callback('POST', '/api/error', postObj, options)
        alert(`An error has occurred. Please click here to refresh the page and try again. If the problem persists, please contact the system administrator.  This information will be logged for admins, but in case someone asks here is the error (take a screenshot), \n \n ${JSON.stringify(e.message, null, 2)}, ${JSON.stringify(e.stack)}`) // eslint-disable-line no-alert)
        window.location.reload()
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
