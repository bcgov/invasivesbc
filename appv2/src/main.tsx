import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import setupStore from 'state/store';
import App from './UI/App';

let store;
import(/* webpackChunkName: "app_config" */ './state/config').then(({ CONFIG }) => {
  store = setupStore(CONFIG);

  const container = document.getElementById('root');
  if (container && store) {
    console.log('about to render');
    const root = createRoot(container);
    if (root) {
      root.render(
        <BrowserRouter>
          <Provider store={store}>
            <App />
          </Provider>
        </BrowserRouter>
      );
    }
  }
});
