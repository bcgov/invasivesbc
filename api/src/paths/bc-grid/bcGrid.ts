'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../../constants/misc';
import { getDBConnection } from '../../database/db';
import { getOverlappingBCGridCellsSQL } from '../../queries/activity-queries';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('bc-grid/bcGrid');

export const POST: Operation = [getOverlapingBCGridCells()];

POST.apiDoc = {
  description: 'Fetches grid cells of bc grid that overlap given geometry.',
  tags: ['bcGrid'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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
  return async (req, res, next) => {
    defaultLog.debug({ label: 'bcGrid', message: 'getOverlapingBCGridCells', body: req.body });

    const geometry = req.body.geometry;
    const largeGrid = req.body.largeGrid;
    const largeGrid_item_ids = req.body.largeGrid_item_ids;

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getOverlappingBCGridCellsSQL(geometry, largeGrid, largeGrid_item_ids);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      if (response.rows) {
        return res.status(200).json(response.rows);
      } else {
        return res.status(500).json({});
      }
    } catch (error) {
      defaultLog.debug({ label: 'getOverlappingBCGridCells', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
