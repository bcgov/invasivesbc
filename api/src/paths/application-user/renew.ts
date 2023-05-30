'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { renewUserSQL } from '../../queries/user-queries';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { getDBConnection } from '../../database/db';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('activity/{activityId}');

export const POST: Operation = [renewUser()];

POST.apiDoc = {
  description: 'Renew a user',
  tags: ['users'],
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
      description: 'User renew POST response object array.',
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

function renewUser(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({ message: 'Database connection unavailable', request: req.body, code: 503 });
    }
    try {
      const userId = req.query.userId.toString();
      const sqlStatement: SQLStatement = renewUserSQL(userId);
      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to generate SQL statement',
          request: req.body,
          namespace: 'application-user/renew',
          code: 500
        });
      }
      const result = await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json({
        message: 'User renewed',
        request: req.body,
        result: result.rows,
        count: result.rowCount,
        namespace: 'application-user/renew',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to renew user',
        request: req.body,
        error: error,
        namespace: 'application-user/renew',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
