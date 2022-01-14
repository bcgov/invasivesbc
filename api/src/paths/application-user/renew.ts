'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { renewUserSQL } from '../../queries/user-queries';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../../constants/misc';
import { getDBConnection } from '../../database/db';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('activity/{activityId}');

export const POST: Operation = [renewUser()];

POST.apiDoc = {
  description: 'Renew a user',
  tags: ['users'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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
    defaultLog.debug({ label: 'application-user', message: 'renewUser', body: req.query });
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Database connection failed.'
      };
    }
    try {
      const userId = req.query.userId.toString();
      const sqlStatement: SQLStatement = renewUserSQL(userId);
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      const result = await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
