import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { InvasivesRequest } from '../utils/auth-utils.js';
import { ALL_ROLES, SEARCH_LIMIT_MAX, SEARCH_LIMIT_DEFAULT, SECURITY_ON } from '../constants/misc.js';
import { getDBConnection } from '../database/db.js';
import { ActivitySearchCriteria } from '../models/activity.js';
import { geoJSON_Feature_Schema } from '@bcgov/invasivesbci-shared';
import { getActivitiesSQL, deleteActivitiesSQL } from '../queries/activity-queries.js';
import { getLogger } from '../utils/logger.js';
import { getS3SignedURL } from '../utils/file-utils.js';

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
    description: 'Activities lean search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            page: {
              type: 'number',
              default: 0,
              minimum: 0
            },
            limit: {
              type: 'number',
              default: SEARCH_LIMIT_DEFAULT,
              minimum: 0,
              maximum: SEARCH_LIMIT_MAX
            },
            sort_by: {
              type: 'string'
            },
            sort_direction: {
              type: 'string',
              enum: ['ASC', 'DESC']
            },
            activity_type: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            activity_subtype: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            date_range_start: {
              type: 'string',
              description: 'Date range start, in YYYY-MM-DD format. Defaults time to start of day.',
              example: '2020-07-30'
            },
            date_range_end: {
              type: 'string',
              description: 'Date range end, in YYYY-MM-DD format. Defaults time to end of day.',
              example: '2020-08-30'
            },
            activity_ids: {
              type: 'array',
              description: 'A list of ids to limit results to',
              items: {
                type: 'string'
              }
            },
            search_feature: {
              type: 'object',
              description: 'Shape feature collection to filter by',
              properties: {
                type: {
                  type: 'string'
                },
                features: {
                  type: 'array',
                  items: {
                    ...(geoJSON_Feature_Schema as any)
                  }
                }
              }
            },
            column_names: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  },
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
  return async (req: InvasivesRequest, res) => {
    const authContext = (req as any)?.authContext;
    const isAuth = authContext?.user;

    defaultLog.debug({
      label: 'activity',
      message: 'getActivitiesBySearchFilterCriteria',
      body: req.body
    });

    const roleName = authContext.roles[0]?.role_name;
    const sanitizedSearchCriteria = new ActivitySearchCriteria(req.body);

    if (!isAuth || !roleName || roleName.includes('animal')) {
      sanitizedSearchCriteria.hideTreatmentsAndMonitoring = true;
    } else {
      sanitizedSearchCriteria.hideTreatmentsAndMonitoring = false;
    }

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'activities-lean',
        code: 503
      });
    }

    try {
      if (sanitizedSearchCriteria.s3SignedUrlRequest) {
        const signedURL = await getS3SignedURL('activities_private_geojson.json');
        return res.status(200).json({ signedURL: signedURL });
      }
      const sqlStatement: SQLStatement = getActivitiesSQL(sanitizedSearchCriteria, true, isAuth);

      // Check for sql and role:

      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Error generating SQL statement',
          request: req.body,
          namespace: 'activities-lean',
          code: 500
        });
      }

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

/**
 * Soft-deletes all activity records based on a list of ids.
 *
 * @return {RequestHandler}
 */
function deleteActivitiesByIds(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'activity', message: 'deleteActivitiesByIds', body: req.body });

    const ids = Object.values(req.query.id) as string[];

    if (!ids || !ids.length) {
      return res
        .status(400)
        .json({ message: 'No ids provided', request: req.body, namespace: 'activities-lean', code: 400 });
    }

    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'activities-lean',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = deleteActivitiesSQL(ids);

      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Error generating SQL statement',
          request: req.body,
          namespace: 'activities-lean',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'Deleted activities by ids',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'activities-lean',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'deleteActivitiesByIds', message: 'error', error });
      return res.status(500).json({
        message: 'Error deleting activities by ids',
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
