import { createRoot } from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { Router } from 'react-router-dom';
import setupStore, { historySingleton } from 'state/store';
import { Provider } from 'react-redux';
import App from 'UI/App';
import { TileCacheService } from 'utils/tile-cache';
import { PersistorContext } from 'utils/PersistorContext';
import { createContext } from 'react';
import { RecordCacheService } from 'utils/record-cache';
import { Store } from 'redux';
import { UnifiedConfig } from 'state/configuration/unified-config';

type StartupContext = {
  tileService?: TileCacheService;
  recordService?: RecordCacheService;
};

const StartupContext = createContext<StartupContext>({});

type StartupTaskParameters = {
  CONFIG: UnifiedConfig;
  store: Store;
};

type StartupTask = {
  name: string;
  run: (parameters: StartupTaskParameters) => Promise<Partial<StartupContext> | void | undefined>;
};

const LOAD_TILE_CACHES: StartupTask = {
  name: 'Load Tile Caches',
  run: async ({ CONFIG }) => {
    if (CONFIG.build.MOBILE && CONFIG.features.CACHE_TILES.enabled) {
      const tileCache = await TileCacheServiceFactory.getPlatformInstance();
      return { tileService: tileCache };
    }
  }
};

const LOAD_RECORDSET_CACHES: StartupTask = {
  name: 'Load Recordset Caches',
  run: async ({ CONFIG }) => {
    if (CONFIG.build.MOBILE && CONFIG.features.CACHE_RECORDSETS.enabled) {
      await RecordCacheService.getInstance();
    }
  }
};

async function StartupCoordinator() {
  const { constructUnifiedConfig } = await import('state/configuration/unified-config');
  const unifiedConfig = await constructUnifiedConfig();

  const { store, persistor } = setupStore(unifiedConfig);

  const tasks: StartupTask[] = [LOAD_TILE_CACHES, LOAD_RECORDSET_CACHES];

  let providedContext: StartupContext = {};

  for (const task of tasks) {
    const result = await task.run({ CONFIG: unifiedConfig, store });

    if (result) {
      providedContext = { ...providedContext, ...result };
    }
  }

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
