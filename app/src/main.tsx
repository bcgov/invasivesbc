import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import setupStore, { historySingleton } from 'state/store';
import { PersistGate } from 'redux-persist/integration/react';
import App from './UI/App';
import './main.css';
import { defineCustomElements as pwaLoader } from '@ionic/pwa-elements/loader';
import { PersistorContext } from 'utils/PersistorContext';
import { TileCacheService } from 'UI/Map2/helpers/tile-cache';
import { TileCacheContext } from 'utils/TileCacheContext';
import { MOBILE, PLATFORM, Platform } from 'state/build-time-config';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/worker.js' : '/dev-sw.js?dev-sw', {
    type: import.meta.env.MODE === 'production' ? 'classic' : 'module'
  });
}

async function mountApp(CONFIG) {
  const { store, persistor } = setupStore(CONFIG);

  let tileCache: TileCacheService | null = null;
  if (MOBILE) {
    switch (PLATFORM) {
      case Platform.ANDROID:
      case Platform.IOS:
        tileCache = new TileCacheService();
        await tileCache.initializeTileCache();
        break;
    }
  }

  exportStore = store;

  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    if (root) {
      root.render(
        <PersistGate loading={null} persistor={persistor}>
          <PersistorContext.Provider value={persistor}>
            <TileCacheContext.Provider value={tileCache}>
              <Router history={historySingleton}>
                <Provider store={store}>
                  <App />
                </Provider>
              </Router>
            </TileCacheContext.Provider>
          </PersistorContext.Provider>
        </PersistGate>
      );
    }

    pwaLoader(window);
  }
}

// For tests, please leave:
export let exportStore;

import(/* webpackChunkName: "app_config" */ './state/config').then(({ CONFIG }) => {
  mountApp(CONFIG).then(() => {});
});
