import { DBSQLiteValues, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import centroid from '@turf/centroid';
import { Feature } from '@turf/helpers';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import {
  IappRecordMode,
  RepositoryMetadata,
  RecordCacheService,
  RecordSetSourceMetadata,
  CacheDownloadMode
} from 'utils/record-cache/index';
import { sqlite } from 'utils/sharedSQLiteInstance';
import MIGRATIONS from './migrations';
import {
  getUnnestedFieldsForActivity,
  getUnnestedFieldsForIAPP
} from 'UI/Overlay/Records/RecordSet/RecordTableHelpers';

const CACHE_DB_NAME = 'record_cache.db';
const CACHE_UNAVAILABLE = 'cache not available';

/*
  To avoid hitting SQLite variable limits (That crashes the DB)
  SQLiteRecordCacheService uses the class member QUERY_LIMIT to break up larger queries.
  These errors can become noticeable when dealing with recordsets in the hundred thousands.
  Example Error: "Query: Failed in selectSQL : Error: querySQL prepare failed rc: 1 message: too many SQL variables"
*/
class SQLiteRecordCacheService extends RecordCacheService {
  private static _instance: SQLiteRecordCacheService;
  private readonly QUERY_LIMIT: number = 50000;
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

  async addOrUpdateRepository(spec: RepositoryMetadata): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const columns: Array<string> = [];
    const values: Array<string | number> = [];
    Object.keys(spec).forEach((key) => {
      columns.push(key);
      values.push(spec[key]);
    });
    try {
      await this.cacheDB.query(
        //language=SQLite`
        `INSERT INTO CACHE_METADATA(${columns.join(', ')})
         VALUES(${columns.map(() => '?').join(', ')})
         ON CONFLICT(SET_ID)
         DO UPDATE SET
          STATUS = excluded.STATUS,
          CACHE_TIME = excluded.CACHE_TIME`,
        [...values]
      );
    } catch (error) {
      console.error(error);
    }
  }

  async getRepository(repositoryId: string): Promise<RepositoryMetadata> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const repoData = await this.cacheDB.query(
      //language=SQLite
      `SELECT *
       FROM CACHE_METADATA
       WHERE SET_ID = ?
       LIMIT 1`,
      [repositoryId]
    );
    const resp = {};
    Object.entries(repoData.values?.[0] ?? {}).forEach(([key, value]) => {
      resp[key.toLowerCase()] = value;
    });
    return resp as RepositoryMetadata;
  }

  async isCached(repositoryId: string): Promise<boolean> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const metadata = await this.cacheDB.query(
      //language=SQLite
      `SELECT STATUS
       FROM CACHE_METADATA
       WHERE SET_ID = ?
       LIMIT 1
      `,
      [repositoryId]
    );
    return metadata?.values?.[0]?.['STATUS'] === UserRecordCacheStatus.CACHED;
  }

  async getIdList(repositoryId: string): Promise<string[]> {
    if (this.cacheDB == null) {
      throw Error(CACHE_UNAVAILABLE);
    }
    return (await this.getRepository(repositoryId)).cached_ids ?? [];
  }

  async deleteRepository(repositoryId: string): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const rawRepositoryMetadata = await this.cacheDB.query(
      //language=SQLite
      `SELECT DATA
       FROM CACHE_METADATA`
    );
    const repositoryMetadata: RepositoryMetadata[] =
      rawRepositoryMetadata?.values?.map((set) => JSON.parse(set['DATA'])) ?? [];
    const targetIndex = repositoryMetadata.findIndex((set) => set.setId === repositoryId);

    if (targetIndex === -1) return;

    const { cachedIds, recordSetType } = repositoryMetadata[targetIndex];

    const ids: Record<PropertyKey, number> = {};
    repositoryMetadata
      .flatMap((set) => set.cachedIds)
      .forEach((id) => {
        ids[id] ??= 0;
        ids[id]++;
      });
    const recordsToErase = cachedIds.filter((id) => ids[id] <= 1);

    await this.deleteCachedRecordsFromIds(recordsToErase, recordSetType);
    await this.cacheDB.query(
      //language=SQLite
      `DELETE FROM CACHE_METADATA
       WHERE SET_ID = ?`,
      [repositoryId]
    );
  }

  async listRepositories(): Promise<RepositoryMetadata[]> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const repositories = await this.cacheDB.query(
      //language=SQLite
      `SELECT *
       FROM CACHE_METADATA`
    );
    const response = repositories?.values?.map((repo) => {
      const parsedRepo = {};
      Object.keys(repo).forEach((key) => {
        parsedRepo[key.toLowerCase()] = JSON.parse(repo[key]);
      });
      return parsedRepo as RepositoryMetadata;
    });
    return response ?? [];
  }

  async setRepositoryStatus(repositoryId: string, status: UserRecordCacheStatus): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const currData = await this.getRepository(repositoryId);
    if (Object.keys(currData).length === 0) return; // Repo doesn't exist.
    currData.status = status;

    this.addOrUpdateRepository({
      ...currData,
      setId: repositoryId,
      status: status
    });
  }

  async checkForAbort(repositoryId: string): Promise<boolean> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const metadata = await this.cacheDB.query(
      //language=SQLite
      `SELECT STATUS
       FROM CACHE_METADATA
       WHERE SET_ID = ?
       LIMIT 1
      `,
      [repositoryId]
    );

    const cacheStatus = metadata?.values?.[0]['STATUS'];
    if (cacheStatus) {
      return cacheStatus === UserRecordCacheStatus.DELETING;
    }
    return true;
  }

  async checkPauseOrAbort(repositoryId: string): Promise<CacheDownloadMode> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const metadata = await this.cacheDB.query(
      //language=SQLite
      `SELECT STATUS
       FROM CACHE_METADATA
       WHERE SET_ID = ?
       LIMIT 1
      `,
      [repositoryId]
    );

    const cacheStatus = metadata?.values?.[0]['STATUS'];

    switch (cacheStatus) {
      case UserRecordCacheStatus.PAUSED:
        return CacheDownloadMode.PAUSE;
      case UserRecordCacheStatus.DELETING:
        return CacheDownloadMode.ABORT;
      default:
        return CacheDownloadMode.DEFAULT;
    }
  }

  /**
   * @desc fetch `n` records for a given recordset, supporting pagination
   * @param recordSetID Recordset to filter from
   * @param page Page to start pagination on
   * @param limit Maximum results per page
   * @returns { UserRecord[] } Filter Objects
   */
  async getPaginatedCachedActivityRecords(
    recordSetIdList: string[],
    page: number = 0,
    limit: number = recordSetIdList.length
  ): Promise<UserRecord[]> {
    if (!recordSetIdList || recordSetIdList.length === 0) {
      return [];
    }

    const startPos = page * limit;
    const subset = recordSetIdList.slice(startPos, startPos + limit);
    const results = await this.cacheDB?.query(
      // language=SQLite
      `SELECT DATA
       FROM CACHED_RECORDS
       WHERE ID IN (${subset.map(() => '?').join(', ')})`,
      [...subset]
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

  async getPaginatedCachedIappRecords(recordSetIdList: string[], page: number, limit: number): Promise<IappRecord[]> {
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
  private transformActivity(id: string, data: UserRecord): Array<any> {
    const normalizedRows = getUnnestedFieldsForActivity(data);
    const stringifiedData = JSON.stringify(data);
    const geometry = (data as Record<PropertyKey, Feature[]>)?.geometry;
    const activityDate = (data as Record<PropertyKey, any>)?.date_created;
    geometry.forEach((_, i) => {
      geometry[i].properties = {
        name: normalizedRows.short_id + `${data?.map_symbol ? '\n' + data.map_symbol : ''}`,
        description: id
      };
    });
    const centroidObj = centroid(geometry[0] as Feature);
    centroidObj.properties = { ...geometry[0].properties };
    const geojson = JSON.stringify(geometry) ?? null;
    return [
      id, // ID
      centroidObj.geometry.coordinates[1], // LATITUDE
      centroidObj.geometry.coordinates[0], // LONGITUDE
      geojson, // GEOJSON
      JSON.stringify(centroidObj), // CENTROID
      stringifiedData, // DATA
      activityDate, // DATE_CREATED
      id, // ACTIVITY_ID
      normalizedRows.activity_type || null,
      normalizedRows.short_id || null,
      normalizedRows.activity_subtype || null,
      normalizedRows.activity_date || null,
      normalizedRows.project_code || null,
      normalizedRows.jurisdiction_display || null,
      normalizedRows.invasive_plant || null,
      normalizedRows.species_positive_full || null,
      normalizedRows.species_negative_full || null,
      normalizedRows.has_current_positive || null,
      normalizedRows.current_positive_species || null,
      normalizedRows.has_current_negative || null,
      normalizedRows.current_negative_species || null,
      normalizedRows.species_treated_full || null,
      normalizedRows.species_biocontrol_full || null,
      normalizedRows.created_by || null,
      normalizedRows.updated_by || null,
      normalizedRows.agency || null
    ];
  }

  async saveActivity(data: Record<PropertyKey, UserRecord>): Promise<void> {
    const NUM_ACTIVITY_COLUMNS = 26;
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const entry = `( ${Array(NUM_ACTIVITY_COLUMNS).fill('?').join(',')} )`;
    const values: Array<any> = [];
    Object.keys(data).forEach((key) => values.push(this.transformActivity(key, data[key])));
    let query = `INSERT INTO CACHED_RECORDS(
      ID,
      LATITUDE,
      LONGITUDE,
      GEOJSON,
      CENTROID,
      DATA,
      DATE_CREATED,
      ACTIVITY_ID,
      ACTIVITY_TYPE,
      SHORT_ID,
      ACTIVITY_SUBTYPE,
      ACTIVITY_DATE,
      PROJECT_CODE,
      JURISDICTION_DISPLAY,
      INVASIVE_PLANT,
      SPECIES_POSITIVE_FULL,
      SPECIES_NEGATIVE_FULL,
      HAS_CURRENT_POSITIVE,
      CURRENT_POSITIVE_SPECIES,
      HAS_CURRENT_NEGATIVE,
      CURRENT_NEGATIVE_SPECIES,
      SPECIES_TREATED_FULL,
      SPECIES_BIOCONTROL_FULL,
      CREATED_BY,
      UPDATED_BY,
      AGENCY
    ) VALUES `;

    query += values.map(() => entry).join(', ');
    query += `
      ON CONFLICT (ID)
      DO UPDATE SET
      GEOJSON = excluded.GEOJSON,
      CENTROID = excluded.CENTROID,
      LATITUDE = excluded.LATITUDE,
      LONGITUDE =  excluded.LONGITUDE,
      GEOJSON =  excluded.GEOJSON,
      DATA = excluded.DATA,
      DATE_CREATED = excluded.DATE_CREATED,
      ACTIVITY_TYPE = excluded.ACTIVITY_TYPE,
      SHORT_ID = excluded.SHORT_ID,
      ACTIVITY_SUBTYPE = excluded.ACTIVITY_SUBTYPE,
      ACTIVITY_DATE = excluded.ACTIVITY_DATE,
      PROJECT_CODE = excluded.PROJECT_CODE,
      JURISDICTION_DISPLAY = excluded.JURISDICTION_DISPLAY,
      INVASIVE_PLANT = excluded.INVASIVE_PLANT,
      SPECIES_POSITIVE_FULL = excluded.SPECIES_POSITIVE_FULL,
      SPECIES_NEGATIVE_FULL = excluded.SPECIES_NEGATIVE_FULL,
      HAS_CURRENT_POSITIVE = excluded.HAS_CURRENT_POSITIVE,
      CURRENT_POSITIVE_SPECIES = excluded.CURRENT_POSITIVE_SPECIES,
      HAS_CURRENT_NEGATIVE = excluded.HAS_CURRENT_NEGATIVE,
      CURRENT_NEGATIVE_SPECIES = excluded.CURRENT_NEGATIVE_SPECIES,
      SPECIES_TREATED_FULL = excluded.SPECIES_TREATED_FULL,
      SPECIES_BIOCONTROL_FULL = excluded.SPECIES_BIOCONTROL_FULL,
      CREATED_BY = excluded.CREATED_BY,
      UPDATED_BY = excluded.UPDATED_BY,
      AGENCY = excluded.AGENCY
    `;
    await this.cacheDB.run(query, values.flat(), false);
  }

  protected async dateOfMostRecentRecord() {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    try {
      return (
        await this.cacheDB.query(
          //language=SQLite
          `SELECT MAX(DATE(DATE_CREATED)) as MAX_DATE
           FROM CACHED_RECORDS
           WHERE DATE_CREATED NOT NULL`
        )
      )?.values?.[0]?.['MAX_DATE'];
    } catch (e) {
      console.error(e);
    }
  }

  private transformIapp(id: string, iappRecord: IappRecord, iappRow: IappTableRow): Array<any> {
    const normalizedRows = getUnnestedFieldsForIAPP(iappRow);
    const geojson = iappRow.geojson;
    const map_symbol = geojson?.properties?.map_symbol;
    geojson.properties = {
      name: id + (map_symbol ? '\n' + map_symbol : ''),
      description: id
    };
    const stringRecord = JSON.stringify(iappRecord);
    const stringRow = JSON.stringify(iappRow);
    const stringGeo = JSON.stringify(geojson);
    return [
      id.toString(), // ID
      stringRow, // TABLE_DATA
      stringRecord, // RECORD_DATA
      stringGeo, // GEOJSON
      geojson.geometry.coordinates[1], // LATITUDE
      geojson.geometry.coordinates[0], // LONGITUDE
      normalizedRows.site_id || null,
      normalizedRows.site_paper_file_id || null,
      normalizedRows.jurisdictions_flattened || null,
      normalizedRows.min_survey || null,
      normalizedRows.all_species_on_site || null,
      normalizedRows.max_survey || null,
      normalizedRows.agencies || null,
      normalizedRows.biological_agent || null,
      normalizedRows.has_biological_treatments || null,
      normalizedRows.has_chemical_treatments || null,
      normalizedRows.has_mechanical_treatments || null,
      normalizedRows.has_biological_dispersals || null,
      normalizedRows.monitored || null,
      normalizedRows.regional_district || null,
      normalizedRows.regional_invasive_species_organization || null,
      normalizedRows.invasive_plant_management_area || null
    ];
  }

  async saveIapp(data: Record<PropertyKey, { record: IappRecord; row: IappTableRow }>): Promise<void> {
    const NUM_IAPP_COLUMNS = 22;
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const entry = ` ( ${Array(NUM_IAPP_COLUMNS).fill('?').join(',')} ) `;
    const values: Array<any> = [];
    Object.keys(data).forEach((id) => values.push(this.transformIapp(id, data[id].record, data[id].row)));
    let query = `INSERT INTO CACHED_IAPP_RECORDS(
      ID,
      TABLE_DATA,
      RECORD_DATA,
      GEOJSON,
      LATITUDE,
      LONGITUDE,
      SITE_ID,
      SITE_PAPER_FILE_ID,
      JURISDICTIONS_FLATTENED,
      MIN_SURVEY,
      ALL_SPECIES_ON_SITE,
      BIOLOGICAL_AGENT,
      MAX_SURVEY,
      AGENCIES,
      HAS_BIOLOGICAL_TREATMENTS,
      HAS_CHEMICAL_TREATMENTS,
      HAS_MECHANICAL_TREATMENTS,
      HAS_BIOLOGICAL_DISPERSALS,
      MONITORED,
      REGIONAL_DISTRICT,
      REGIONAL_INVASIVE_SPECIES_ORGANIZATION,
      INVASIVE_PLANT_MANAGEMENT_AREA
    ) VALUES `;
    query += values.map(() => entry).join(', ');
    query += 'ON CONFLICT (ID) DO NOTHING';
    await this.cacheDB.run(query, values.flat(), false);
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

  async createIappRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const geojson: Array<Feature> = [];
    for (let i = 0; i < ids.length; i += this.QUERY_LIMIT) {
      const slice = ids.slice(i, i + this.QUERY_LIMIT);
      const results = await this.cacheDB.query(
        //language SQLite
        `SELECT GEOJSON
         FROM CACHED_IAPP_RECORDS
         WHERE ID IN (${slice.map(() => '?').join(', ')})
         AND GEOJSON NOT NULL`,
        [...slice]
      );
      results?.values?.forEach((item) => geojson.push(JSON.parse(item['GEOJSON'])));
    }

    const cachedGeoJson: GeoJSONSourceSpecification = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geojson as any[]
      }
    };
    return { cachedGeoJson };
  }

  async createActivityRecordsetSourceMetadata(ids: string[]): Promise<RecordSetSourceMetadata> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const centroidArr: any[] = [];
    const geoJsonArr: any[] = [];

    let results: DBSQLiteValues;

    for (let i = 0; i < ids.length; i += this.QUERY_LIMIT) {
      const slice = ids.slice(i, i + this.QUERY_LIMIT);
      results = await this.cacheDB?.query(
        // language=SQLite
        `SELECT GEOJSON, SHORT_ID
       FROM CACHED_RECORDS
       WHERE ID IN (${slice.map(() => '?').join(', ')})
       AND GEOJSON NOT NULL`,
        [...slice]
      );

      results?.values?.forEach((item) => {
        try {
          JSON.parse(item['GEOJSON'])?.forEach((feature: Feature) => {
            centroidArr.push(centroid(feature));
            geoJsonArr.push(feature);
          });
        } catch (e) {
          console.error('Error parsing record:', e);
        }
      });
    }

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
    const BATCH_AMOUNT = 100;

    await this.cacheDB.beginTransaction();
    try {
      for (let i = 0; i < idsToDelete.length; i += BATCH_AMOUNT) {
        const sliced = idsToDelete.slice(i, Math.min(i + BATCH_AMOUNT, idsToDelete.length));
        await this.cacheDB.query(
          // language=SQLite
          `DELETE FROM ${RECORD_TABLE}
           WHERE ID IN (${sliced.map(() => '?').join(', ')})`,
          [...sliced]
        );
      }
      await this.cacheDB.commitTransaction();
    } catch (e) {
      await this.cacheDB.rollbackTransaction();
      throw e;
    }
  }

  protected async getAllCachedIds(): Promise<string[]> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const idList: string[] = [];
    let moreRows = true;
    let offsetMultiplier = 0;
    do {
      const act =
        (
          await this.cacheDB.query(
            //language=SQLite
            `SELECT ID
           FROM CACHED_RECORDS
           ORDER BY ID ASC
           LIMIT ?
           OFFSET ?`,
            [this.QUERY_LIMIT, this.QUERY_LIMIT * offsetMultiplier]
          )
        )?.values ?? [];
      const iapp =
        (
          await this.cacheDB.query(
            //language=SQLite
            `SELECT ID
           FROM CACHED_IAPP_RECORDS
           ORDER BY ID ASC
           LIMIT ?
           OFFSET ?`,
            [this.QUERY_LIMIT, this.QUERY_LIMIT * offsetMultiplier]
          )
        )?.values ?? [];

      offsetMultiplier++;
      moreRows = act.length + iapp.length !== 0;
      act.forEach((set) => idList.push(set['ID']));
      iapp.forEach((set) => idList.push(set['ID']));
    } while (moreRows);

    return idList;
  }

  private async initializeRecordCache(sqlite: SQLiteConnection) {
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
    } catch (e) {
      console.error(e);
    }
  }
}

export { SQLiteRecordCacheService };
