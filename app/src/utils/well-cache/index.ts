import { nanoid } from '@reduxjs/toolkit';
import { Feature } from '@turf/helpers';
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
}

export interface IWellRepositoryDownloadRequestSpec {
  bounds: RepositoryBoundingBoxSpec;
  API_BASE: string;
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

  /**
   * @desc Given a list of well Ids, delete wells in IndexDB.
   * @param { number[] } wellTagNumbers Wells to be deleted
   */
  protected abstract deleteWellsFromIds(wellTagNumbers: number[]): Promise<void>;

  /**
   * @desc Save array of wells to storage
   * @param {WellData[]} wellList Collection of Well Data
   * @param progressCallback
   */
  protected abstract saveWells(
    wellList: Record<PropertyKey, any>[],
    progressCallback?: ((currentProgress: IWellCacheProgressCallbackParameters) => void) | undefined
  ): Promise<void>;

  /**
   * @desc Save one well to local Database
   * @param { WellData } wellData information pertaining to a well
   */
  protected abstract saveWell(wellData: WellData): Promise<void>;
  /**
   * @desc Given a bounding box, download a set of Well Records
   * @param spec Details needed for download
   * @param progressCallback Optional callback function for displaying progress updates in cache process
   */
  public async download(
    spec: IWellRepositoryDownloadRequestSpec,
    progressCallback?: ((currentProgress: IWellCacheProgressCallbackParameters) => void) | undefined
  ): Promise<void> {
    const WELL_WFS_LAYER = 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW';
    const url = encodeURIComponent(buildURLForDataBC(WELL_WFS_LAYER, bboxToPolygon(spec.bounds), true));
    const response = await (await fetch(`${spec.API_BASE}/api/map-shaper?url=${url}&percentage=0.02`)).json();
    const wellTagNumbers: number[] = response.result.features.map((well: WellData) => well.properties.WELL_TAG_NUMBER);
    const id = `well-records-${nanoid()}`;

    console.log('Bounds', bboxToPolygon(spec.bounds));
    await this.addOrUpdateRepository({
      bounds: spec.bounds,
      id: id,
      status: WellRepositoryStatus.DOWNLOADING,
      wellTagNumbers: wellTagNumbers
    });

    await this.saveWells(response.result.features, progressCallback);
    await this.setRepositoryStatus(id, WellRepositoryStatus.CACHED);
  }

  static async getInstance(): Promise<WellCacheService> {
    throw new Error('unimplemented in abstract base class');
  }

  protected constructor() {
    super();
  }
}

export { WellCacheService };
