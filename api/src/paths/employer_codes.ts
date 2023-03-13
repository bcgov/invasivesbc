'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { SQLStatement } from 'sql-template-strings';
import { getEmployerCodesSQL } from '../queries/code-queries';
// import { getEmployers, getFundingAgencies } from '../utils/code-utils';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';
const namespace = 'employer-codes';

export const GET: Operation = [getEmployerCodes()];

GET.apiDoc = {
  description: 'Fetches employer codes',
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

function getEmployerCodes(): RequestHandler {
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
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getEmployerCodesSQL();
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);

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
        message: 'Successfully fetched employer codes',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace,
        code: 200
      });
    } finally {
      connection.release();
    }
  };
}
