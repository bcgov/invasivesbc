import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { RecordCacheAddSpec, RecordCacheService, RecordSetCacheMetadata } from 'utils/record-cache/index';
import { sqlite } from 'utils/sharedSQLiteInstance';

const CACHE_DB_NAME = 'record_cache.db';

//language=SQLite
const RECORD_CACHE_DB_MIGRATIONS_1 = [
  `CREATE TABLE CACHE_METADATA
   (
     SET_ID VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY
   );`,
  `CREATE TABLE CACHED_RECORDS
   (
     ID   VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
     DATA TEXT        NOT NULL -- store the stringified json
   );`,
  `CREATE TABLE CACHED_RECORD_TO_CACHE_METADATA
   (
     RECORD_ID         VARCHAR(64) NOT NULL,
     CACHE_METADATA_ID VARCHAR(64) NOT NULL,
     PRIMARY KEY (RECORD_ID, CACHE_METADATA_ID)
   );`
];

class SQLiteRecordCacheService extends RecordCacheService {
  private static _instance: SQLiteRecordCacheService;

  private cacheDB: SQLiteDBConnection | null = null;

  protected constructor() {
    super();
  }

  static async getInstance(): Promise<SQLiteRecordCacheService> {
    if (SQLiteRecordCacheService._instance == null) {
      SQLiteRecordCacheService._instance = new SQLiteRecordCacheService();
      await SQLiteRecordCacheService._instance.initializeRecordCache(sqlite);
    }
    return SQLiteRecordCacheService._instance;
  }

  async addCachedSet(spec: RecordCacheAddSpec): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }
    try {
      await this.cacheDB.beginTransaction();

      await this.cacheDB.query(
        //language=SQLite
        `
          INSERT INTO (SET_ID)
          VALUES (?)`,
        [spec.setId]
      );
      for (const s of spec.idsToCache) {
        await this.cacheDB.query(
          //language=SQLite
          `
            INSERT INTO CACHED_RECORD_TO_CACHE_METADATA (CACHE_METADATA_ID, RECORD_ID)
            VALUES (?, ?)`,
          [spec.setId, s]
        );
      }
      await this.cacheDB.commitTransaction();
    } catch (e) {
      await this.cacheDB.rollbackTransaction();
    }
  }

  async deleteCachedSet(id: string): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }
    try {
      await this.cacheDB.beginTransaction();

      // delete the record of this set
      await this.cacheDB.query(
        //language=SQLite
        `DELETE
         FROM CACHED_RECORD_TO_CACHE_METADATA
         WHERE CACHE_METADATA_ID = ?`,
        [id]
      );

      // delete the associations
      await this.cacheDB.query(
        //language=SQLite
        `DELETE
         FROM CACHE_METADATA
         WHERE SET_ID = ?`,
        [id]
      );

      // delete and records that are now unreferenced
      // won't delete records that are still referenced by another cache set (in case a record exists in more than one)
      await this.cacheDB.query(
        //language=SQLite
        `DELETE
         FROM CACHED_RECORDS
         WHERE ID NOT IN (SELECT RECORD_ID FROM CACHED_RECORD_TO_CACHE_METADATA)`
      );

      await this.cacheDB.commitTransaction();
    } catch (e) {
      await this.cacheDB.rollbackTransaction();
    }
  }

  async listCachedSets(): Promise<RecordSetCacheMetadata[]> {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }

    try {
      await this.cacheDB.beginTransaction();

      const rows = await this.cacheDB.query(`SELECT SET_ID
                                             FROM CACHE_METADATA`);

      const cachedSets: RecordSetCacheMetadata[] = [];

      if (rows.values) {
        for (const row of rows.values) {
          cachedSets.push({ setId: row['SET_ID'] });
        }
      }

      await this.cacheDB.commitTransaction();

      return cachedSets;
    } catch (e) {
      await this.cacheDB.rollbackTransaction();
      throw new Error('error while querying cache');
    }
  }

  async loadActivity(id: string): Promise<unknown> {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }
    const result = await this.cacheDB.query(
      //language=SQLite
      `SELECT DATA
       FROM CACHED_RECORDS
       WHERE ID = ?`,
      [id]
    );

    if (!result || !result.values) {
      return null;
    }

    if (result.values.length !== 1) {
      console.error(`Unexpected result set size ${result.values.length} when querying cached_records table`);
      return null;
    }

    return JSON.parse(result.values[0]['DATA']);
  }

  async saveActivity(id: string, data: unknown): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error('cache not available');
    }
    const stringified = JSON.stringify(data);

    await this.cacheDB.query(
      //language=SQLite
      `INSERT INTO CACHED_RECORDS(ID, DATA)
       VALUES (?, ?)
       ON CONFLICT (ID) DO UPDATE SET DATA=?;`,
      [id, stringified, stringified]
    );
  }

  private async initializeRecordCache(sqlite: SQLiteConnection) {
    await sqlite.addUpgradeStatement(CACHE_DB_NAME, [
      {
        toVersion: 1,
        statements: RECORD_CACHE_DB_MIGRATIONS_1
      }
    ]);

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
    } catch (err) {
      console.error(err);
    }
  }
}

export { SQLiteRecordCacheService };
