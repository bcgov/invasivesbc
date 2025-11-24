import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import SQL from 'sql-template-strings';
import { ALL_ROLES } from 'constants/misc';
import { InvasivesRequest } from 'utils/auth-utils';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import OpenAPISpec from 'utils/OpenAPISpec';
import QueryHandler from 'utils/endpoints/QueryHandler';

const NAMESPACE = 'nts-grid';
const logger = new LoggerHandler(NAMESPACE);
const POST: Operation = [postHandler()];

new OpenAPISpec('Fetch NTS 50k grid references for specified geometry', [NAMESPACE])
  .security(ALL_ROLES)
  .requestBody({
    description: 'Recordset search filter criteria',
    content: {
      'application/json': {
        schema: {
          properties: {
            geojson: {
              type: 'object'
            }
          }
        }
      }
    }
  })
  .response(200, {
    description: 'Array of grid squares covered by specified geometry',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          elements: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              geometry: { type: 'object' },
              bbox: { type: 'object' }
            }
          }
        }
      }
    }
  })
  .build(POST);

/**
 * @desc Return the NTS 50k grid tiles intersected by the supplied geometry
 */
function postHandler(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const db = new QueryHandler();

    try {
      logger.verbose('[postHandler]', { body: req.body });
      if (!req.body?.geometry) {
        return res.status(400).send('No geometry object provided');
      }

      const geostring = JSON.stringify(req.body.geometry);

      const query = SQL`SELECT g.map_tile                                       as name,
                               st_asgeojson(st_extent(g.geog::geometry))::jsonb as bbox,
                               st_asgeojson(g.geog)::jsonb                      as geometry
                        FROM nts_50k_grid g
                        where st_intersects(g.geog, st_geomfromgeojson(${geostring}))
                        group by g.map_tile, g.geog
                        order by g.map_tile asc`;

      const response = await db.query(query);

      return res.status(200).json(response.rows);
    } catch (e) {
      logger.error(e, NAMESPACE);
      return res.sendStatus(500);
    }
  };
}

export { POST };
