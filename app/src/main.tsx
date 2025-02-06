import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import setupStore, { historySingleton } from 'state/store';
import { PersistGate } from 'redux-persist/integration/react';
import App from './UI/App';
import { PersistorContext } from 'utils/PersistorContext';
import { TileCacheService } from 'utils/tile-cache';
import { Context, TileCacheServiceFactory } from 'utils/tile-cache/context';
import { MOBILE } from 'state/build-time-config';
import TileCache from 'state/actions/cache/TileCache';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';

async function mountApp(CONFIG) {
  const { store, persistor } = setupStore(CONFIG);

  let tileCache: TileCacheService | null = null;

  if (MOBILE) {
    tileCache = await TileCacheServiceFactory.getPlatformInstance();
    await RecordCacheServiceFactory.getPlatformInstance();
    // load any caches present
    store.dispatch(TileCache.repositoryList());
  }

  exportStore = store;

  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    if (root) {
      root.render(
        <PersistGate loading={null} persistor={persistor}>
          <PersistorContext.Provider value={persistor}>
            <Context.Provider value={tileCache}>
              <Router history={historySingleton}>
                <Provider store={store}>
                  <App />
                </Provider>
              </Router>
            </Context.Provider>
          </PersistorContext.Provider>
        </PersistGate>
      );
    }
  }
}

// For tests, please leave:
export let exportStore;

import(/* webpackChunkName: "app_config" */ './state/config').then(({ CONFIG }) => {
  mountApp(CONFIG).then(() => {});
});
