import { FeatureCollection } from '@turf/helpers';
import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import {
  IWellCacheProgressCallbackParameters,
  IWellRepositoryMetadata,
  WellCacheService,
  WellRepositoryStatus
} from '.';
import WellData from 'interfaces/WellData';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import { sqlite } from 'utils/sharedSQLiteInstance';
import MIGRATIONS from './migrations';

class SQLiteWellCacheService extends WellCacheService {
  private readonly CACHE_DB_NAME = 'well_cache.db';
  private readonly BATCH_AMOUNT = 100;
  private static _instance: SQLiteWellCacheService;

  private cacheDB: SQLiteDBConnection | null = null;

  protected constructor() {
    super();
  }

  static override async getInstance(): Promise<SQLiteWellCacheService> {
    if (SQLiteWellCacheService._instance == null) {
      SQLiteWellCacheService._instance = new SQLiteWellCacheService();
      await SQLiteWellCacheService._instance.initializeRecordCache(sqlite);
    }
    return SQLiteWellCacheService._instance;
  }

  protected async addOrUpdateRepository(repository: IWellRepositoryMetadata): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const { id, status, bounds, wellTagNumbers, cachedGeoJson } = repository;
    const wtns = JSON.stringify(wellTagNumbers);
    const bnds = JSON.stringify(
      bounds,
      Object.keys(bounds).sort((a, b) => (a < b ? -1 : 1))
    );

