'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { SQLStatement } from 'sql-template-strings';
import { getFundingAgencyCodesSQL } from '../queries/code-queries';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';
// import { getEmployers, getFundingAgencies } from '../utils/code-utils';
const namespace = 'agency-codes';
export const GET: Operation = [getAgencyCodes()];

GET.apiDoc = {
  description: 'Fetches agency codes',
  tags: [namespace],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  parameters: [],
  responses: {
    200: {
      description: 'Users get response object array.',
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

function getAgencyCodes(): RequestHandler {
  return async (req, res) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    const connection = await getDBConnection();
    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace,
        code: '503'
      });
    }

    try {
      const sqlStatement: SQLStatement = getFundingAgencyCodesSQL();
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
      logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);

      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      logData()(namespace,logMetrics.SQL_RESULTS,response);
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);

      return res.status(200).json({
        message: 'Successfully fetched agency codes',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace,
        code: '200'
      });
    } finally {
      connection.release();
    }
  };
}
