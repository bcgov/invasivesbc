import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { RecordCacheService } from 'utils/record-cache/index';

const CACHE_DB_NAME = 'record_cache.db';

//language=SQLite
const RECORD_CACHE_DB_MIGRATIONS_1 = [
  `CREATE TABLE CACHE_METADATA
   (
     TILESET       VARCHAR NOT NULL UNIQUE PRIMARY KEY,
     DESCRIPTION   TEXT,
     STATUS        VARCHAR(32),
     MAX_ZOOM      INTEGER,
     MIN_LATITUDE  NUMERIC(10, 7),
     MAX_LATITUDE  NUMERIC(10, 7),
     MIN_LONGITUDE NUMERIC(10, 7),
     MAX_LONGITUDE NUMERIC(10, 7)
   );`,
  `CREATE TABLE CAHED_RECORDS
   (
     TILESET VARCHAR NOT NULL REFERENCES CACHE_METADATA (TILESET) ON UPDATE CASCADE ON DELETE CASCADE,
     Z       INTEGER NOT NULL,
     X       INTEGER NOT NULL,
     Y       INTEGER NOT NULL,
     DATA    BLOB    NOT NULL
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
      await SQLiteRecordCacheService._instance.initializeRecordCache();
    }
    return SQLiteRecordCacheService._instance;
  }

  private async initializeRecordCache() {
    const sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);

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
