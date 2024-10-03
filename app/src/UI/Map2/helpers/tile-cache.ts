import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { FALLBACK_IMAGE } from './layer-definitions';

const DB_NAME = 'tile_store.db';

const base64tobuffer = (s) => {
  const binaryString = atob(s);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

class TileCacheService {
  initialized = false;
  db: SQLiteDBConnection | null = null;

  constructor() {}

  async initializeTileCache() {
    this.initialized = true;

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

  async getTile(repository: string, z: number, x: number, y: number) {
    if (this.db == null || !this.initialized) {
      return {
        data: base64tobuffer(FALLBACK_IMAGE)
      };
    }

    try {
      const result = await this.db.query(
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
        return {
          data: base64tobuffer(FALLBACK_IMAGE)
        };
      }

      return {
        data: result.values[0]['DATA']
      };
    } catch (e) {
      console.error(e);

      return {
        data: base64tobuffer(FALLBACK_IMAGE)
      };
    }
  }
}

export { TileCacheService };
