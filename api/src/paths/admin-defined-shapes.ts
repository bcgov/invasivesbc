'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../database/db';
import { getLogger } from '../utils/logger';
import { SQLStatement } from 'sql-template-strings';
import { getAdministrativelyDefinedShapesSQL } from '../queries/admin-defined-shapes';

const defaultLog = getLogger('admin-defined-shapes');

export const GET: Operation = [getAdministrativelyDefinedShapes()];

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

/**
 * Fetches all visible administratively-defined shapes as a single GeoJSON FeatureCollection
 *
 * @return {RequestHandler}
 */
function getAdministrativelyDefinedShapes(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getAdministrativelyDefinedShapesSQL();

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

      return res.status(200).json(rows[0].geojson);
    } catch (error) {
      defaultLog.debug({ label: 'getAdministrativelyDefinedShapes', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
