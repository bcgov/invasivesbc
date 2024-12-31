import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import centroid from '@turf/centroid';
import { Feature } from '@turf/helpers';
import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
import { IappRecordMode, RecordCacheService, RecordSetSourceMetadata } from 'utils/record-cache/index';
import { sqlite } from 'utils/sharedSQLiteInstance';

const CACHE_DB_NAME = 'record_cache.db';
const CACHE_UNAVAILABLE = 'cache not available';
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

const RECORD_CACHE_DB_MIGRATIONS_2 = [
  `ALTER TABLE CACHED_RECORDS
   ADD COLUMN GEOJSON TEXT;`,
  `ALTER TABLE CACHED_RECORDS
   ADD COLUMN SHORT_ID TEXT;`
];

const RECORD_CACHE_DB_MIGRATIONS_3 = [
  `CREATE TABLE CACHED_IAPP_RECORDS
  (
    ID          VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
    TABLE_DATA  TEXT NOT NULL,
    RECORD_DATA TEXT NOT NULL,
    GEOJSON     TEXT NOT NULL
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

  /**
   * @desc fetch `n` records for a given recordset, supporting pagination
   * @param recordSetID Recordset to filter from
   * @param page Page to start pagination on
   * @param limit Maximum results per page
   * @returns { UserRecord[] } Filter Objects
   */
  async fetchPaginatedCachedRecords(recordSetIdList: string[], page: number, limit: number): Promise<UserRecord[]> {
    if (!recordSetIdList || recordSetIdList.length === 0) {
      return [];
    }

    const startPos = page * limit;
    const results = await this.cacheDB?.query(
      // language=SQLite
      `SELECT DATA
       FROM CACHED_RECORDS
       WHERE ID IN (${recordSetIdList.map(() => '?').join(', ')})
       LIMIT ?, ?`,
      [...recordSetIdList, startPos, limit]
    );

    if (!results?.values || results.values?.length === 0) {
      return [];
    }

    const response = results.values
      .map((item) => {
        try {
          return JSON.parse(item['DATA']) as UserRecord;
        } catch (e) {
          console.error('Error parsing record:', e);
          return null;
        }
      })
      .filter((record) => record !== null);

    return response;
  }
  async fetchPaginatedCachedIappRecords(recordSetIdList: string[], page: number, limit: number): Promise<IappRecord[]> {
    if (!recordSetIdList || recordSetIdList.length === 0) {
      return [];
    }

    const startPos = page * limit;
    const results = await this.cacheDB?.query(
      // language=SQLite
      `SELECT TABLE_DATA
       FROM CACHED_IAPP_RECORDS
       WHERE ID IN (${recordSetIdList.map(() => '?').join(', ')})
       LIMIT ?, ?`,
      [...recordSetIdList, startPos, limit]
    );

    if (!results?.values || results.values?.length === 0) {
      return [];
    }
    const response = results.values
      .map((item) => {
        try {
          return JSON.parse(item['TABLE_DATA']) as IappRecord;
        } catch (e) {
          console.error('Error parsing record:', e);
          return null;
        }
      })
      .filter((record) => record !== null);
    return response;
  }

  async loadActivity(id: string): Promise<unknown> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const result = await this.cacheDB.query(
      //language=SQLite
      `SELECT DATA
       FROM CACHED_RECORDS
       WHERE ID = ?`,
      [id]
    );

    if (!result?.values) {
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
      throw new Error(CACHE_UNAVAILABLE);
    }
    const stringified = JSON.stringify(data);
    const short_id = (data as Record<PropertyKey, Feature[]>)?.short_id;
    const geometry = (data as Record<PropertyKey, Feature[]>)?.geometry;
    const geojson = JSON.stringify(geometry) ?? null;
    await this.cacheDB.query(
      //language=SQLite
      `INSERT INTO CACHED_RECORDS(ID, DATA, GEOJSON, SHORT_ID)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (ID) DO UPDATE SET DATA=?;`,
      [id, stringified, geojson, short_id, stringified]
    );
  }

  async saveIapp(id: string, iappRecord: IappRecord, iappTableRow: IappTableRow): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    try {
      const geojson = iappTableRow.result[0].geojson;
      geojson.properties = {
        name: `${id} ${geojson.properties.map_symbol ?? ''}`,
        description: id
      };
      const stringRecord = JSON.stringify(iappRecord.result.rows[0]);
      const stringRow = JSON.stringify(iappTableRow.result[0]);
      const stringGeo = JSON.stringify(geojson);
      await this.cacheDB.query(
        //language=SQLite
        `INSERT INTO CACHED_IAPP_RECORDS(ID, RECORD_DATA, TABLE_DATA, GEOJSON)
         VALUES ( ?, ?, ?, ? )
         ON CONFLICT (ID) DO NOTHING;`, // IAPP is static, no update needed.
        [id.toString(), stringRecord, stringRow, stringGeo]
      );
    } catch (ex) {
      console.error(ex);
    }
  }

  async loadIapp(id: string, type: IappRecordMode): Promise<IappRecord | IappTableRow> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const dataType = type === IappRecordMode.Record ? 'RECORD_DATA' : 'TABLE_DATA';
    const result = await this.cacheDB.query(
      //language=SQLite
      `SELECT ${dataType}
         FROM CACHED_IAPP_RECORDS
         WHERE ID = ?
         LIMIT 1`,
      [id.toString()]
    );
    if (!result?.values) {
      throw Error('No results found');
    }
    return JSON.parse(result.values[0][dataType]);
  }

  async loadIappRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const results = await this.cacheDB?.query(
      // language SQLite
      `SELECT GEOJSON
      FROM CACHED_IAPP_RECORDS
      WHERE ID IN (${ids.map(() => '?').join(', ')})
      AND GEOJSON NOT NULL`,
      [...ids]
    );
    const geojson = results?.values?.map((item) => JSON.parse(item['GEOJSON']));
    const cachedGeoJson: GeoJSONSourceSpecification = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geojson as any[]
      }
    };
    return { cachedGeoJson };
  }
  async loadRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const centroidArr: any[] = [];
    const geoJsonArr: any[] = [];
    const results = await this.cacheDB?.query(
      // language=SQLite
      `SELECT GEOJSON, SHORT_ID
       FROM CACHED_RECORDS
       WHERE ID IN (${ids.map(() => '?').join(', ')})
       AND GEOJSON NOT NULL`,
      [...ids]
    );

    results?.values?.forEach((item) => {
      try {
        const label = item['SHORT_ID'];
        JSON.parse(item['GEOJSON'])?.forEach((feature: Feature) => {
          feature.properties = { name: label };
          centroidArr.push(centroid(feature));
          geoJsonArr.push(feature);
        });
      } catch (e) {
        console.error('Error parsing record:', e);
      }
    });
    const cachedCentroid: GeoJSONSourceSpecification = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: centroidArr
      }
    };
    const cachedGeoJson: GeoJSONSourceSpecification = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geoJsonArr
      }
    };
    return { cachedCentroid, cachedGeoJson };
  }
  async deleteCachedRecordsFromIds(idsToDelete: string[], recordSetType: RecordSetType): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const RecordsToTable = {
      [RecordSetType.Activity]: 'CACHED_RECORDS',
      [RecordSetType.IAPP]: 'CACHED_IAPP_RECORDS'
    };
    const RECORD_TABLE = RecordsToTable[recordSetType];
    await this.cacheDB.query(
      // language=SQLite
      `DELETE FROM ${RECORD_TABLE}
       WHERE ID IN (${idsToDelete.map(() => '?').join(', ')})`,
      [...idsToDelete]
    );
  }
  private async initializeRecordCache(sqlite: SQLiteConnection) {
    // Hold Migrations as named variable so we can use length to update the Db version automagically
    // Note: toVersion must be an integer.
    const MIGRATIONS = [
      {
        toVersion: 1,
        statements: RECORD_CACHE_DB_MIGRATIONS_1
      },
      {
        toVersion: 2,
        statements: RECORD_CACHE_DB_MIGRATIONS_2
      },
      {
        toVersion: 3,
        statements: RECORD_CACHE_DB_MIGRATIONS_3
      }
    ];
    await sqlite.addUpgradeStatement(CACHE_DB_NAME, MIGRATIONS);

    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(CACHE_DB_NAME, false)).result;

    if (ret.result && isConn) {
      this.cacheDB = await sqlite.retrieveConnection(CACHE_DB_NAME, false);
    } else {
      this.cacheDB = await sqlite.createConnection(CACHE_DB_NAME, false, 'no-encryption', MIGRATIONS.length, false);
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