    if (cachedGeoJson) {
      const geojsn = JSON.stringify(cachedGeoJson);
      await this.cacheDB.query(
        //language=SQLite
        `INSERT INTO CACHE_METADATA(ID, BOUNDS, STATUS, WELL_TAG_NUMBERS, GEOJSON)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(ID)
           DO UPDATE SET STATUS           = excluded.STATUS,
                         WELL_TAG_NUMBERS = excluded.WELL_TAG_NUMBERS,
                         GEOJSON          = excluded.GEOJSON`,
        [id, bnds, status, wtns, geojsn]
      );
    } else {
      await this.cacheDB.query(
        //language=SQLite
        `INSERT INTO CACHE_METADATA(ID, BOUNDS, STATUS, WELL_TAG_NUMBERS)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(ID)
           DO UPDATE SET STATUS           = excluded.STATUS,
                         WELL_TAG_NUMBERS = excluded.WELL_TAG_NUMBERS`,
        [id, bnds, status, wtns]
      );
    }
  }

  protected async createFeatureCollectionFromMetadata(
    repository: string | RepositoryBoundingBoxSpec
  ): Promise<FeatureCollection> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const features: string[][] = [];
    const { wellTagNumbers } = await this.getRepository(repository);
    for (let i = 0; i < wellTagNumbers.length; i += this.BATCH_AMOUNT) {
      const sliced = wellTagNumbers.slice(i, Math.min(i + this.BATCH_AMOUNT, wellTagNumbers.length));
      const geometry: string[] =
        (
          await this.cacheDB.query(
            //language=SQLite
            `SELECT GEOM
             FROM CACHED_WELLS
             WHERE ID IN (${sliced.map((_) => '?').join(', ')})`,
            [...sliced]
          )
        ).values ?? [];

      features.push(geometry);
    }
    return {
      type: 'FeatureCollection',
      features: features.flatMap((f) => f).map((f) => JSON.parse(f['GEOM']))
    } as FeatureCollection;
  }

  public async deleteRepository(identifier: string | RepositoryBoundingBoxSpec): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const repo = await this.getRepository(identifier);
    await this.setRepositoryStatus(repo.id, WellRepositoryStatus.DELETING);
    const deleteList = repo.wellTagNumbers;

    const ids: Record<number, number> = {};

    const idLists =
      (
        await this.cacheDB.query(
          //language=SQLite
          `SELECT WELL_TAG_NUMBERS
           FROM CACHE_METADATA`
        )
      )?.values?.flatMap((wtns) => JSON.parse(wtns['WELL_TAG_NUMBERS'])) ?? [];

    idLists.forEach((id) => {
      ids[id] ??= 0;
      ids[id]++;
    });

    const wellsToDelete = deleteList.filter((id) => ids[id] <= 1);
    await this.deleteWellsFromIds(wellsToDelete);
    await this.cacheDB.query(
      `DELETE
       FROM CACHE_METADATA
       WHERE ID = ?`,
      [repo.id]
    );
  }

  protected async deleteWellsFromIds(wellTagNumbers: number[]): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    await this.cacheDB.beginTransaction();
    try {
      for (let i = 0; i < wellTagNumbers.length; i += this.BATCH_AMOUNT) {
        const sliced = wellTagNumbers.slice(i, Math.min(i + this.BATCH_AMOUNT, wellTagNumbers.length));
        await this.cacheDB.query(
          //language=SQLite
          `DELETE
           FROM CACHED_WELLS
           WHERE ID IN (${sliced.map(() => '?').join(', ')})`,
          [...sliced]
        );
      }
      await this.cacheDB.commitTransaction();
    } catch (e) {
      this.cacheDB.rollbackTransaction();
      throw e;
    }
  }

  public async getRepository(repository: string | RepositoryBoundingBoxSpec): Promise<IWellRepositoryMetadata> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const identifier =
      typeof repository === 'string'
        ? repository
        : JSON.stringify(
            repository,
            Object.keys(repository).sort((a, b) => (a < b ? -1 : 1))
          );
    const result = await this.cacheDB.query(
      //language=SQLite
      `SELECT ID               AS id,
              STATUS           as status,
              BOUNDS           as bounds,
              WELL_TAG_NUMBERS as wellTagNumbers,
              GEOJSON          as cachedGeoJson
       FROM CACHE_METADATA
       WHERE ID = ?
          OR BOUNDS = ?
       LIMIT 1;`,
      [identifier, identifier]
    );
    return this.cleanRepository(result.values?.[0]);
  }

  /** @desc Convert stringified keys from stored repository back into Objects */
  private cleanRepository(repo: Record<PropertyKey, any>): IWellRepositoryMetadata {
    if (!repo) throw Error('No Data provided');

    repo.wellTagNumbers = JSON.parse(repo.wellTagNumbers);
    repo.bounds = JSON.parse(repo.bounds);
    if (repo?.cachedGeoJson) {
      repo.cachedGeoJson = JSON.parse(repo.cachedGeoJson);
    }
    return repo as IWellRepositoryMetadata;
  }

  public async listRepositories(): Promise<IWellRepositoryMetadata[]> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const repositories = await this.cacheDB.query(
      //language=SQLite
      `SELECT ID               AS id,
              STATUS           as status,
              BOUNDS           as bounds,
              WELL_TAG_NUMBERS as wellTagNumbers,
              GEOJSON          as cachedGeoJson
       FROM CACHE_METADATA`
    );
    return repositories.values?.map((repo) => this.cleanRepository(repo)) ?? [];
  }

  protected async saveWell(wellData: WellData): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    const id = wellData.properties.WELL_TAG_NUMBER;
    wellData.geometry.properties = { WELL_TAG_NUMBER: id };
    const stringifiedGeo = JSON.stringify(wellData.geometry);

    await this.cacheDB.query(
      //language=SQLite
      `INSERT INTO CACHED_WELLS(ID, GEOM)
       VALUES (?, ?)
       ON CONFLICT(ID)
         DO UPDATE SET GEOM = excluded.GEOM`,
      [id, stringifiedGeo]
    );
  }

  protected async saveWells(
    wellList: WellData[],
    _progressCallback?: ((currentProgress: IWellCacheProgressCallbackParameters) => void) | undefined
  ): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    for (const well of wellList) {
      await this.saveWell(well);
      // Progress callback
    }
  }

  public async setRepositoryStatus(repositoryId: string, status: WellRepositoryStatus): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(this.CACHE_UNAVAILABLE);
    }
    await this.cacheDB.query(
      //language=SQLite
      `UPDATE CACHE_METADATA
       SET STATUS = ?
       WHERE ID = ?`,
      [status, repositoryId]
    );
  }

  private async initializeRecordCache(sqlite: SQLiteConnection) {
    // Hold Migrations as named variable so we can use length to update the Db version automagically
    // Note: toVersion must be an integer.
    await sqlite.addUpgradeStatement(this.CACHE_DB_NAME, MIGRATIONS);

    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(this.CACHE_DB_NAME, false)).result;

    if (ret.result && isConn) {
      this.cacheDB = await sqlite.retrieveConnection(this.CACHE_DB_NAME, false);
    } else {
      this.cacheDB = await sqlite.createConnection(
        this.CACHE_DB_NAME,
        false,
        'no-encryption',
        MIGRATIONS.length,
        false
      );
    }
    try {
      await this.cacheDB.open().catch((e) => {
        console.error(e);
      });
    } catch (err) {
      console.error(err);
    }
  }
}

export default SQLiteWellCacheService;
