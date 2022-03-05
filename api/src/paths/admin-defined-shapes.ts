'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../database/db';
import { getLogger } from '../utils/logger';
import { SQLStatement } from 'sql-template-strings';
import { getAdministrativelyDefinedShapesSQL } from '../queries/admin-defined-shapes';
import { atob } from 'js-base64';
import { QueryResult } from 'pg';
import { FeatureCollection } from 'geojson';
import { GeoJSONFromKML, KMZToKML, sanitizeGeoJSON } from '../utils/kml-import';

const defaultLog = getLogger('admin-defined-shapes');

export const GET: Operation = [getAdministrativelyDefinedShapes()];
export const POST: Operation = [uploadShape()];

GET.apiDoc = {
  description: 'Fetches a GeoJSON object to display boundaries of administratively-defined shapes (KML uploads)',
  responses: {
    200: {
      description: 'GeoJSON FeatureCollection',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {}
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

POST.apiDoc = {
  description: 'Creates new Administratively-defined shapes from KML/KMZ data',
  requestBody: {
    description: 'Uploaded KML/KMZ file',
    content: {
      'application/json': {
        schema: {
          description: 'Uploaded KML/KMZ file',
          type: 'object',
          properties: {
            type: {
              enum: ['kml', 'kmz'],
              type: 'string'
            },
            data: {
              description: 'base64-encoded binary data',
              type: 'string'
            }
          }
        }
      }
    }
  },
  responses: {
    400: {
      $ref: '#/components/responses/401'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Fetches all visible administratively-defined shapes as a single GeoJSON FeatureCollection
 *
 * @return {RequestHandler}
 */
function getAdministrativelyDefinedShapes(): RequestHandler {
  return async (req, res) => {
    const user_id = req.query.user_id.toString();

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getAdministrativelyDefinedShapesSQL(user_id);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows: any[] = (response && response.rows) || [];

      if (rows.length !== 1) {
        defaultLog.debug({
          label: 'getAdministrativelyDefinedShapes',
          message: 'error',
          error: `Unexpected row count ${rows.length} for aggregate query`
        });
      }

      return res.status(200).json(rows);
    } catch (error) {
      defaultLog.debug({ label: 'getAdministrativelyDefinedShapes', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Creates new administratively defined shape from KML or KMZ data
 *
 * @returns {RequestHandler}
 */
function uploadShape(): RequestHandler {
  return async (req, res) => {
    const data = { ...req.body };
    const user_id = data.user_id;
    const title = data.title;
    let geoJSON: FeatureCollection;

    try {
      switch (data.type) {
        case 'kmz':
          geoJSON = sanitizeGeoJSON(GeoJSONFromKML(KMZToKML(Buffer.from(data['data'], 'base64'))));
          break;
        case 'kml':
          geoJSON = sanitizeGeoJSON(GeoJSONFromKML(Buffer.from(data['data'], 'base64')));
          break;
        default:
          throw {
            status: 400,
            message: `Unrecognized type ${data.type}`
          };
      }
    } catch (err) {
      defaultLog.error(err);
      throw {
        status: 400,
        message: 'Error parsing KML/KMZ data'
      };
    }

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      try {
        // Perform both get and create operations as a single transaction
        await connection.query('BEGIN');

        for (const feature of geoJSON.features) {
          const response: QueryResult = await connection.query(
            `insert into admin_defined_shapes (geog, created_by, title)
             values (ST_Force2D(ST_GeomFromGeoJSON($1)), $2, $3) returning id`,
            [JSON.stringify(feature.geometry), user_id, title]
          );
        }

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        defaultLog.error(error);
        throw error;
      }
    } finally {
      connection.release();
    }

    return res.status(201).json({ status: 200 });
  };
}
