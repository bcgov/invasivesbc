'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { JurisdictionSearchCriteria } from '../models/jurisdiction';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getJurisdictionsSQL } from '../queries/jurisdiction-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('jurisdictions');

export const POST: Operation = [getJurisdictionsBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all jurisdictions based on search criteria.',
  tags: ['jurisdictions'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Jurisdictions search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            search_feature: {
              ...(geoJSON_Feature_Schema as any)
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Jurisdiction get response object array.',
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
 * Fetches all jurisdiction records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getJurisdictionsBySearchFilterCriteria(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'jurisdictions',
      message: 'getJurisdictionsBySearchFilterCriteria',
      body: req.body
    });

    const sanitizedSearchCriteria = new JurisdictionSearchCriteria(req.body);
    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getJurisdictionsSQL(sanitizedSearchCriteria);

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
      const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};

      // build the return object
      const result = { ...rows, ...count };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getJurisdictionsBySearchFilterCriteria', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
