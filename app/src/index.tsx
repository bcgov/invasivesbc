import { defineCustomElements } from '@ionic/pwa-elements/loader';
import App from './App';
import { default as React, HTMLAttributes } from 'react';
import ReactDOM from 'react-dom';
import { setupStore } from './state/store';
import { Device } from '@capacitor/device';
import { applyPolyfills, defineCustomElements as jeepSqlite, JSX as LocalJSX } from 'jeep-sqlite/loader';

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);

type StencilToReact<T> = {
  [P in keyof T]?: T[P] &
    Omit<HTMLAttributes<Element>, 'className'> & {
      class?: string;
    };
};

declare global {
  export namespace JSX {
    interface IntrinsicElements extends StencilToReact<LocalJSX.IntrinsicElements> {}
  }
  // injected. only for ionic builds.
  const ENABLE_JEEPSQLITE: boolean;
}



if (ENABLE_JEEPSQLITE) {
  console.log('enabling polyfills for jeep sqlite');
  applyPolyfills().then(() => {
    jeepSqlite(window);
  });
}

const startApp = (info) => {
  import(/* webpackChunkName: "app_config" */ './state/config').then(({ CONFIG }) => {
    const store = setupStore(CONFIG);
    ReactDOM.render(<App deviceInfo={info} store={store} />, document.getElementById('root'));
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
