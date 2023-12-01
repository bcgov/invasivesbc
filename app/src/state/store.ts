import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import { createRootReducer } from './reducers';
import createSagaMiddleware from 'redux-saga';

import { createLogger } from 'redux-logger';
import authenticationSaga from './sagas/auth';
import { AppConfig } from './config';
import { AUTH_INITIALIZE_REQUEST, USER_SETTINGS_SET_API_ERROR_DIALOG } from './actions';
import activityPageSaga from './sagas/activity';
import userSettingsSaga from './sagas/userSettings';
import tabsSaga from './sagas/tabs';
import activitiesPageSaga from './sagas/map';
import iappPageSaga from './sagas/iappsite';
import batchSaga from './sagas/batch';
import { getRequestOptions, InvasivesAPI_Callback } from 'hooks/useInvasivesApi';
import trainingVideosSaga from "./sagas/training_videos";
import emailSettingsSaga from './sagas/email-setup/emailSettings';
import emailTemplatesSaga from './sagas/email-setup/emailTemplates';
import publicMapSaga from "./sagas/public_map";

const setupStore = (configuration: AppConfig) => {
  const logger = createLogger({
    collapsed: true
  });
  let middlewares;

  const sagaMiddleware = createSagaMiddleware({
    onError: async (e, errorInfo) => {
      console.log('there was an error');
      const state = store.getState();
      if (state.Auth.authenticated) {
        let loggingState = JSON.parse(JSON.stringify(state));
        loggingState.ActivityPage = null;
        loggingState.IAPPSitePage = null;
        loggingState.Map = null
        loggingState.UserSettings.apiDocsWithSelectOptions = null;
        loggingState.UserSettings.apiDocsWithViewOptions = null;

        const postObj = {
          error: { message: e.message + '' + e.stack },
          clientState: loggingState,
          commitHash: configuration.COMMIT_HASH
        };
        const requestOptions = state.Auth.requestHeaders;
        const config = state.Configuration.current;
        const options = getRequestOptions(config, requestOptions);
        await InvasivesAPI_Callback('POST', '/api/error', postObj, options);
        store.dispatch({
          type: USER_SETTINGS_SET_API_ERROR_DIALOG,
          payload: {
            APIErrorDialog: {
              dialogActions: [
                {
                  actionName: 'Reset Cache',
                  actionOnClick: async () => {
                    localStorage.clear();
                    window.location.reload();
                  }
                },
                {
                  actionName: 'Refresh',
                  actionOnClick: async () => {
                    window.location.reload();
                  },
                  autoFocus: true
                }
              ],
              dialogOpen: true,
              dialogTitle: 'An error has occurred.',
              dialogContentText: `Please refresh the page and try again. If refreshing does not work please click 'Reset Cache' to reset your cache and try again. This will reset your record sets and boundaries. If the problem persists, please contact the system administrator.  This information will be logged for admins, but in case someone asks here is the error (take a screenshot), \n \n ${JSON.stringify(
                e.message,
                null,
                2
              )}, ${JSON.stringify(e.stack)}`
            }
          }
        });
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
  sagaMiddleware.run(trainingVideosSaga);
  sagaMiddleware.run(emailSettingsSaga);
  sagaMiddleware.run(emailTemplatesSaga);
  sagaMiddleware.run(publicMapSaga);

  store.dispatch({ type: AUTH_INITIALIZE_REQUEST });

  return store;
};

export { setupStore };
