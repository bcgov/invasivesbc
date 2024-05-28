import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import setupStore, { historySingleton } from 'state/store';
import { PersistGate } from 'redux-persist/integration/react';
import App from './UI/App';
import './main.css';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { PersistorContext } from 'utils/PersistorContext';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.MODE === 'production' ? '/worker.js' : '/dev-sw.js?dev-sw', {
    type: import.meta.env.MODE === 'production' ? 'classic' : 'module'
  });
}

// For tests, please leave:
export let exportStore;
import(/* webpackChunkName: "app_config" */ './state/config').then(({ CONFIG }) => {
  const { store, persistor } = setupStore(CONFIG);
  exportStore = store;

  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    if (root) {
      root.render(
        <PersistGate loading={null} persistor={persistor}>
          <PersistorContext.Provider value={persistor}>
            <Router history={historySingleton}>
              <Provider store={store}>
                <App />
              </Provider>
            </Router>
          </PersistorContext.Provider>
        </PersistGate>
      );
    }
    defineCustomElements(window);
  }
});
