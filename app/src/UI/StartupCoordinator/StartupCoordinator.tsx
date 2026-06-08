import { createRoot } from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router';
import setupStore from 'state/store';
import { Provider } from 'react-redux';
import App from 'UI/App';
import { PersistorContext } from 'utils/PersistorContext';
import { createContext } from 'react';
import { RecordCacheService } from 'utils/record-cache';
import { Store } from 'redux';
import { UnifiedConfig } from 'state/configuration/unified-config';
import { LOAD_RECORDSET_CACHES } from 'UI/StartupCoordinator/Tasks/RecordsetCache';
import { OfflineProtomapsService } from 'utils/offline-protomaps';
import { LOAD_OFFLINE_PROTOMAPS } from 'UI/StartupCoordinator/Tasks/OfflineProtomapsService';

type StartupContext = {
  recordService?: RecordCacheService;
  offlineProtomapsService?: OfflineProtomapsService;
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

async function StartupCoordinator() {
  const { constructUnifiedConfig } = await import('state/configuration/unified-config');
  const unifiedConfig = await constructUnifiedConfig();

  const { store, persistor } = setupStore(unifiedConfig);

  const tasks: StartupTask[] = [LOAD_RECORDSET_CACHES, LOAD_OFFLINE_PROTOMAPS];

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
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <PersistorContext.Provider value={persistor}>
              <BrowserRouter>
                <StartupContext.Provider value={providedContext}>
                  <App />
                </StartupContext.Provider>
              </BrowserRouter>
            </PersistorContext.Provider>
          </PersistGate>
        </Provider>
      );
    }
  }
}

export { StartupCoordinator, StartupContext };
export type { StartupTask, StartupTaskParameters };
