'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getPointsOfInterestSQL } from '../queries/point-of-interest-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('point-of-interest');

export const POST: Operation = [getPointsOfInterestBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all ponts of interest based on search criteria.',
  tags: ['point-of-interest'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Points Of Interest search filter criteria object.',
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
            point_of_interest_type: {
              type: 'string'
            },
            point_of_interest_subtype: {
              type: 'string'
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
              ...geoJSON_Feature_Schema
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Point Of Interest get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                // Don't specify exact response, as it will vary, and is not currently enforced anyways
                // Eventually this could be updated to be a oneOf list, similar to the Post request below.
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
 * Fetches all point-of-interest records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getPointsOfInterestBySearchFilterCriteria(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'point-of-interest',
      message: 'getPointsOfInterestBySearchFilterCriteria',
      body: req.body
    });

    const sanitizedSearchCriteria = new PointOfInterestSearchCriteria(req.body);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getPointsOfInterestSQL(sanitizedSearchCriteria);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = (response && response.rows) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getPointsOfInterestBySearchFilterCriteria', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
