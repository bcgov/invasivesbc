'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { JurisdictionSearchCriteria } from '../models/jurisdiction';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getJurisdictionsSQL } from '../queries/jurisdiction-queries';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';

const namespace = 'jurisdictions';

export const POST: Operation = [getJurisdictionsBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all jurisdictions based on search criteria.',
  tags: [namespace],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
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
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    const sanitizedSearchCriteria = new JurisdictionSearchCriteria(req.body);
    const connection = await getDBConnection();

    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace,
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getJurisdictionsSQL(sanitizedSearchCriteria);
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
      logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
      if (!sqlStatement) {
        logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
        return res.status(500).json({
          error: 'Failed to generate SQL statement',
          request: req.body,
          namespace,
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      logData()(namespace,logMetrics.SQL_RESULTS,response);
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
      return res.status(200).json({
        message: 'Got jurisdictions by search filter criteria',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace,
        code: 200
      });
    } catch (error) {
      logErr()(namespace,`Error getting jurisdictions by search filter criteria\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Failed to get jurisdictions by search filter criteria',
        request: req.body,
        error: error,
        namespace,
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
