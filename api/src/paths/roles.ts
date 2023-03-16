'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getAllRolesSQL } from '../queries/role-queries';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';

const namespace = 'roles';

export const GET: Operation = [getRoles()];

GET.apiDoc = {
  description: 'Get some information about users and their roles',
  tags: [namespace],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  responses: {
    200: {
      description: 'User Acccess get response object array.',
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

// Fetch list of roles from db
//
// @return {RequestHandler}
//
function getRoles(): RequestHandler {
  return async (req, res, next) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);
    const connection = await getDBConnection();
    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        error: 'Database connection unavailable.',
        request: req.body,
        namespace,
        code: 503
      });
    }
    try {
      const sqlStatement: SQLStatement = getAllRolesSQL();
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
      logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
      if (!sqlStatement) {
        logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);return res.status(500).json({
          message: 'Unable to generate SQL statement.',
          request: req.body,
          namespace,
          code: 500
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      logData()(namespace,logMetrics.SQL_RESULTS,response);
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
      return res.status(200).json({
        message: 'Successfully retrieved roles.',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace,
        code: 200
      });
    } catch (error) {
      logErr()(namespace,`Error getting roles\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Error fetching roles.',
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
