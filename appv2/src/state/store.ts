import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { createRootReducer } from "./reducers/rootReducer";
import rootSaga from "./sagas/rootSaga";
import { createLogger } from 'redux-logger';
import { AUTH_INITIALIZE_REQUEST } from "./actions";
import activityPageSaga from "./sagas/activity";
import authenticationSaga from "./sagas/auth";
import batchSaga from "./sagas/batch";
import emailSettingsSaga from "./sagas/email-setup/emailSettings";
import emailTemplatesSaga from "./sagas/email-setup/emailTemplates";
import iappPageSaga from "./sagas/iappsite";
import activitiesPageSaga from "./sagas/map";
import trainingVideosSaga from "./sagas/training_videos";
import userSettingsSaga from "./sagas/userSettings";
import { AppConfig } from "./config";

export function setupStore(configuration: AppConfig) {
  const sagaMiddleware = createSagaMiddleware();

  const logger = createLogger({
    level: "log",
    collapsed: true,
    duration: true,
    timestamp: true,
    logErrors: true,
/*    diff: true,
    diffPredicate: (getState, action) => true*/
    }
  );

  const store = configureStore({
    reducer: createRootReducer(configuration),
    middleware: [sagaMiddleware, logger],
  });

  sagaMiddleware.run(rootSaga);
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
  return store;
}

export default setupStore
