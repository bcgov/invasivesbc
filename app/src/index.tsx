import { defineCustomElements } from '@ionic/pwa-elements/loader';
import App from 'App';
import { default as React, useEffect } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from 'serviceWorker';
import { setupStore } from './state/store';
import { Device } from '@capacitor/device';

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);

const startApp = (info) => {
  import(/* webpackChunkName: "app_config" */ 'state/config').then(({ CONFIG }) => {
    const store = setupStore(CONFIG);
    ReactDOM.render(<App deviceInfo={info} store={store} />, document.getElementById('root'));
    serviceWorker.unregister();
  });
};

if (window['cordova']) {
  // start app on mobile
  // must wait for 'deviceready' before starting
  document.addEventListener(
    'deviceready',
    async () => {
      const info = await Device.getInfo(); // TODO move this into a context provider
      startApp(info);
    },
    false
  );
} else {
  // start app on web
  startApp(null);
}
