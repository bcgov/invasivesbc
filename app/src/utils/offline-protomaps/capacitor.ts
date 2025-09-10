import { registerPlugin } from '@capacitor/core';
import { RangeResponse, Source } from 'pmtiles';

type RequestDownloadOptions = {
  url: string;
  name: string;
  format: 'pmtiles';
  type: 'vector' | 'raster';
  metadata: string;
};

type DownloadRequestCallbackParams = {
  status: string;
};

type DownloadRequestCallbackID = string;
type DownloadRequestCallback = (message: DownloadRequestCallbackParams | null, err?: unknown) => void;
type ByteRangeRequestOptions = {
  filename: string;
  offset: number;
  length: number;
};

type OfflineMapRecord = {
  name: string;
  metadata: string;
};

interface OfflineMapsPlugin {
  byteRange(options: ByteRangeRequestOptions): Promise<{ encoded: string }>;

  requestDownload(
    options: RequestDownloadOptions,
    callback: DownloadRequestCallback
  ): Promise<DownloadRequestCallbackID>;

  listDownloads(options: Record<string, never>): Promise<{ rasters: OfflineMapRecord[]; vectors: OfflineMapRecord[] }>;

  delete(options: { type: 'vectors' | 'rasters'; name: string }): Promise<void>;
}

const OfflineMaps = registerPlugin<OfflineMapsPlugin>('OfflineMaps');

class OfflineMapsPluginPMTilesSource implements Source {
  private readonly filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  getKey(): string {
    return this.filename;
  }

  // request file chunks from capacitor plugin
  async getBytes(offset: number, length: number): Promise<RangeResponse> {
    const { encoded } = await OfflineMaps.byteRange({ filename: this.filename, offset, length });
    const decoded = atob(encoded);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    const a = bytes.buffer;
    return { data: a };
  }
}

export type { DownloadRequestCallback, DownloadRequestCallbackParams, OfflineMapRecord };
export { OfflineMapsPluginPMTilesSource };
export default OfflineMaps;
