'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { ActivitySearchCriteria } from '../models/activity';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getActivitiesSQL, deleteActivitiesSQL } from '../queries/activity-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('activity');

export const POST: Operation = [getActivitiesBySearchFilterCriteria()];

export const DELETE: Operation = [deleteActivitiesByIds()];

POST.apiDoc = {
  description: 'Fetches all activities based on search criteria.',
  tags: ['activity'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Activities search filter criteria object.',
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
              default: 25,
              minimum: 0,
              maximum: 100
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
            search_feature: {
              ...(geoJSON_Feature_Schema as any)
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

DELETE.apiDoc = {
  description: 'Soft-deletes all activities based on a list of ids.',
  tags: ['activity'],
  security: [
    {
      Bearer: ALL_ROLES // TODO make admin only
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'id',
      required: true
    }
  ],
  requestBody: {
    description: 'Activities search filter criteria object.',
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
      description: 'Count of modified activities',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
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
  return async (req, res) => {
    defaultLog.debug({ label: 'activity', message: 'getActivitiesBySearchFilterCriteria', body: req.body });

    const sanitizedSearchCriteria = new ActivitySearchCriteria(req.body);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getActivitiesSQL(sanitizedSearchCriteria);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows = { rows: (response && response.rows) || [] };

      // parse the count from the response
      const count = { count: rows.rows.length && rows.rows[0]['total_rows_count'] } || {};

      // build the return object
      const result = { ...rows, ...count };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'error', error });
      throw error;
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
      throw {
        status: 400,
        message: 'Activity ids must be supplied'
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
      const sqlStatement: SQLStatement = deleteActivitiesSQL(ids);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = { count: (response && response.rowCount) || 0 };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'deleteActivitiesByIds', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
