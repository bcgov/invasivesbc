import { getDBConnection } from 'database/db';

export interface TileService {
  tile(source: string, z: number, x: number, y: number, user_id?: string | null, query?: any): Promise<Buffer>;
}

export const PostgresTileService: TileService = {
  async tile(source, z, x, y, user_id?: string | null, query?: any): Promise<Buffer> {
    const connection = await getDBConnection();

    try {
      switch (source) {
        case 'iapp':
          return Buffer.from((await connection.query(
            ` WITH mvtgeom AS
                       (SELECT ST_AsMVTGeom(ST_Transform(geog::geometry, 3857),
                                            ST_TileEnvelope($1, $2, $3), extent => 4096,
                                            buffer => 64) AS geom,
                               site_id                    as feature_id,
                               reported_area
                               -- can include whatever other properties are needed in this query also and they will be added as attributes
                        FROM iapp_site_summary_and_geojson
                        WHERE (position($4::text IN agencies)) > 0 -- or whatever query you want to filter by
                          AND ST_Transform(geog::geometry, 3857) && ST_TileEnvelope($1, $2, $3))
              SELECT ST_AsMVT(mvtgeom.*, 'data', 4096, 'geom', 'feature_id') as data
              FROM mvtgeom;
            `
            ,
            [z, x, y, query['agency']])).rows[0].data);
        default:
          return null;
      }

    } finally {
      connection.release();
    }

  }
};
