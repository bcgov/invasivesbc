import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import {
  RepositoryMetadata,
  RepositoryStatistics,
  RepositoryStatus,
  TileCacheService,
  TileData
} from 'utils/tile-cache/index';

const BAKED_DB_NAME = 'tile_store.db';
const CACHE_DB_NAME = 'cached_tiles.db';

//language=SQLite
const CACHE_CREATE_DDL = `

  CREATE TABLE CACHE_METADATA
  (
    TILESET       VARCHAR NOT NULL UNIQUE PRIMARY KEY,
    DESCRIPTION   TEXT,
    STATUS        VARCHAR(32),
    MAX_ZOOM      INTEGER,
    MIN_LATITUDE  NUMERIC(10, 7),
    MAX_LATITUDE  NUMERIC(10, 7),
    MIN_LONGITUDE NUMERIC(10, 7),
    MAX_LONGITUDE NUMERIC(10, 7)
  );

  CREATE TABLE CACHED_TILES
  (
    TILESET VARCHAR NOT NULL REFERENCES CACHE_METADATA (TILESET) ON UPDATE CASCADE ON DELETE CASCADE,
    Z       INTEGER NOT NULL,
    X       INTEGER NOT NULL,
    Y       INTEGER NOT NULL,
    DATA    BLOB    NOT NULL
  );

`;

class SQLiteTileCacheService extends TileCacheService {
  private static _instance: SQLiteTileCacheService;

  private bakedDB: SQLiteDBConnection | null = null;
  private cacheDB: SQLiteDBConnection | null = null;

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<SQLiteTileCacheService> {
    if (SQLiteTileCacheService._instance == null) {
      SQLiteTileCacheService._instance = new SQLiteTileCacheService();
      await SQLiteTileCacheService._instance.initializeTileCache();
    }
    return SQLiteTileCacheService._instance;
  }

  private static rowToMetadata(row: Record<string, any>): RepositoryMetadata {
    return {
      id: row['TILESET'],
      description: row['DESCRIPTION'],
      status: RepositoryStatus[row['STATUS']],
      maxZoom: row['MAX_ZOOM'],
      bounds: {
        minLongitude: row['MIN_LONGITUDE'],
        maxLongitude: row['MAX_LONGITUDE'],
        minLatitude: row['MIN_LATITUDE'],
        maxLatitude: row['MAX_LATITUDE']
      }
    };
  }

  async setTile(repository: string, z: number, x: number, y: number, tileData: Uint8Array) {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }

    const encodedTileData = Buffer.from(tileData).toString('base64');

