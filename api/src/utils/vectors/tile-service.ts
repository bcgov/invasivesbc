import { getDBConnection } from 'database/db';
import { getActivitiesSQLv2 } from 'paths/v2/activities';
import { getIAPPSQLv2 } from 'paths/v2/iapp';
import { getPublicMapTileQuery } from 'queries/public-map';

export interface TileService {
  tile(source: string, filterObj): Promise<Buffer>;
}

export const PostgresTileService: TileService = {
  async tile(source, filterObj: any): Promise<Buffer> {
    const connection = await getDBConnection();

    try {
      switch (source) {
        case 'iapp': {
          let { text, values } = getIAPPSQLv2(filterObj);
          return Buffer.from((await connection.query(text, values)).rows[0].data);
        }
        case 'activities': {
          let { text, values } = getActivitiesSQLv2(filterObj);
          return Buffer.from((await connection.query(text, values)).rows[0].data);
        }
        case 'public': {
          let { text, values } = getPublicMapTileQuery(filterObj);
          return Buffer.from((await connection.query(text, values)).rows[0].data);
        }
        default:
          return null;
      }
    } finally {
      connection.release();
    }
  }
};
