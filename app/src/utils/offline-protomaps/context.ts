import { LocalForageOfflineProtomapsService } from './localforage-service';
import { OfflineProtomapsService } from '.';

class OfflineProtomapsServiceFactory {
  static async getPlatformInstance(): Promise<OfflineProtomapsService> {
    return LocalForageOfflineProtomapsService.getInstance();
  }
}

export { OfflineProtomapsServiceFactory };
