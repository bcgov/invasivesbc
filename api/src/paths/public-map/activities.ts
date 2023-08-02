'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { InvasivesRequest } from 'utils/auth-utils';
import { getDBConnection } from '../../database/db';
import { getLogger } from '../../utils/logger';
import { getPublicActivitiesSQL } from '../../queries/public-queries';

const defaultLog = getLogger('activity');

export const GET: Operation = [getPublicActivities()];

GET.apiDoc = {
  description: 'Fetches all activities based on search criteria.',
  tags: ['activity'],
  security: [],
  responses: {
    200: {
      description: 'Activities lean get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rows: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      // Don't specify exact object properties, as it will vary, and is not currently enforced anyways
                      // Eventually this could be updated to be a oneOf list, similar to the Post request below.
                    }
                  }
                },
                count: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
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
 * Fetches all activity records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getPublicActivities(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'public',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getPublicActivitiesSQL();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows = { rows: (response && response.rows) || [] };

      // parse the count from the response
      const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};

      defaultLog.info({
        label: 'activities-lean',
        message: 'response',
        body: count
      });

      return res.status(200).json({
        message: 'Got activities by search filter criteria',
        request: req.body,
        result: rows,
        count: count,
        namespace: 'activities-lean',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Error getting activities by search filter criteria',
        error: error,
        request: req.body,
        namespace: 'activities-lean',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
