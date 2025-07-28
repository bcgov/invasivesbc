import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import MIGRATIONS from './migrations';
import {
  IPlanMyTripCacheStatus,
  IPlanMyTripCacheStatuses,
  IPlanMyTripRepositoryMetadata,
  PlanMyTripCacheService
} from '.';
import { sqlite } from 'utils/sharedSQLiteInstance';

const cacheKey = {
  id: 'ID',
  geojson: 'GEOJSON',
  name: 'NAME',
  mapTiles: 'MAP_TILES',
  wmsLayers: 'WMS_LAYERS',
  wellData: 'WELL_DATA',
  activityRecordset: 'ACTIVITY_RECORDSET',
  iappRecordset: 'IAPP_RECORDSET'
};
class SQLitePlanMyTripCacheService extends PlanMyTripCacheService {
  private readonly CACHE_DB_NAME = 'plan_my_trip.db';
  private static _instance: SQLitePlanMyTripCacheService;

  private cacheDB: SQLiteDBConnection | null = null;

  protected constructor() {
    super();
  }

  private dbToJson = (r): IPlanMyTripRepositoryMetadata => {
    const geojson = JSON.parse(r[cacheKey.geojson]);
    return {
      geojson: geojson,
      id: r[cacheKey.id],
      name: r[cacheKey.name],
      cacheStatuses: {
        mapTiles: r[cacheKey.mapTiles],
        wmsLayer: r[cacheKey.wmsLayers],
        wellData: r[cacheKey.wellData],
        activityRecordset: r[cacheKey.activityRecordset],
        iappRecordset: r[cacheKey.iappRecordset]
      }
    };
  };

  static override async getInstance(): Promise<SQLitePlanMyTripCacheService> {
    if (SQLitePlanMyTripCacheService._instance == null) {
      SQLitePlanMyTripCacheService._instance = new SQLitePlanMyTripCacheService();
      await SQLitePlanMyTripCacheService._instance.initializePlanMyTripCache(sqlite);
    }
    return SQLitePlanMyTripCacheService._instance;
  }

  async updateSubCacheStatus(
    repositoryId: string,
    type: keyof IPlanMyTripCacheStatuses,
    newStatus: IPlanMyTripCacheStatus
  ): Promise<void> {
    if (this.cacheDB == null) throw new Error(this.CACHE_UNAVAILABLE);
    const setKey = cacheKey[type];
    await this.cacheDB.query(
      //Language=SQLite
      `UPDATE PLAN_MY_TRIP
       SET ${setKey} = ?
       WHERE ID = ?`,
      [newStatus, repositoryId]
    );
  }
  public syncStatus(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  protected async addOrUpdateRepository(spec: IPlanMyTripRepositoryMetadata): Promise<void> {
    if (this.cacheDB == null) throw new Error(this.CACHE_UNAVAILABLE);
    const { id, geojson, name, cacheStatuses } = spec;
    await this.cacheDB.query(
      //language=SQLite
      `INSERT INTO PLAN_MY_TRIP(
          ID,
          GEOJSON,
          NAME,
          MAP_TILES,
          WMS_LAYERS,
          WELL_DATA,
          ACTIVITY_RECORDSET,
          IAPP_RECORDSET
        )
        VALUES(?,?,?,?,?,?,?,?)
        ON CONFLICT (ID)
        DO UPDATE SET
          ID = excluded.ID,
          GEOJSON = excluded.GEOJSON,
          NAME = excluded.NAME,
          MAP_TILES = excluded.MAP_TILES,
          WMS_LAYERS = excluded.WMS_LAYERS,
          WELL_DATA = excluded.WELL_DATA,
          ACTIVITY_RECORDSET = excluded.ACTIVITY_RECORDSET,
          IAPP_RECORDSET = excluded.IAPP_RECORDSET;
      `,
      [
        id,
        JSON.stringify(geojson),
        name,
        cacheStatuses.mapTiles,
        cacheStatuses.wmsLayer,
        cacheStatuses.wellData,
        cacheStatuses.activityRecordset,
        cacheStatuses.iappRecordset
      ]
    );
  }
  public async deleteRepository(repositoryId: string): Promise<void> {
    if (this.cacheDB == null) throw new Error(this.CACHE_UNAVAILABLE);
    await this.cacheDB.query(
      //Language=SQLite
      `DELETE FROM PLAN_MY_TRIP
       WHERE ID = ?`,
      [repositoryId]
    );
  }

  public async getRepository(repositoryId: string): Promise<IPlanMyTripRepositoryMetadata | null> {
    if (this.cacheDB == null) throw new Error(this.CACHE_UNAVAILABLE);
    const response = await this.cacheDB.query(
      //language=SQLite
      `SELECT * from
        PLAN_MY_TRIP
        WHERE ID = ?`,
      [repositoryId]
    );
    return this.dbToJson(response.values?.[0]) as IPlanMyTripRepositoryMetadata;
  }

  public async listRepositories(): Promise<IPlanMyTripRepositoryMetadata[]> {
    const repos = await this.cacheDB?.query(
      //Language=SQLite
      `SELECT * from PLAN_MY_TRIP`
    );
    return repos?.values?.map((repo) => this.dbToJson(repo)) ?? ([] as IPlanMyTripRepositoryMetadata[]);
  }

  private async initializePlanMyTripCache(sqlite: SQLiteConnection) {
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

export default SQLitePlanMyTripCacheService;
