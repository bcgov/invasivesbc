import localForage from 'localforage';
import { OfflineProtomapsService } from '.';

class LocalForageOfflineProtomapsService extends OfflineProtomapsService {
  private static _instance: LocalForageOfflineProtomapsService;
  private store: LocalForage | null = null;

  static async getInstance(): Promise<LocalForageOfflineProtomapsService> {
    if (LocalForageOfflineProtomapsService._instance == null) {
      LocalForageOfflineProtomapsService._instance = new LocalForageOfflineProtomapsService();
      await LocalForageOfflineProtomapsService._instance.initializeCache();
    }
    return LocalForageOfflineProtomapsService._instance;
  }

  private async initializeCache() {
    this.store = localForage.createInstance({
      name: 'offline-protomaps',
      storeName: 'offline-protomaps',
      version: 1
    });
  }
}

export { LocalForageOfflineProtomapsService };
