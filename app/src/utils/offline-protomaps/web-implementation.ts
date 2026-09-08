import { WebPlugin } from '@capacitor/core';
import localForage from 'localforage';
import {
  ByteRangeRequestOptions,
  DownloadRequestCallback,
  DownloadRequestCallbackID,
  OfflineMapRecord,
  OfflineMapsPlugin,
  RequestDownloadOptions
} from 'utils/offline-protomaps/capacitor';
import { SavedProtomapDefinition } from 'state/reducers/protomaps';

/* web implementation of the plugin used for testing locally without ios */

const CURRENT_VERSION = 4; //increment to reset

export class OfflineMapsPluginWebImplementation extends WebPlugin implements OfflineMapsPlugin {
  private store: LocalForage;
  private URLLookupCache: Map<string, string> = new Map();

  constructor() {
    super();

    this.store = localForage.createInstance({
      name: 'capacitor-offline-protomaps',
      storeName: 'capacitor-offline-protomaps',
      version: 1
    });

    this.store.getItem('version').then(async (version) => {
      if (version == null || (typeof version == 'number' && version < CURRENT_VERSION)) {
        console.warn('Clearing old plugin data on version upgrade');
        await this.store.clear();
      }
      await this.store.setItem('version', CURRENT_VERSION);
    });
  }

  async byteRange(options: ByteRangeRequestOptions): Promise<{ encoded: string }> {
    // unlike the ios plugin, this doesn't download anything. we need to look up the url in the object first

    let url: string | undefined = undefined;
    if (this.URLLookupCache.has(options.filename)) {
      url = this.URLLookupCache.get(options.filename);
    } else {
      const matches = /(vectors|rasters)\/(.*?)\.pmtiles/g.exec(options.filename);
      if (!matches || matches.length != 3) {
        throw new Error(`unexpected filename ${options.filename}`);
      }

      const { vectors, rasters } = await this.listDownloads({});
      let foundRecord: OfflineMapRecord | undefined = undefined;
      if (matches[1] === 'vectors') {
        foundRecord = vectors.find((f) => f.name == matches[2]);
      } else if (matches[1] === 'rasters') {
        foundRecord = rasters.find((f) => f.name == matches[2]);
      }
      if (!foundRecord) {
        throw new Error(`No matching record, cannot determine URL for ${options.filename}`);
      }
      const def = JSON.parse(foundRecord.metadata) as SavedProtomapDefinition;
      url = def.generationRecord.download_link;
      this.URLLookupCache.set(options.filename, url);
    }

    if (!url) {
      throw new Error('Could not determine URL');
    }

    // not pretty, but we want to do it the same way IOS does
    const response = await fetch(url, {
      headers: {
        Range: `bytes=${options.offset}-${options.offset + options.length}`
      }
    });

    const buffer = await response.arrayBuffer();

    return { encoded: new Uint8Array(buffer).toBase64() };
  }

  async delete(options: { type: 'vectors' | 'rasters'; name: string }): Promise<void> {
    const rasters = ((await this.store.getItem('rasters')) as unknown as OfflineMapRecord[]) || [];
    const vectors = ((await this.store.getItem('vectors')) as unknown as OfflineMapRecord[]) || [];

    switch (options.type) {
      case 'rasters':
        rasters.splice(
          rasters.findIndex((f) => f.name === options.name),
          1
        );
        break;
      case 'vectors':
        vectors.splice(
          vectors.findIndex((f) => f.name === options.name),
          1
        );
        break;
    }

    await this.store.setItem('rasters', rasters);
    await this.store.setItem('vectors', vectors);
  }

  async listDownloads(_: Record<string, never>): Promise<{ rasters: OfflineMapRecord[]; vectors: OfflineMapRecord[] }> {
    return {
      rasters: ((await this.store.getItem('rasters')) as unknown as OfflineMapRecord[]) || [],
      vectors: ((await this.store.getItem('vectors')) as unknown as OfflineMapRecord[]) || []
    };
  }

  async requestDownload(
    options: RequestDownloadOptions,
    callback: DownloadRequestCallback
  ): Promise<DownloadRequestCallbackID> {
    const rasters = ((await this.store.getItem('rasters')) as unknown as OfflineMapRecord[]) || [];
    const vectors = ((await this.store.getItem('vectors')) as unknown as OfflineMapRecord[]) || [];

    switch (options.type) {
      case 'raster':
        rasters.push({ name: options.name, metadata: options.metadata });
        break;
      case 'vector':
        vectors.push({ name: options.name, metadata: options.metadata });
        break;
    }

    await this.store.setItem('rasters', rasters);
    await this.store.setItem('vectors', vectors);

    callback({ status: 'downloading', percent: 10.5 });

    // arbitrary delays to simulate a real device

    await (async () => {
      return new Promise((resolve) => setTimeout(resolve, 1000));
    })();

    callback({ status: 'downloading', percent: 84.1 });

    await (async () => {
      return new Promise((resolve) => setTimeout(resolve, 1000));
    })();

    callback({ status: 'success' });

    return 'n/a';
  }
}
