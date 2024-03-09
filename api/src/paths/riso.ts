'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { RISOSearchCriteria } from '../models/riso';
import geoJSON_Feature_Schema from 'sharedAPI/src/openapi/geojson-feature-doc.json';
import { getRISOsSQL } from '../queries/riso-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('risos');

export const POST: Operation = [getRISOsBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all RISOs based on search criteria.',
  tags: ['risos'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'RISOs search filter criteria object.',
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
      description: 'RISO get response object array.',
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
 * @returns {RequestHandler}
 */
function getRISOsBySearchFilterCriteria(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'riso',
      message: 'getRISOsBySearchFilterCriteria',
      body: req.body
    });

    const sanitizedSearchCriteria = new RISOSearchCriteria(req.body);
    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'riso',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getRISOsSQL(sanitizedSearchCriteria);

      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Unable to generate SQL statement.',
          request: req.body,
          namespace: 'riso',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'Got RISOs',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'riso',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'getRISOsBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Error fetching RISOs',
        request: req.body,
        error: error,
        namespace: 'riso',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
