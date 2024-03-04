import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import setupStore, { historySingleton } from 'state/store';
import { PersistGate } from 'redux-persist/integration/react';
import App from './UI/App';
import './main.css';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

export let store;
import(/* webpackChunkName: "app_config" */ './state/config').then(({ CONFIG }) => {
  const { store, persistor } = setupStore(CONFIG);

  const container = document.getElementById('root');
  if (container && store) {
    const root = createRoot(container);
    if (root) {
      root.render(
        <PersistGate loading={null} persistor={persistor}>
          <Router history={historySingleton}>
            <Provider store={store}>
              <App />
            </Provider>
          </Router>
        </PersistGate>
      );
    }
    defineCustomElements(window);
  }
});
