import { getuid } from 'process';
import { Operation } from 'express-openapi';
import { RequestHandler } from 'express';
import { getLogger } from 'utils/logger';
import { streamActivitiesResult } from 'utils/iapp-json-utils';
import { getDBConnection } from 'database/db';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { InvasivesRequest } from 'utils/auth-utils';
import { getActivitiesSQLv2, sanitizeActivityFilterObject } from 'queries/activities-v2-queries';

const defaultLog = getLogger('activity');

export const POST: Operation = [getActivitiesBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all activities based on search criteria.',
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Activities Request Object',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Activity get response object array.',
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
    304: {
      $ref: '#/components/responses/304'
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
 * Fetches all activity records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getActivitiesBySearchFilterCriteria(): RequestHandler {
  const reqID = getuid();
  return async (req: InvasivesRequest, res) => {
    if (req.authContext.roles.length === 0) {
      res.status(401).json({ message: 'No Role for user' });
    }

    const rawBodyCriteria = req.body['filterObjects'];
    const filterObject = sanitizeActivityFilterObject(rawBodyCriteria?.[0], req);
    defaultLog.debug({ label: 'v2/activity', message: 'getActivitiesBySearchFilterCriteria v2', body: '' });

    let connection;
    let sql;

    try {
      connection = await getDBConnection();
      if (!connection) {
        defaultLog.error({
          label: 'v2/activity',
          message: 'getActivitiesBySearchFilterCriteria',
          body: 'reqID:' + reqID + ' - ' + 'Database connection unavailable'
        });
        return res.status(503).json({ message: 'Database connection unavailable', namespace: 'activities', code: 503 });
      }

      sql = getActivitiesSQLv2(filterObject);

      if (filterObject.isCSV && filterObject.CSVType) {
        res.status(200);
        await streamActivitiesResult(filterObject, res, sql);
      } else {
        const response = await connection.query(sql.text, sql.values);

        return res.status(200).json({
          message: 'fetched activities by criteria',
          request: req.body,
          result: response.rows,
          count: response.rowCount,
          namespace: 'activities',
          code: 200
        });
      }
    } catch (error) {
      defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Error getting activities by search filter criteria',
        error,
        namespace: 'v2/activities',
        code: 500
      });
    } finally {
      connection?.release();
    }
  };
}
