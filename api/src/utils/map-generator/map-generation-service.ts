import SQL from 'sql-template-strings';
import { escapeIdentifier, escapeLiteral } from 'pg';
import { getDBConnection } from 'database/db';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('map-generation-service');

/* By declaring them first as literal arrays, we can use the values directly in JSONSchema without duplication */
const MapGenerationValueLiterals = {
  Audience: ['PUBLIC', 'PRIVATE'] as const,
  Status: ['NEW', 'INCOMPLETE', 'READY', 'PROCESSING', 'SUCCEEDED', 'FAILED'] as const,
  ArchiveFormat: ['PMTILES'] as const,
  TileType: ['RASTER', 'VECTOR'] as const,

  VectorGenerationMode: [
    'ALL',
    'ALL_ACTIVITIES',
    'ALL_IAPP',
    'MY_ACTIVITIES',
    'PUBLIC',
    'PUBLIC_ACTIVITIES',
    'PUBLIC_IAPP',
    'IDLIST',
    'JSON_FILTEROBJECT'
  ] as const
};

type Audience = (typeof MapGenerationValueLiterals.Audience)[number];
type Status = (typeof MapGenerationValueLiterals.Status)[number];
type ArchiveFormat = (typeof MapGenerationValueLiterals.ArchiveFormat)[number];
type TileType = (typeof MapGenerationValueLiterals.TileType)[number];
type VectorGenerationMode = (typeof MapGenerationValueLiterals.VectorGenerationMode)[number];

type BoundingBox = { minX: number; minY: number; maxX: number; maxY: number };

type MapGenerationRequestCreationRequest = {
  minZoom?: number;
  maxZoom?: number;
  expires?: Date | null | 'DEFAULT';
  archiveFormat?: ArchiveFormat;
  tileType?: TileType;
  audience?: Audience;
  bbox?: BoundingBox;
  creatingUserId?: number;
  vectorGenerationMode?: VectorGenerationMode;
  idList?: number[];
};

type MapGenerationRequest = {
  id: string;
  minZoom: number;
  maxZoom: number;
  expires: Date;
  status: Status;
  archiveFormat: ArchiveFormat;
  tileType: TileType;
  audience: Audience;
  bbox: BoundingBox;
  created: Date;
  updated: Date;
  createdBy: {
    username: string;
    id: number;
  };
};

type VectorMapGenerationRequest = MapGenerationRequest & {
  mode: VectorGenerationMode;
  idList?: number[];
};

function isVectorGenerationRequest(
  request: MapGenerationRequest | VectorMapGenerationRequest
): request is VectorMapGenerationRequest {
  return (request as VectorMapGenerationRequest).mode !== undefined;
}

class MapGenerationService {
  public static async createRequest(request: MapGenerationRequestCreationRequest): Promise<string> {
    const db = await getDBConnection();

    db.query('BEGIN TRANSACTION');
    let rollback = false;

    try {
      const insertParams = {};
      if (request.bbox) {
        if (request.bbox) {
          // Transform bbox to PostGIS geometry
          if (
            typeof request.bbox.minX !== 'number' ||
            typeof request.bbox.maxX !== 'number' ||
            typeof request.bbox.minY !== 'number' ||
            typeof request.bbox.maxY !== 'number'
          ) {
            throw new Error('invalid type for coordinate');
          }
          const geomSql = `ST_SetSRID(ST_MakeEnvelope(${request.bbox.minX}, ${request.bbox.minY}, ${request.bbox.maxX}, ${request.bbox.maxY}), 4326)`;
          insertParams['bbox'] = geomSql;
        }
      }

      if (request.minZoom) {
        insertParams['minimum_zoom'] = request.minZoom;
      }
      if (request.maxZoom) {
        insertParams['maximum_zoom'] = request.maxZoom;
      }
      if (request.archiveFormat) {
        insertParams['archive_type'] = escapeLiteral(request.archiveFormat);
      }
      if (request.tileType) {
        insertParams['format'] = escapeLiteral(request.tileType);
      }
      if (request.audience) {
        insertParams['audience'] = escapeLiteral(request.audience);
      }
      if (request.creatingUserId) {
        insertParams['created_by'] = request.creatingUserId;
      }
      if (request.expires) {
        insertParams['expires'] = escapeLiteral(request.expires);
      }

      const entries = Object.entries(insertParams);

      let sql;

      if (entries.length == 0) {
        // they specified nothing, insert defaults
        sql = SQL`insert into map_generation_request default
                  values
                  returning id`;
      } else {
        const columns = entries.map((entry) => escapeIdentifier(entry[0])).join(', ');
        const values = entries.map((entry) => entry[1]).join(', ');
        sql = SQL`insert into map_generation_request (`
          .append(columns)
          .append(') values ')
          .append(' (')
          .append(values)
          .append(') returning id');
      }
      const result = await db.query(sql.text, sql.values);

      const id = result.rows.length > 0 ? result.rows[0].id : undefined;

      if (!id) {
        throw new Error('unable to insert map generation request');
      }

      if (request.vectorGenerationMode) {
        const stmt = SQL`insert into vector_data_source(generation_request, mode)
                         values (${id}, ${request.vectorGenerationMode})
                         returning id`;

        const vdsResult = await db.query(stmt.text, stmt.values);
        const vdsId = vdsResult.rows.length > 0 ? parseInt(vdsResult.rows[0].id) : undefined;

        if (request.idList && request.vectorGenerationMode === 'IDLIST') {
          for (const id of request.idList) {
            const idBindingSQL = SQL`insert into vector_data_source_activity_id(vector_data_source, activity_incoming_data_id)
                                     values (${vdsId}, ${id})`;
            await db.query(idBindingSQL.text, idBindingSQL.values);
          }
        }
      }

      return id;
    } catch (e) {
      defaultLog.error({ message: 'Error creating map generation request', error: e });
      rollback = true;
      throw e;
    } finally {
      if (rollback) {
        await db.query('ROLLBACK');
      } else {
        await db.query('COMMIT');
      }
    }
  }

