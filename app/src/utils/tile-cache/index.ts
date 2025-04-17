import BaseCacheService from 'utils/base-classes/BaseCacheService';
import { base64toBuffer, lat2tile, long2tile } from 'utils/tile-cache/helpers';

// base64-encoded blank tile image 256x256 (opaque, light blue)
const FALLBACK_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEW10NBjBBbqAAAAH0lEQVRoge3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAvg0hAAABmmDh1QAAAABJRU5ErkJggg==';

// base64 encoded transparent image with diagonal stripe (for overlays)
const DIAGONAL_STRIPE_FALLBACK_IMAGE =
  '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';

// base64 encoded transparent image (for overlays)
const TRANSPARENT_FALLBACK_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAQAAAD2e2DtAAABu0lEQVR42u3SQREAAAzCsOHf9F6oIJXQS07TxQIABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAgAACwAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAAsAEAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAKg9kK0BATSHu+YAAAAASUVORK5CYII=';

type TileData = {
  data: ArrayBufferLike;
};

interface RepositoryBoundingBoxSpec {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

interface RepositoryDownloadRequestSpec {
  id: string;
  description: string;
  bounds: RepositoryBoundingBoxSpec;
  maxZoom: number;
  tileURL: (x: number, y: number, z: number) => string;
}

interface RepositoryMetadata {
  id: string;
  description: string;
  maxZoom: number;
  bounds: RepositoryBoundingBoxSpec;
  status: RepositoryStatus;
}

enum RepositoryStatus {
  DOWNLOADING = 'DOWNLOADING',
  DELETING = 'DELETING',
  FAILED = 'FAILED',
  READY = 'READY',
  QUEUED = 'QUEUED',
  UNKNOWN = 'UNKNOWN'
}

interface TilePromise {
  id: string;
  url: string;
  x: number;
  y: number;
  z: number;
}

interface TileCacheProgressCallbackParameters {
  aborted: boolean;
  description?: string;
  message: string;
  normalizedProgress: number;
  processedTiles: number;
  repository: string;
  totalTiles: number;
}

interface RepositoryStatistics {
  sizeInBytes: number;
  tileCount: number;
}

abstract class TileCacheService extends BaseCacheService<
  RepositoryMetadata,
  RepositoryDownloadRequestSpec,
  TileCacheProgressCallbackParameters,
  RepositoryStatus
> {
  CONCURRENCY_LIMIT = 5; // Throttle for Mobile launches, boost for development.
  protected constructor() {
    super();
  }

  static generateFallbackTile(): TileData {
    return {
      data: base64toBuffer(FALLBACK_IMAGE)
    };
  }

  static generateTransparentFallbackTile(): TileData {
    return {
      data: base64toBuffer(TRANSPARENT_FALLBACK_IMAGE)
    };
  }

  static generateStripedFallbackTile(): TileData {
    return {
      data: base64toBuffer(DIAGONAL_STRIPE_FALLBACK_IMAGE)
    };
  }

  static async getInstance(): Promise<TileCacheService> {
    throw new Error('unimplemented in abstract base class');
  }

  static computeTileCount(bounds: RepositoryBoundingBoxSpec, maxZoom: number) {
    let totalTiles = 0;

    for (let z = 0; z <= maxZoom; z++) {
      const startTileLat = lat2tile(bounds.minLatitude, z);
      const startTileLng = long2tile(bounds.minLongitude, z);

      const endTileLat = lat2tile(bounds.maxLatitude, z);
      const endTileLng = long2tile(bounds.maxLongitude, z);

      const xCount = 1 + Math.max(startTileLng, endTileLng) - Math.min(startTileLng, endTileLng);
      const yCount = 1 + Math.max(startTileLat, endTileLat) - Math.min(startTileLat, endTileLat);

      totalTiles += yCount * xCount;
    }

    return totalTiles;
  }

  abstract getTile(repository: string, z: number, x: number, y: number): Promise<TileData>;

  abstract setTile(repository: string, z: number, x: number, y: number, tileData: Uint8Array): Promise<void>;

  async download(
    spec: RepositoryDownloadRequestSpec,
    progressCallback?: (currentProgress: TileCacheProgressCallbackParameters) => void
  ): Promise<void> {
    const totalTiles = TileCacheService.computeTileCount(spec.bounds, spec.maxZoom);
    let abort = false;
    let processedTiles = 0;
    let lastProgressCallback: null | number = null;
    let lastProgressCallbackTimestamp: number | null = null;
    const tileUrls: TilePromise[] = [];
    const executing = new Set<Promise<void>>();

    try {
      await this.addOrUpdateRepository({
        id: spec.id,
        status: RepositoryStatus.DOWNLOADING,
        maxZoom: spec.maxZoom,
        bounds: spec.bounds,
        description: spec.description
      });

      for (let z = 0; z <= spec.maxZoom && !abort; z++) {
        const startTileLat = lat2tile(spec.bounds.minLatitude, z);
        const startTileLng = long2tile(spec.bounds.minLongitude, z);
        const endTileLat = lat2tile(spec.bounds.maxLatitude, z);
        const endTileLng = long2tile(spec.bounds.maxLongitude, z);

        for (let x = Math.min(startTileLng, endTileLng); x <= Math.max(startTileLng, endTileLng) && !abort; x++) {
          for (let y = Math.min(startTileLat, endTileLat); y <= Math.max(startTileLat, endTileLat) && !abort; y++) {
            tileUrls.push({ id: spec.id, url: spec.tileURL(x, y, z), x, y, z });
          }
        }
      }
      const promises = tileUrls.map((config) => () => this.downloadTile(config));

      for (let i = 0; i < promises.length && !abort; i++) {
        if (executing.size >= this.CONCURRENCY_LIMIT) {
          await Promise.race(executing);
        }

        this.processNext(executing, promises[i]);
        processedTiles++;
        const currentProgress = processedTiles / totalTiles;
        const currTime = Date.now();

        // trigger a callback on the first run, on the last run, every 1%, and every 200ms
        if (
          lastProgressCallback == null ||
          lastProgressCallbackTimestamp == null ||
          currentProgress - lastProgressCallback > 0.01 ||
          processedTiles == totalTiles ||
          currTime - lastProgressCallbackTimestamp > 500
        ) {
          // take advantage of the periodic callback to check if we should abort (because the repo was concurrently deleted)
          const updatedRepositoryState = await this.getRepository(spec.id);
          if (updatedRepositoryState == null || updatedRepositoryState.status == RepositoryStatus.DELETING) {
            abort = true;
          }

          lastProgressCallback = currentProgress;
          lastProgressCallbackTimestamp = currTime;

          if (progressCallback) {
            progressCallback({
              repository: spec.id,
              description: spec.description,
              message: abort ? `Aborting` : `${processedTiles.toLocaleString()}/${totalTiles.toLocaleString()} Tiles`,
              aborted: abort,
              normalizedProgress: processedTiles / totalTiles,
              processedTiles,
              totalTiles
            });
          }
        }
      }

      await Promise.all(executing);
      await this.setRepositoryStatus(spec.id, RepositoryStatus.READY);
    } catch (e) {
      try {
        console.error(e);
        await this.setRepositoryStatus(spec.id, RepositoryStatus.FAILED);
      } catch (e) {
        console.error('could not set repository status when handling error', e);
        throw e;
      }
    }
    if (abort) {
      await this.cleanupOrphanTiles();
    }
  }

  public abstract getRepositoryStatistics(id: string): Promise<RepositoryStatistics>;

  public abstract updateDescription(repository: string, newDescription: string): Promise<void>;

  protected abstract addOrUpdateRepository(spec: RepositoryMetadata): Promise<void>;

  protected abstract cleanupOrphanTiles(): Promise<void>;

  private async downloadTile(tileDetails: TilePromise): Promise<void> {
    const { id, url, x, y, z } = tileDetails;
    const responseData = await fetch(url).then(async (r) => await r.arrayBuffer());
    await this.setTile(id, z, x, y, new Uint8Array(responseData));
  }
}

export { TileCacheService, FALLBACK_IMAGE, RepositoryStatus };
export type {
  TileData,
  RepositoryMetadata,
  RepositoryDownloadRequestSpec,
  RepositoryBoundingBoxSpec,
  RepositoryStatistics,
  TileCacheProgressCallbackParameters
};
