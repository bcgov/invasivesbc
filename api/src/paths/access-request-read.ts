'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getAccessRequestForUserSQL } from '../queries/access-request-queries';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';

const namespace = 'access-request-read';

export const POST: Operation = [getAccessRequestData()];

POST.apiDoc = {
  description: 'Get access request record.',
  tags: [namespace],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Access request post request object.',
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
      description: 'Access request post response object.',
      content: {
        'application/json': {
          schema: {
            properties: {}
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
 * Get access request data
 */
function getAccessRequestData(): RequestHandler {
  return async (req, res) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    const connection = await getDBConnection();
    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace,
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getAccessRequestForUserSQL(req.body.username, req.body.email);
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
      if (!sqlStatement) {
        logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
        return res.status(400).json({
          message: 'Invalid request',
          request: req.body,
          namespace,
          code: 400
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      const haveRows = response.rows.length > 0;
      const resMsg = haveRows ? 'Got access request for user' : 'No access request for user';
      logData()(namespace,logMetrics.SQL_RESULTS,`${resMsg}\n${response}`);
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
      if (haveRows) {
        return res.status(200).json({
          message: resMsg,
          code: 200,
          namespace,
          result: response.rows[0]
        });
      } else {
        return res.status(200).json({
          message: resMsg,
          code: 200,
          namespace,
          result: {}
        });
      }
    } catch (error) {
      logErr()(namespace,`Error on read\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Database encountered an error',
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
