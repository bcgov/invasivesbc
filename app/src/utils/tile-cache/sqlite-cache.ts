import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { TileCacheService, TileData } from 'utils/tile-cache/index';

const DB_NAME = 'tile_store.db';

class SQLiteTileCacheService extends TileCacheService {
  private static _instance: SQLiteTileCacheService;

  private db: SQLiteDBConnection | null = null;

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

  async setTile(repository: string, z: number, x: number, y: number, tileData: Uint8Array) {
    if (this.db == null) {
      throw new Error('cache not available');
    }

    const encodedTileData = Buffer.from(tileData).toString('base64');

    try {
      await this.db.query(
        //language=SQLite
        `INSERT INTO BAKED_TILES(TILESET, Z, X, Y, DATA)
         VALUES (?, ?, ?, ?, ?)`,
        [repository, z, x, y, encodedTileData]
      );
    } catch (e) {
      console.error(e);
      throw new Error('unable to set tile data in cache', { cause: e });
    }
  }

  async getTile(repository: string, z: number, x: number, y: number): Promise<TileData> {
    if (this.db == null) {
      return TileCacheService.generateFallbackTile();
    }

    try {
      const result = await this.db.query(
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
        return TileCacheService.generateFallbackTile();
      }

      return {
        data: result.values[0]['DATA']
      };
    } catch (e) {
      console.error(e);
      return TileCacheService.generateFallbackTile();
    }
  }

  private async initializeTileCache() {
    const sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);

    await sqlite.copyFromAssets(true);

    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    if (ret.result && isConn) {
      this.db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      this.db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    }
    
    try {
      await this.db.open().catch((e) => {
        console.error(e);
      });
    } catch (err) {
      console.error(err);
    }
  }
}

export { SQLiteTileCacheService };
