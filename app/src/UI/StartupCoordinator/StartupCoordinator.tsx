import { createRoot } from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { Router } from 'react-router-dom';
import setupStore, { historySingleton } from 'state/store';
import { Provider } from 'react-redux';
import App from 'UI/App';
import { TileCacheService } from '../../utils/tile-cache';
import { PersistorContext } from 'utils/PersistorContext';
import { createContext } from 'react';
import { RecordCacheService } from '../../utils/record-cache';

type FeatureFlag = {
  name: string;
  enabled: boolean;
};

type StartupContext = {
  tileService?: TileCacheService;
  recordService?: RecordCacheService;
};

const StartupContext = createContext<StartupContext>({});

type StartupTask = {
  name: string;
  run: ({ CONFIG, store }: { CONFIG; store }) => Promise<Partial<StartupContext> | undefined>;
};

const LOAD_TILE_CACHES: StartupTask = {
  name: 'Load Tile Caches',
  run: async ({ CONFIG }) => {
    if (CONFIG.MOBILE) {
      const tileCache = await TileCacheServiceFactory.getPlatformInstance();
      return { tileService: tileCache };
    }
  }
};

async function StartupCoordinator() {
  const { CONFIG } = await import('../../state/config');

  const { store, persistor } = setupStore(CONFIG);

  const tasks: StartupTask[] = [LOAD_TILE_CACHES];

  let providedContext: StartupContext = {};

  for (const task of tasks) {
    console.debug(`Running Startup Task: ${task.name}`);
    const result = await task.run({ CONFIG, store });

    if (result) {
      providedContext = { ...providedContext, ...result };
    }
  }


  console.dir(providedContext);

  const container = document.getElementById('root');

  if (container) {
    const root = createRoot(container);
    if (root) {
      root.render(
        <PersistGate loading={null} persistor={persistor}>
          <PersistorContext.Provider value={persistor}>
            <Router history={historySingleton}>
              <Provider store={store}>
                <StartupContext.Provider value={providedContext}>
                  <App />
                </StartupContext.Provider>
              </Provider>
            </Router>
          </PersistorContext.Provider>
        </PersistGate>
      );
    }
  }
}

export { StartupCoordinator, StartupContext };