  public static async listRequests(user_id: number): Promise<MapGenerationRequest[]> {
    const db = await getDBConnection();
    const result = await db.query(
      //language=PostgreSQL
      `SELECT mgr.*,
              ST_XMAX(mgr.bbox::geometry)             as bbox_maxx,
              ST_XMIN(mgr.bbox::geometry)             as bbox_minx,
              ST_YMAX(mgr.bbox::geometry)             as bbox_maxy,
              ST_YMIN(mgr.bbox::geometry)             as bbox_miny,
              u.preferred_username                    as created_by_username,
              vds.mode                                as vector_generation_mode,
              (select array_agg(map.activity_incoming_data_id)
               from vector_data_source_activity_id map
               where map.vector_data_source = vds.id) as idlist
       from map_generation_request mgr
              left outer join application_user u
                              on u.user_id = mgr.created_by -- created_by is nullable (for eg, cron-generated maps)
              left outer join vector_data_source vds on vds.generation_request = mgr.id
       where (mgr.created_by = $1 or mgr.audience = 'PUBLIC')
       order by mgr.created desc
      `,
      [user_id]
    );
    return [result.rows.map((row) => MapGenerationService.mapRowToDTO(row))];
  }

  public static async getRequest(id: string, user_id: number): Promise<MapGenerationRequest> {
    const db = await getDBConnection();
    const result = await db.query(
      //language=PostgreSQL
      `SELECT mgr.*,
              ST_XMAX(mgr.bbox::geometry)             as bbox_maxx,
              ST_XMIN(mgr.bbox::geometry)             as bbox_minx,
              ST_YMAX(mgr.bbox::geometry)             as bbox_maxy,
              ST_YMIN(mgr.bbox::geometry)             as bbox_miny,
              u.preferred_username                    as created_by_username,
              vds.mode                                as vector_generation_mode,
              (select array_agg(map.activity_incoming_data_id)
               from vector_data_source_activity_id map
               where map.vector_data_source = vds.id) as idlist
       from map_generation_request mgr
              left outer join application_user u
                              on u.user_id = mgr.created_by -- created_by is nullable (for eg, cron-generated maps)
              left outer join vector_data_source vds on vds.generation_request = mgr.id
       where mgr.id = $1
         and (mgr.created_by = $2 or mgr.audience = 'PUBLIC')`,
      [id, user_id]
    );

    if (result.rows.length !== 1) {
      throw new Error('generation request not found not found');
    }

    return MapGenerationService.mapRowToDTO(result.rows[0]);
  }

  public static async bindIDsToRequest(
    mapRequestID: string,
    activityIncomingDataIds: number[],
    user_id: number
  ): Promise<void> {
    const db = await getDBConnection();
    let rollback = false;
    db.query('BEGIN TRANSACTION');
    try {
      for (const id of activityIncomingDataIds) {
        const idBindingSQL = SQL`with sq as (select mgr.id         as mgr_id,
                                                    mgr.created_by as user_id,
                                                    vds.id         as vgs_id,
                                                    vds.mode       as vds_mode
                                             from vector_data_source vds,
                                                  map_generation_request mgr
                                             where mgr.id = ${mapRequestID}
                                               and vds.generation_request = mgr.id)
                                 insert
                                 into vector_data_source_activity_id (vector_data_source, activity_incoming_data_id)
                                 select sq.vgs_id, ${id}
                                 from sq
                                 where sq.vds_mode = 'IDLIST'
                                   and sq.user_id = ${user_id}`;

        await db.query(idBindingSQL.text, idBindingSQL.values);
      }
    } catch (e) {
      defaultLog.error({ message: 'Error binding IDs to map request', error: e });
      rollback = true;
      throw e;
    } finally {
      if (rollback) {
        await db.query('ROLLBACK');
      } else {
        await db.query('COMMIT');
      }
    }
  }

  public static async processRequest(_id: string): Promise<void> {
    throw new Error('not implemented');
  }

  private static mapRowToDTO(row): MapGenerationRequest | VectorMapGenerationRequest {
    const mapped: MapGenerationRequest | VectorMapGenerationRequest = {
      id: row['id'],
      minZoom: row['minimum_zoom'],
      maxZoom: row['maximum_zoom'],
      archiveFormat: row['archive_type'],
      tileType: row['formnat'],
      expires: row['expires'],
      status: row['status'],
      bbox: {
        minX: row['bbox_minx'],
        maxX: row['bbox_maxx'],
        minY: row['bbox_miny'],
        maxY: row['bbox_maxy']
      },
      audience: row['audience'],
      created: row['created'],
      updated: row['updated'],
      createdBy: {
        username: row['created_by_username'],
        id: row['created_by']
      }
    };

    if (row['vector_generation_mode'] !== null) {
      (mapped as VectorMapGenerationRequest).mode = row['vector_generation_mode'];
    }
    if (row['idlist'] !== null) {
      (mapped as VectorMapGenerationRequest).idList = row['idlist'];
    }

    return mapped;
  }

  private static async updateRequestStatus(id: string, newStatus: Status): Promise<void> {
    const db = await getDBConnection();
    const stmt = SQL`update map_generation_request
                     set status = ${newStatus}
                     where id = ${id}`;
    await db.query(stmt.text, stmt.values);
  }
}

export { MapGenerationService, MapGenerationValueLiterals };
export type { MapGenerationRequest, MapGenerationRequestCreationRequest };
