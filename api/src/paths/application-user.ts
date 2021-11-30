'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getUsersSQL } from '../queries/user-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('activity/{activityId}');

export const GET: Operation = [getUsers(), returnUsers()];

GET.apiDoc = {
  description: 'Fetches a list of users from the database',
  tags: ['users'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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

/**
 * Fetches a list of users
 *
 * @return {RequestHandler}
 */
function getUsers(): RequestHandler {
  return async (req, res, next) => {
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }
    try {
      const sqlStatement: SQLStatement = getUsersSQL();
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      const result = (response && response.rows) || null;
      req['users'] = result;
    } catch (error) {
      defaultLog.debug({ label: 'getUsers', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }

    return next();
  };
}

/**
 * Sends a 200 response with JSON contents of `raw.users`.
 *
 * @return {RequestHandler}
 */
function returnUsers(): RequestHandler {
  return async (req, res) => {
    return res.status(200).json(req['users']);
  };
}
