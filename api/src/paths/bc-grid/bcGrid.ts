import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc.js';
import { getDBConnection } from '../../database/db.js';
import { getOverlappingBCGridCellsSQL } from '../../queries/activity-queries.js';
import { getLogger } from '../../utils/logger.js';

const defaultLog = getLogger('bc-grid');

export const POST: Operation = [getOverlapingBCGridCells()];

POST.apiDoc = {
  description: 'Fetches grid cells of bc grid that overlap given geometry.',
  tags: ['bcGrid'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Geometry post request object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            geometry: {
              type: 'string',
              title: 'geometry'
            },
            largeGrid: {
              type: 'string',
              title: 'largeGrid'
            },
            largeGrid_item_ids: {
              type: 'array',
              title: 'largeGrid_item_ids',
              items: {
                type: 'number'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'BC-Grid get response grid cells object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              // Don't specify exact response, as it will vary, and is not currently enforced anyways
              // Eventually this could be updated to be a oneOf list, similar to the Post request below.
            }
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
 * Fetches a single activity record based on its primary key.
 *
 * @return {RequestHandler}
 */
export function getOverlapingBCGridCells(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'bcGrid', message: 'getOverlapingBCGridCells', body: req.body });

    const geometry = req.body.geometry;
    const largeGrid = req.body.largeGrid;
    const largeGrid_item_ids = req.body.largeGrid_item_ids;

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'bc-grid/bcGrid',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getOverlappingBCGridCellsSQL(geometry, largeGrid, largeGrid_item_ids);

      if (!sqlStatement) {
        return res.status(500).json({
          message: 'SQL statement could not be generated.',
          request: req.body,
          namespace: 'bc-grid/bcGrid',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'Successfully fetched overlapping grid cells.',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'bc-grid/bcGrid',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'getOverlappingBCGridCells', message: 'error', error });
      return res.status(500).json({
        message: 'Unable to fetch overlapping grid cells.',
        request: req.body,
        error: error,
        namespace: 'bc-grid/bcGrid',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