    try {
      await this.cacheDB.query(
        //language=SQLite
        `INSERT INTO CACHED_TILES(TILESET, Z, X, Y, DATA)
         VALUES (?, ?, ?, ?, ?)`,
        [repository, z, x, y, encodedTileData]
      );
    } catch (e) {
      console.error(e);
      throw new Error('unable to set tile data in cache', { cause: e });
    }
  }

  async getTile(repository: string, z: number, x: number, y: number): Promise<TileData> {
    switch (repository) {
      case 'baked':
        return this.getBakedTile(repository, z, x, y);
      default:
        return this.getCachedTile(repository, z, x, y);
    }
  }

  async deleteRepository(repository: string): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }

    // cascade should take care of tiles
    await this.cacheDB.query(
      //language=SQLite
      `
        DELETE
        FROM CACHE_METADATA
        WHERE TILESET = ?
      `,
      [repository]
    );
  }

  async getRepository(id: string): Promise<RepositoryMetadata | null> {
    if (this.cacheDB == null) {
      return null;
    }
    const result = await this.cacheDB.query(
      //language=SQLite
      `SELECT *
       FROM CACHE_METADATA
       WHERE TILESET = ?`,
      [id]
    );

    if (!result || !result.values) {
      return null;
    }

    if (result.values.length !== 1) {
      console.error(`Unexpected result set size ${result.values.length} when querying cache_metadata table`);
      return null;
    }

    return SQLiteTileCacheService.rowToMetadata(result.values[0]);
  }

  async listRepositories(): Promise<RepositoryMetadata[]> {
    if (this.cacheDB == null) {
      return [];
    }

    const result = await this.cacheDB.query(
      //language=SQLite
      `SELECT *
       FROM CACHE_METADATA
       order by id`
    );

    if (!result || !result.values) {
      return [];
    }

    return result.values.map((r) => SQLiteTileCacheService.rowToMetadata(r));
  }

  async setRepositoryStatus(repository: string, status: RepositoryStatus): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }

    await this.cacheDB.query(
      //language=SQLite
      `UPDATE CACHE_METADATA
       SET STATUS = ?
       WHERE TILESET = ?`,
      [status.toString(), repository]
    );
  }

  protected async addRepository(spec: RepositoryMetadata): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }

    await this.cacheDB.query(
      //language=SQLite
      `INSERT
       INTO CACHE_METADATA(TILESET,
                           DESCRIPTION,
                           STATUS,
                           MAX_ZOOM,
                           MIN_LATITUDE,
                           MAX_LATITUDE,
                           MIN_LONGITUDE,
                           MAX_LONGITUDE)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        spec.id,
        spec.description,
        spec.status,
        spec.maxZoom,
        spec.bounds.minLatitude,
        spec.bounds.maxLatitude,
        spec.bounds.minLongitude,
        spec.bounds.maxLongitude
      ]
    );
  }

  protected async cleanupOrphanTiles(): Promise<void> {
    // shouldn't need to with this backend
    return;
  }

  private async getBakedTile(repository: string, z: number, x: number, y: number) {
    if (this.bakedDB == null) {
      return TileCacheService.generateTransparentFallbackTile();
    }

    try {
      const result = await this.bakedDB.query(
        //language=SQLite
        `SELECT *
         FROM BAKED_TILES
         WHERE TILESET = ?
           AND Z = ?
           AND X = ?
           AND Y = ?`,
        [repository, z, x, y]
      );

      if (result.values?.length != 1) {
        // no such tile
        return TileCacheService.generateTransparentFallbackTile();
      }

      return {
        data: result.values[0]['DATA']
      };
    } catch (e) {
      console.error(e);
      return TileCacheService.generateFallbackTile();
    }
  }

  private async getCachedTile(repository: string, z: number, x: number, y: number) {
    if (this.cacheDB == null) {
      return TileCacheService.generateTransparentFallbackTile();
    }

    try {
      const result = await this.cacheDB.query(
        //language=SQLite
        `SELECT *
         FROM CACHED_TILES
         WHERE TILESET = ?
           AND Z = ?
           AND X = ?
           AND Y = ? `,
        [repository, z, x, y]
      );

      if (result.values?.length != 1) {
        // no such tile
        return TileCacheService.generateTransparentFallbackTile();
      }

      return {
        data: result.values[0]['DATA']
      };
    } catch (e) {
      console.error(e);
      return TileCacheService.generateTransparentFallbackTile();
    }
  }

  private async initializeBakedTileDatabase() {
    const sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);

    await sqlite.copyFromAssets(true);

    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(BAKED_DB_NAME, false)).result;

    if (ret.result && isConn) {
      this.bakedDB = await sqlite.retrieveConnection(BAKED_DB_NAME, false);
    } else {
      this.bakedDB = await sqlite.createConnection(BAKED_DB_NAME, false, 'no-encryption', 1, false);
    }

    try {
      await this.bakedDB.open().catch((e) => {
        console.error(e);
      });
    } catch (err) {
      console.error(err);
    }
  }

  private async initializeDynamicCacheTileDatabase() {
    const sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);

    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(CACHE_DB_NAME, false)).result;

    if (ret.result && isConn) {
      this.cacheDB = await sqlite.retrieveConnection(CACHE_DB_NAME, false);
    } else {
      this.cacheDB = await sqlite.createConnection(CACHE_DB_NAME, false, 'no-encryption', 1, false);
    }

    try {
      await this.cacheDB.open().catch((e) => {
        console.error(e);
      });

      if (!(await this.cacheDB.isTable('CACHE_METADATA'))) {
        console.debug('initializing db');
        await this.cacheDB.run(CACHE_CREATE_DDL);
      }
    } catch (err) {
      console.error(err);
    }
  }

  private async initializeTileCache() {
    await this.initializeBakedTileDatabase();
    await this.initializeDynamicCacheTileDatabase();
  }

  async getRepositoryStatistics(id: string): Promise<RepositoryStatistics> {
    throw new Error('unimplemented');
  }
}

export { SQLiteTileCacheService };
