//import './wdyr'; // <--- first import
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import setupStore, { historySingleton } from 'state/store';
import App from './UI/App';
import './main.css';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

let store;
import(/* webpackChunkName: "app_config" */ './state/config').then(({ CONFIG }) => {
  store = setupStore(CONFIG);

  const container = document.getElementById('root');
  if (container && store) {
    console.log('about to render');
    const root = createRoot(container);
    if (root) {
      console.log('rendered')
      root.render(
        <Router history={historySingleton}>
          <Provider store={store}>
            <App />
          </Provider>
        </Router>
      );
    }
    defineCustomElements(window);
  }
});
