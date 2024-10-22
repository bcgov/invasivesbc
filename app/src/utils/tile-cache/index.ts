import { base64toBuffer, lat2tile, long2tile } from 'utils/tile-cache/helpers';

// base64-encoded blank tile image 256x256 (opaque, light blue)
const FALLBACK_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEW10NBjBBbqAAAAH0lEQVRoge3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAvg0hAAABmmDh1QAAAABJRU5ErkJggg==';

// base64 encoded transparent image (for overlays)
const TRANSPARENT_FALLBACK_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAQAAAD2e2DtAAABu0lEQVR42u3SQREAAAzCsOHf9F6oIJXQS07TxQIABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAgAACwAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAAsAEAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAKg9kK0BATSHu+YAAAAASUVORK5CYII=';

export type TileData = {
  data: ArrayBufferLike;
};

export interface RepositoryBoundingBoxSpec {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

export interface RepositoryDownloadRequestSpec {
  id: string;
  description: string;
  bounds: RepositoryBoundingBoxSpec;
  maxZoom: number;
  tileURL: (x: number, y: number, z: number) => string;
}

export interface RepositoryMetadata {
  id: string;
  description: string;
  maxZoom: number;
  bounds: RepositoryBoundingBoxSpec;
  status: RepositoryStatus;
}

enum RepositoryStatus {
  DOWNLOADING = 'DOWNLOADING',
  DELETING = 'DELETING',
  READY = 'READY',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN'
}

export interface ProgressCallbackParameters {
  repository: string;
  message: string;
  aborted: boolean;
  normalizedProgress: number;
  totalTiles: number;
  processedTiles: number;
}

export interface RepositoryStatistics {
  sizeInBytes: number;
  tileCount: number;
}

abstract class TileCacheService {
  protected constructor() {}

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

  abstract getRepository(id: string): Promise<RepositoryMetadata | null>;

  abstract listRepositories(): Promise<RepositoryMetadata[]>;

  abstract deleteRepository(repository: string): Promise<void>;

  abstract setRepositoryStatus(repository: string, status: RepositoryStatus): Promise<void>;

  async download(
    spec: RepositoryDownloadRequestSpec,
    progressCallback?: (currentProgress: ProgressCallbackParameters) => void
  ): Promise<void> {
    await this.addRepository({
      id: spec.id,
      status: RepositoryStatus.DOWNLOADING,
      maxZoom: spec.maxZoom,
      bounds: spec.bounds,
      description: spec.description
    });

    const totalTiles = TileCacheService.computeTileCount(spec.bounds, spec.maxZoom);

    let abort = false;

    let processedTiles = 0;
    let lastProgressCallback: null | number = null;
    let lastProgressCallbackTimestamp: number | null = null;

    try {
      for (let z = 0; z <= spec.maxZoom && !abort; z++) {
        const startTileLat = lat2tile(spec.bounds.minLatitude, z);
        const startTileLng = long2tile(spec.bounds.minLongitude, z);

        const endTileLat = lat2tile(spec.bounds.maxLatitude, z);
        const endTileLng = long2tile(spec.bounds.maxLongitude, z);

        for (let x = Math.min(startTileLng, endTileLng); x <= Math.max(startTileLng, endTileLng) && !abort; x++) {
          for (let y = Math.min(startTileLat, endTileLat); y <= Math.max(startTileLat, endTileLat) && !abort; y++) {
            const url = spec.tileURL(x, y, z);
            const response = await fetch(url);
            const data = await response.arrayBuffer();

            await this.setTile(spec.id, z, x, y, new Uint8Array(data));
            processedTiles++;

            const currentProgress = processedTiles / totalTiles;
            // trigger a callback on the first run, on the last run, every 1%, and every 200ms
            if (
              lastProgressCallback == null ||
              lastProgressCallbackTimestamp == null ||
              currentProgress - lastProgressCallback > 0.01 ||
              processedTiles == totalTiles ||
              Date.now() - lastProgressCallbackTimestamp > 200
            ) {
              // take advantage of the periodic callback to check if we should abort (because the repo was concurrently deleted)
              const updatedRepositoryState = await this.getRepository(spec.id);
              if (updatedRepositoryState == null || updatedRepositoryState.status == RepositoryStatus.DELETING) {
                abort = true;
              }

              lastProgressCallback = currentProgress;
              lastProgressCallbackTimestamp = Date.now();

              if (progressCallback) {
                progressCallback({
                  repository: spec.id,
                  message: abort ? `Aborting` : `Zoom ${z}/${spec.maxZoom}, ${processedTiles}/${totalTiles} Tiles`,
                  aborted: abort,
                  normalizedProgress: processedTiles / totalTiles,
                  processedTiles,
                  totalTiles
                });
              }
            }
          }
        }
      }
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

  protected abstract cleanupOrphanTiles(): Promise<void>;

  protected abstract addRepository(spec: RepositoryMetadata): Promise<void>;
}

export { TileCacheService, FALLBACK_IMAGE, RepositoryStatus };
