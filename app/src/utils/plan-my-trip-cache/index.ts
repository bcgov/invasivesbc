import { GeoJSON } from 'geojson';

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
  geojson: GeoJSON;
  id: string;
  name: string;
  cacheStatuses: IPlanMyTripCacheStatuses;
}

interface IPlanMyTripCacheStatuses {
  mapTiles: IPlanMyTripCacheStatus;
  wmsLayer: IPlanMyTripCacheStatus;
  wellData: IPlanMyTripCacheStatus;
  activityRecordset: IPlanMyTripCacheStatus;
  iappRecordset: IPlanMyTripCacheStatus;
}

interface IPlanMyTripCacheDownloadSpec {
  id: string;
  geojson: GeoJSON;
  cacheStatuses: Partial<IPlanMyTripCacheStatuses>;
  name: string;
  zoomLevel?: number;
}

interface IPlanMyTripCacheProgressCallbackParameters {
  id: string;
  update: Partial<IPlanMyTripCacheStatuses>;
}

enum IPlanMyTripCacheStatus {
  CACHED = 'CACHED',
  IN_PROGRESS = 'IN PROGRESS',
  DELETING = 'DELETING',
  NOT_CACHED = 'NOT CACHED',
  UNAVAILABLE = 'UNAVAILABLE',
  FAILED = 'FAILED'
}
/**
 * @desc Plan My Trip is the umbrella category representing a set of different caches.
 *       Keeping track of all data for a specific drawn region. It keeps track of the sub caches for a consistent look and feel under one moniker/shape
 *              [ Plan My Trip ]
 *                      |
 *     ---------------------------------------
 *     |            |             |          |
 * [ Records ]  [ Map Tiles ]  [ Wells ]  [Misc.]
 *
 */
abstract class PlanMyTripCacheService {
  public static readonly TRIP_PREFIX = 'pmt-';
  protected CACHE_UNAVAILABLE = 'Plan My Trip Cache Unavailable';

  public abstract getRepository(repositoryId: string): Promise<IPlanMyTripRepositoryMetadata | null>;
  public abstract listRepositories(): Promise<IPlanMyTripRepositoryMetadata[]>;
  public abstract deleteRepository(repositoryId: string): Promise<void>;

  public async download(spec: IPlanMyTripCacheDownloadSpec, _?: undefined): Promise<void> {
    const newRepo: IPlanMyTripRepositoryMetadata = {
      id: spec.id,
      geojson: spec.geojson,
      name: spec.name,
      cacheStatuses: {
        mapTiles: spec.cacheStatuses?.mapTiles ?? IPlanMyTripCacheStatus.NOT_CACHED,
        wmsLayer: spec.cacheStatuses?.wmsLayer ?? IPlanMyTripCacheStatus.NOT_CACHED,
        activityRecordset: spec.cacheStatuses?.activityRecordset ?? IPlanMyTripCacheStatus.NOT_CACHED,
        iappRecordset: spec.cacheStatuses?.iappRecordset ?? IPlanMyTripCacheStatus.NOT_CACHED,
        wellData: spec.cacheStatuses?.wellData ?? IPlanMyTripCacheStatus.NOT_CACHED
      }
    };
    await this.addOrUpdateRepository(newRepo);
  }

  /**
   * @desc Update the status of a trip dataset
   * @param repositoryId ID of Trip
   * @param {keyof IPlanMyTripCacheStatuses } type Type of cache e.g.: Map, Recordset
   * @param { IPlanMyTripCacheStatus } newStatus New State for Cache
   */
  abstract updateSubCacheStatus(
    repositoryId: string,
    type: keyof IPlanMyTripCacheStatuses,
    newStatus: IPlanMyTripCacheStatus
  ): Promise<void>;

  static async getInstance(): Promise<PlanMyTripCacheService> {
    throw new Error('unimplemented in abstract base class');
  }

  protected abstract addOrUpdateRepository(spec: IPlanMyTripRepositoryMetadata): Promise<void>;
}

export { IPlanMyTripCacheStatus, PlanMyTripCacheService };
export type {
  IPlanMyTripRepositoryMetadata,
  IPlanMyTripCacheDownloadSpec,
  IPlanMyTripCacheProgressCallbackParameters,
  IPlanMyTripCacheStatuses
};
