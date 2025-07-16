import { Feature } from 'geojson';
import BaseCacheService from 'utils/base-classes/BaseCacheService';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';

/**
 *
 * @summary Plan My Trip metadata values
 * @property { RepositoryBoundingBoxSpec } bbox Bounds of initial shape
 * @property { Feature } geojson Original Drawn shape to create trip
 * @property { string } id Primary key of trip
 * @property { cacheStatuses } cacheStatuses Status of all caches linked to a Trip
 * @property { string } name Name of trip e.g. "Kamloops"
 */
interface IPlanMyTripRepositoryMetadata {
  bbox: RepositoryBoundingBoxSpec;
  geojson: Feature;
  id: string;
  name: string;
  cacheStatuses: IPlanMyTripCacheStatuses;
}

interface IPlanMyTripCacheStatuses {
  mapTiles: IPlanMyTripCacheStatus;
  wmsLayer: IPlanMyTripCacheStatus;
  activityRecordset: IPlanMyTripCacheStatus;
  iappRecordset: IPlanMyTripCacheStatus;
}

interface IPlanMyTripCacheDownloadSpec {
  id: string;
  geojson: Feature;
  cacheStatuses: Partial<IPlanMyTripCacheStatuses>;
  name: string;
  zoomLevel?: number;
}

interface IPlanMyTripCacheProgressCallbackParameters {
  id: string;
  update: Partial<IPlanMyTripCacheStatuses>;
}

enum IPlanMyTripCacheStatus {
  CACHED,
  IN_PROGRESS,
  NOT_CACHED,
  UNAVAILABLE
}

abstract class PlanMyTripCacheService extends BaseCacheService<
  IPlanMyTripRepositoryMetadata,
  IPlanMyTripCacheDownloadSpec,
  IPlanMyTripCacheProgressCallbackParameters,
  IPlanMyTripCacheStatus
> {
  public static TRIP_PREFIX = 'pmt-';
  protected CACHE_UNAVAILABLE = 'Plan My Trip Cache Unavailable';

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<PlanMyTripCacheService> {
    throw new Error('unimplemented in abstract base class');
  }

  protected abstract addOrUpdateRepository(spec: IPlanMyTripRepositoryMetadata): Promise<void>;
}

export { PlanMyTripCacheService };
export type {
  IPlanMyTripRepositoryMetadata,
  IPlanMyTripCacheDownloadSpec,
  IPlanMyTripCacheProgressCallbackParameters,
  IPlanMyTripCacheStatus
};
