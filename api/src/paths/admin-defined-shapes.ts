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
import {InvasivesRequest} from "../utils/auth-utils";
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';

const defaultLog = getLogger('admin-defined-shapes');

export const GET: Operation = [getAdministrativelyDefinedShapes()];
export const POST: Operation = [uploadShape()];

GET.apiDoc = {
  description: 'Fetches a GeoJSON object to display boundaries of administratively-defined shapes (KML uploads)',
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
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
  return async (req: InvasivesRequest, res) => {
    const user_id = req.authContext.user.user_id;

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        error: 'Failed to establish database connection',
        request: req.body,
        namespace: 'admin-defined-shapes',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getAdministrativelyDefinedShapesSQL(user_id);

      if (!sqlStatement) {
        return res.status(500).json({
          error: 'Failed to generate SQL statement',
          request: req.body,
          namespace: 'admin-defined-shapes',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows: any[] = (response && response.rows) || [];

      // terrible nesting, but returned KMLs should be a small set so should be fine for now
      for (const row of rows) {
        let newFeatureArr = [];
        for (const feature of row.geojson.features) {
          for (const multipolygon of feature.coordinates) {
            let convertedFeature = {
              'type': 'Feature',
              "properties": {},
              "geometry": {
                "type": 'Polygon',
                'coordinates' : multipolygon
              }
            };

            newFeatureArr.push(convertedFeature);
          }
        }
        row.geojson.features = newFeatureArr;
      }

      return res.status(200).json({
        message: 'Got administratively defined shapes',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'admin-defined-shapes',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'getAdministrativelyDefinedShapes', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to get administratively defined shapes',
        request: req.body,
        error: error,
        namespace: 'admin-defined-shapes',
        code: 500
      });
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
          return res.status(400).json({
            message: `Unrecognized type ${data.type}`,
            request: req.body,
            namespace: 'admin-defined-shapes',
            code: 400
          });
      }
    } catch (err) {
      defaultLog.error(err);
      return res.status(500).json({
        message: 'Error parsing KML/KMZ data',
        request: req.body,
        namespace: 'admin-defined-shapes',
        code: 500
      });
    }

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(500).json({
        message: 'Failed to establish database connection',
        request: req.body,
        namespace: 'admin-defined-shapes',
        code: 500
      });
    }

    try {
      try {
        // Perform both get and create operations as a single transaction
        await connection.query('BEGIN');

        const response: QueryResult = await connection.query(`insert into invasivesbc.admin_defined_shapes (geog, created_by, title)
          SELECT ST_COLLECT(array_agg(
            ST_GeomFromGeoJSON(feat->>'geometry') )) AS geog, $2, $3 FROM (
              SELECT json_array_elements($1::json->'features') AS feat) AS f;`, [JSON.stringify(geoJSON), user_id, title]);

        await connection.query('COMMIT');

        return res.status(201).json({
          message: 'Created administratively defined shape',
          request: req.body,
          namespace: 'admin-defined-shapes',
          code: 201
        });
      } catch (error) {
        await connection.query('ROLLBACK');
        defaultLog.error(error);
        return res.status(500).json({
          message: 'Failed to create administratively defined shape',
          request: req.body,
          error: error,
          namespace: 'admin-defined-shapes',
          code: 500
        });
      }
    } finally {
      connection.release();
    }
  };
}
