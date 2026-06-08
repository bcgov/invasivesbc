import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import { persistStore } from 'redux-persist';
import { Store } from 'redux';
import debounce from 'lodash.debounce';
import { createRootReducer } from './reducers/rootReducer';
import activityPageSaga from './sagas/activity';
import planMyTripSaga from './sagas/planMyTrip';
import authenticationSaga from './sagas/auth/auth';
import batchSaga from './sagas/batch';
import emailSettingsSaga from './sagas/email-setup/emailSettings';
import emailTemplatesSaga from './sagas/email-setup/emailTemplates';
import iappPageSaga from './sagas/iappsite';
import activitiesPageSaga from './sagas/map';
import networkSaga from './sagas/network';
import userSettingsSaga from './sagas/userSettings';
import { createSagaCrashHandler } from './sagas/error_handler';
import NetworkActions from './actions/network/NetworkActions';
import { AuthActions } from 'state/actions/auth/Auth';
import EventActions from 'state/actions/events/EventActions';
import { UnifiedConfig } from 'state/configuration/unified-config';
import OfflineProtomaps from 'state/actions/cache/OfflineProtomaps';

export function setupStore(configuration: UnifiedConfig) {
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
    diffPredicate: (getState, action) => ['ACTIVITY_UPDATE_GEO'].filter((item) => action.type.includes(item)).length > 0
  });

  const store = (() => {
    if (configuration.build.DEBUG) {
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
  sagaMiddleware.run(emailSettingsSaga);
  sagaMiddleware.run(emailTemplatesSaga);
  sagaMiddleware.run(networkSaga);
  sagaMiddleware.run(planMyTripSaga);

  storeRef.store = store;
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      store.dispatch(EventActions.wakeup());
    }
  });
  document.addEventListener('focus', () => {
    store.dispatch(EventActions.wakeup());
  });

  // throttled updates. used to control some layouts (eg alternative button text on very tiny screens)
  const debouncedResize = debounce(
    () => {
      store.dispatch(EventActions.viewportResize({ width: window.innerWidth, height: window.innerHeight }));
    },
    1000,
    { trailing: true }
  );

  window.addEventListener('resize', debouncedResize);

  return {
    store,
    persistor: persistStore(store, null, () => {
      //Fire these actions once store is rehydrated
      store.dispatch(NetworkActions.checkInitConnection());
      store.dispatch(AuthActions.initializeRequest());
    })
  };
}

export default setupStore;
