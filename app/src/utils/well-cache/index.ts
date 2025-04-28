import booleanIntersects from '@turf/boolean-intersects';
import { Feature, FeatureCollection } from '@turf/helpers';
import WellData from 'interfaces/WellData';
import BaseCacheService from 'utils/base-classes/BaseCacheService';
import bboxToPolygon from 'utils/bboxToPolygon';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import { buildURLForDataBC } from 'utils/WFSConsumer';

export interface IWellRepositoryMetadata {
  id: string;
  status: WellRepositoryStatus;
  bounds: RepositoryBoundingBoxSpec;
  wellTagNumbers: number[];
  cachedGeoJson?: FeatureCollection;
}

export interface IWellRepositoryDownloadRequestSpec {
  API_BASE: string;
  bounds: RepositoryBoundingBoxSpec;
  id: string;
}

export interface IWellCacheProgressCallbackParameters {
  repository: string;
  message: string;
  aborted: boolean;
  normalizedProgress: number;
  totalTiles: number;
  processedTiles: number;
}

export enum WellRepositoryStatus {
  CACHED,
  DELETING,
  DOWNLOADING,
  ERROR,
  NOT_CACHED
}

export interface ICachedWellData {
  id: string;
  geometry: Feature;
}

abstract class WellCacheService extends BaseCacheService<
  IWellRepositoryMetadata,
  IWellRepositoryDownloadRequestSpec,
  IWellCacheProgressCallbackParameters,
  WellRepositoryStatus
> {
  protected CACHE_UNAVAILABLE = 'Cache not available';

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<WellCacheService> {
    throw new Error('unimplemented in abstract class');
  }

  /**
   * @desc Given a list of well Ids, delete wells in local db.
   * @param { number[] } wellTagNumbers Wells to be deleted
   */
  protected abstract deleteWellsFromIds(wellTagNumbers: number[]): Promise<void>;

  public abstract getRepository(repository: string | RepositoryBoundingBoxSpec): Promise<IWellRepositoryMetadata>;

  /**
   * @desc Create GeoJson Data for a a repository used in quick lookups
   * @param { string | RepositoryBoundingBoxSpec } repository Target Repo
   */
  protected abstract createFeatureCollectionFromMetadata(
    repository: string | RepositoryBoundingBoxSpec
  ): Promise<FeatureCollection>;

  /**
   * @desc Save array of wells to local database
   * @param {WellData[]} wellList Collection of Well Data
   * @param progressCallback
   */
  protected abstract saveWells(
    wellList: WellData[],
    progressCallback?: ((currentProgress: IWellCacheProgressCallbackParameters) => void) | undefined
  ): Promise<void>;

  /**
   * @desc Save one well to local Database
   * @param { WellData } wellData information pertaining to a well
   */
  protected abstract saveWell(wellData: WellData): Promise<void>;

  /**
   * @desc Given a bounding box, download a set of Well Records
   * @param spec Repository details
   * @param progressCallback Optional callback function for displaying progress updates in cache process
   */
  public async download(
    spec: IWellRepositoryDownloadRequestSpec,
    progressCallback?: ((currentProgress: IWellCacheProgressCallbackParameters) => void) | undefined
  ): Promise<void> {
    const WELL_WFS_LAYER = 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW';
    const url = encodeURIComponent(buildURLForDataBC(WELL_WFS_LAYER, bboxToPolygon(spec.bounds), true));
    const response = await (await fetch(`${spec.API_BASE}/api/map-shaper?url=${url}&percentage=0.02`)).json();
    const wellTagNumbers: number[] =
      response?.result?.features?.map((well: WellData) => well.properties.WELL_TAG_NUMBER) ?? [];
    const uncachedWellTags = await this.removeDuplicateWellsFromIdList(wellTagNumbers, spec.bounds);
    const wellsToCache = response.result.features.filter((well) =>
      uncachedWellTags.includes(well.properties.WELL_TAG_NUMBER)
    );

    await this.addOrUpdateRepository({
      bounds: spec.bounds,
      id: spec.id,
      status: WellRepositoryStatus.DOWNLOADING,
      wellTagNumbers: wellTagNumbers
    });

    await this.saveWells(wellsToCache, progressCallback);
    const featureCollection = await this.createFeatureCollectionFromMetadata(spec.id);
    await this.addOrUpdateRepository({
      bounds: spec.bounds,
      id: spec.id,
      status: WellRepositoryStatus.CACHED,
      wellTagNumbers: wellTagNumbers,
      cachedGeoJson: featureCollection
    });
  }

  /**
   * @desc Return list of wells contained by shape
   * @param geom Geometry to check for containing shapes
   * @returns {Feature[]} Wells in area
   */
  public abstract getNearbyWells(geom: Feature): Promise<Feature[]>;

  /**
   * @desc Find all well Ids already cached and remove them from list
   *       Checks repositories that overlap with the new repo.
   * @param wellTagNumbers List of wells in new repository.
   * @param bounds Bounding box of new repository.
   * @returns { number[] } List of WellTagNumbers not contained by other repositories
   */
  private async removeDuplicateWellsFromIdList(
    wellTagNumbers: number[],
    bounds: RepositoryBoundingBoxSpec
  ): Promise<number[]> {
    const boundsShape = bboxToPolygon(bounds);
    const containedRepos = await this.getOverlappingRepositories(boundsShape);
    const frequencyMap: Record<number, number> = {};
    containedRepos
      .flatMap((repo) => repo.wellTagNumbers)
      .forEach((wtn) => {
        frequencyMap[wtn] ??= 0;
        frequencyMap[wtn]++;
      });
    return wellTagNumbers.filter((wtn) => !frequencyMap?.[wtn]);
  }

  /**
   * @desc Get repositories filtered to a geographic area
   * @param geom Area of target
   * @returns Repositories overlapping with target area
   */
  public async getOverlappingRepositories(geom: Feature): Promise<IWellRepositoryMetadata[]> {
    const repositories = await this.listRepositories();
    return repositories.filter((r) => r.cachedGeoJson && booleanIntersects(bboxToPolygon(r.bounds), geom));
  }
}

export { WellCacheService };
