import { DBSQLiteValues, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import centroid from '@turf/centroid';
import { Feature } from '@turf/helpers';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
import booleanIntersects from '@turf/boolean-intersects';
import bbox from '@turf/bbox';
import MIGRATIONS from './migrations';
import IappRecord from 'interfaces/IappRecord';
import IappTableRow from 'interfaces/IappTableRecord';
import UserRecord from 'interfaces/UserRecord';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import {
  IappRecordMode,
  RepositoryMetadata,
  RecordCacheService,
  RecordSetSourceMetadata,
  CacheDownloadMode,
  IQueryParams
} from 'utils/record-cache/index';
import { sqlite } from 'utils/sharedSQLiteInstance';
import {
  getUnnestedFieldsForActivity,
  getUnnestedFieldsForIAPP
} from 'UI/Overlay/Records/RecordSet/RecordTableHelpers';
import { IFilter } from 'state/actions/userSettings/RecordSet';

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

  async addOrUpdateRepository(spec: RepositoryMetadata): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const columns: Array<string> = [];
    const values: Array<string | number> = [];
    Object.keys(spec).forEach((key) => {
      columns.push(key);
      if (typeof spec[key] === 'string' || !spec[key]) {
        values.push(spec[key] ?? null);
      } else {
        values.push(JSON.stringify(spec[key]));
      }
    });

    const updates = columns
      .filter((column) => !RegExp(/SET_ID/i).test(column))
      .map((key) => `${key} = excluded.${key}`)
      .join(', ');

    try {
      await this.cacheDB.query(
        //language=SQLite`
        `INSERT INTO CACHE_METADATA(${columns.join(', ')})
         VALUES (${columns.map(() => '?').join(', ')})
         ON CONFLICT(SET_ID)
           DO UPDATE SET ${updates}`,
        [...values]
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @desc Return handler, ensures keys are in lower snakecase
   * @param {RepositoryMetadata | Partial<RepositoryMetadata> } record entry from Db
   * @returns {RepositoryMetadata | Partial<RepositoryMetadata> } Parsed Entry.
   */
  private cacheMetadataTransformer(
    record: Partial<RepositoryMetadata> | RepositoryMetadata
  ): Partial<RepositoryMetadata> | RepositoryMetadata {
    const primitiveKeys = ['SET_ID', 'SET_NAME', 'RECORD_SET_TYPE', 'STATUS'];
    const resp: Partial<RepositoryMetadata> | RepositoryMetadata = {};
    Object.entries(record).forEach(([key, value]) => {
      if (!primitiveKeys.includes(key)) {
        value = JSON.parse(value);
      }
      resp[key.toLowerCase()] = value;
    });
    return resp;
  }

  async checkForAbort(repositoryId: string): Promise<boolean> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const { status } = await this.getRepository(repositoryId, ['status']);
    return status ? status === UserRecordCacheStatus.DELETING : true;
  }

  async checkPauseOrAbort(repositoryId: string): Promise<CacheDownloadMode> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const { status } = await this.getRepository(repositoryId, ['status']);
    switch (status) {
      case UserRecordCacheStatus.PAUSED:
        return CacheDownloadMode.PAUSE;
      case UserRecordCacheStatus.DELETING:
        return CacheDownloadMode.ABORT;
      default:
        return CacheDownloadMode.DEFAULT;
    }
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

  /**
   * @desc Gets the date of the most recently updated Activity Record. Used for determining Cache updates.
   * @returns Most Recent Record Date.
   */
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
          `DELETE
           FROM ${RECORD_TABLE}
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

  async deleteRepository(repositoryId: string): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const repositoryMetadata = await this.listRepositories(['set_id', 'cached_ids', 'record_set_type']);
    const targetIndex = repositoryMetadata.findIndex((set) => set.set_id == repositoryId);
    if (targetIndex === -1) return;

    const { cached_ids, record_set_type } = repositoryMetadata[targetIndex];

    const ids: Record<PropertyKey, number> = {};
    repositoryMetadata
      .flatMap((set) => set.cached_ids!)
      .forEach((id) => {
        ids[id] ??= 0;
        ids[id]++;
      });
    const recordsToErase = cached_ids!.filter((id) => ids[id] <= 1);

    await this.deleteCachedRecordsFromIds(recordsToErase, record_set_type!);
    await this.cacheDB.query(
      //language=SQLite
      `DELETE
       FROM CACHE_METADATA
       WHERE SET_ID = ?`,
      [repositoryId]
    );
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
             LIMIT ? OFFSET ?`,
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
             LIMIT ? OFFSET ?`,
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

  async getIdList(repositoryId: string): Promise<string[]> {
    if (this.cacheDB == null) {
      throw Error(CACHE_UNAVAILABLE);
    }
    return (await this.getRepository(repositoryId, ['cached_ids'])).cached_ids ?? [];
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

  /**
   * @desc Returns list of IDs that overlap with a GeoJSON Object.
   * @param {Feature} geom GeoJSON Object to find overlaps
   * @returns { string[] } Overlapping record Ids
   */
  public async getRecordIdsOverlappingFeature(geom: Feature): Promise<string[]> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    // Because local shapes are compared against a centroids lat/long, buffer the area of effect to catch what centroids may have missed
    const BUFFER = 0.0045; // Roughly 0.5KM
    const [minX, minY, maxX, maxY] = bbox(geom);
    const shapesInBufferedArea = await this.cacheDB.query(
      //language=SQLite
      `SELECT GEOJSON
       FROM CACHED_RECORDS
       WHERE LATITUDE BETWEEN ? AND ?
         AND LONGITUDE BETWEEN ? AND ?
       UNION ALL
       SELECT GEOJSON
       FROM CACHED_IAPP_RECORDS
       WHERE LATITUDE BETWEEN ? AND ?
         AND LONGITUDE BETWEEN ? AND ?
      `,
      [
        minY - BUFFER,
        maxY + BUFFER,
        minX - BUFFER,
        maxX + BUFFER,
        minY - BUFFER,
        maxY + BUFFER,
        minX - BUFFER,
        maxX + BUFFER
      ]
    );
    const overlappingRecords: string[] = [];
    (shapesInBufferedArea.values ?? []).forEach((entry) => {
      entry = JSON.parse(entry['GEOJSON']);
      // IAPP is Shape, but InvBC records are Array<Shape>
      const recordIsActivity = Object.hasOwn(entry, 'length');
      if (recordIsActivity) {
        entry?.forEach((shape: Feature) => {
          if (booleanIntersects(geom, shape)) {
            overlappingRecords.push(shape?.properties?.description);
          }
        });
      } else if (booleanIntersects(geom, entry)) {
        overlappingRecords.push(entry?.properties?.description);
      }
    });
    return overlappingRecords;
  }

  getRepository(repositoryId: string, columns: Array<keyof RepositoryMetadata>): Promise<Partial<RepositoryMetadata>>;
  getRepository(repositoryId: string): Promise<RepositoryMetadata>;
  async getRepository(
    repositoryId: string,
    columns?: Array<keyof RepositoryMetadata>
  ): Promise<RepositoryMetadata | Partial<RepositoryMetadata>> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const repoData = await this.cacheDB.query(
      //language=SQLite
      `SELECT ${columns?.join(', ') ?? '*'}
       FROM CACHE_METADATA
       WHERE SET_ID = ?
       LIMIT 1`,
      [repositoryId]
    );

    return this.cacheMetadataTransformer(repoData.values?.[0] ?? {});
  }

  async isCached(repositoryId: string): Promise<boolean> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const { status } = await this.getRepository(repositoryId, ['status']);
    return status === UserRecordCacheStatus.CACHED;
  }

  listRepositories(columns: Array<keyof RepositoryMetadata>): Promise<Partial<RepositoryMetadata>[]>;
  listRepositories(): Promise<RepositoryMetadata[]>;
  async listRepositories(
    columns?: Array<keyof RepositoryMetadata>
  ): Promise<RepositoryMetadata[] | Partial<RepositoryMetadata>[]> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const repositories = await this.cacheDB.query(
      //language=SQLite
      `SELECT ${columns?.join(',') ?? '*'}
       FROM CACHE_METADATA`
    );
    return repositories?.values?.map((repo) => this.cacheMetadataTransformer(repo)) ?? [];
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

  /**
   * @desc Fetches an IAPP Record from the local Database in requested format
   * @param id Site ID of Record
   * @param type Format Requested, e.g For Record Table, Full Record
   * @returns Formatted IAPP Information
   */
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

  /**
   * @desc Query Database using Parameters allowing for ordering, column filtering on all cached records
   * @param {IQueryParams} params Query Parameters for search
   */
  public async query(params: IQueryParams): Promise<UserRecord[] | IappRecord[]> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const values: Array<string | number> = [];
    const table = {
      [RecordSetType.Activity]: 'CACHED_RECORDS',
      [RecordSetType.IAPP]: 'CACHED_IAPP_RECORDS'
    }[params.recordSetType];
    const columns = params.selectColumns.length > 0 ? params.selectColumns.join(', ') : '*';
    let where = '';

    params.tableFilters.forEach((filter: IFilter, i: number) => {
      where += i === 0 ? '\n WHERE ' : '\n AND ';
      where += `${filter.field} LIKE '%${filter.filter}%'`;
    });
    let order = '';
    if (params?.sort?.by) {
      order = `ORDER BY ${params.sort.by} ${params.sort.order ?? 'ASC'}
               NULLS ${params.sort.order === 'DESC' ? 'FIRST' : 'LAST'}`;
    }
    const limit = params?.limit ?? 50000;
    const offset = params?.page != undefined && params?.limit != undefined ? params.page * params.limit : 0;
    const query =
      //language=SQLite
      `SELECT ${columns} 
       FROM ${table} 
       ${where}
       ${order}
       LIMIT ${limit}
       OFFSET ${offset}
    `;

    const results = await this.cacheDB.query(query, values);
    return (
      results?.values?.map((record) => {
        const parsedRecord: Record<PropertyKey, UserRecord | IappRecord> = {};
        Object.keys(record).forEach((key) => {
          if (['TABLE_DATA', 'RECORD_DATA', 'DATA', 'RECORD_DATA', 'GEOJSON', 'CENTROID'].includes(key)) {
            parsedRecord[key.toLowerCase()] = JSON.parse(record[key]);
          } else {
            parsedRecord[key.toLowerCase()] = record[key];
          }
        });
        return parsedRecord;
      }) ?? []
    );
  }

  /**
   * @desc Upserts an Invasives Activity into the local Database.
   * @param data Incoming Activity Data
   */
  async saveActivity(data: Record<PropertyKey, UserRecord>): Promise<void> {
    const NUM_ACTIVITY_COLUMNS = 26;
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const entry = `( ${Array(NUM_ACTIVITY_COLUMNS).fill('?').join(',')} )`;
    const values: Array<any> = [];
    Object.keys(data).forEach((key) => values.push(this.transformActivity(key, data[key])));
    let query = `INSERT INTO CACHED_RECORDS(ID,
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
                                            AGENCY)
                 VALUES `;

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

  /**
   * @desc Upserts an Invasives Activity into the local Database.
   * @param data Incoming Activity Data
   */
  async saveIapp(data: Record<PropertyKey, { record: IappRecord; row: IappTableRow }>): Promise<void> {
    const NUM_IAPP_COLUMNS = 22;
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    const entry = ` ( ${Array(NUM_IAPP_COLUMNS).fill('?').join(',')} ) `;
    const values: Array<any> = [];
    Object.keys(data).forEach((id) => values.push(this.transformIapp(id, data[id].record, data[id].row)));
    let query = `INSERT INTO CACHED_IAPP_RECORDS(ID,
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
                                                 INVASIVE_PLANT_MANAGEMENT_AREA)
                 VALUES `;
    query += values.map(() => entry).join(', ');
    query += 'ON CONFLICT (ID) DO NOTHING';
    await this.cacheDB.run(query, values.flat(), false);
  }

  async setRepositoryStatus(repositoryId: string, status: UserRecordCacheStatus): Promise<void> {
    if (this.cacheDB == null) {
      throw new Error(CACHE_UNAVAILABLE);
    }
    await this.cacheDB.query(
      // language=SQLite
      `UPDATE CACHE_METADATA
       SET STATUS = ?
       WHERE ID = ?`,
      [status, repositoryId]
    );
  }

  /**
   * @desc Takes the incoming Activity payload, and maps the column information to the fields, preps any geometry to contain Activity IDs and information.
   * @param id ID of New record
   * @param data Incoming Activity data
   * @returns Database entry for Activity
   */
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
    const centroidObj = centroid(geometry[0]);
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
      normalizedRows.activity_type ?? null,
      normalizedRows.short_id ?? null,
      normalizedRows.activity_subtype ?? null,
      normalizedRows.activity_date ?? null,
      normalizedRows.project_code ?? null,
      normalizedRows.jurisdiction_display ?? null,
      normalizedRows.invasive_plant ?? null,
      normalizedRows.species_positive_full ?? null,
      normalizedRows.species_negative_full ?? null,
      normalizedRows.has_current_positive ?? null,
      normalizedRows.current_positive_species ?? null,
      normalizedRows.has_current_negative ?? null,
      normalizedRows.current_negative_species ?? null,
      normalizedRows.species_treated_full ?? null,
      normalizedRows.species_biocontrol_full ?? null,
      normalizedRows.created_by ?? null,
      normalizedRows.updated_by ?? null,
      normalizedRows.agency ?? null
    ];
  }

  /**
   * @desc Takes the incoming IAPP payload, and maps the column information to the fields, preps any geometry to contain IAPP IDs and information.
   * @param id ID of New record
   * @param data Incoming IAPP data
   * @returns Database entry for IAPP
   */
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
      normalizedRows.site_id ?? null,
      normalizedRows.site_paper_file_id ?? null,
      normalizedRows.jurisdictions_flattened ?? null,
      normalizedRows.min_survey ?? null,
      normalizedRows.all_species_on_site ?? null,
      normalizedRows.max_survey ?? null,
      normalizedRows.agencies ?? null,
      normalizedRows.biological_agent ?? null,
      normalizedRows.has_biological_treatments ?? null,
      normalizedRows.has_chemical_treatments ?? null,
      normalizedRows.has_mechanical_treatments ?? null,
      normalizedRows.has_biological_dispersals ?? null,
      normalizedRows.monitored ?? null,
      normalizedRows.regional_district ?? null,
      normalizedRows.regional_invasive_species_organization ?? null,
      normalizedRows.invasive_plant_management_area ?? null
    ];
  }
}

export { SQLiteRecordCacheService };
