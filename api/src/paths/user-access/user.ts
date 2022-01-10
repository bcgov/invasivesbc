'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../../constants/misc';
import { getDBConnection } from '../../database/db';
import { getUsersForRoleSQL } from '../../queries/role-queries';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('user-access');

export const GET: Operation = [getUsersForRole()];

GET.apiDoc = {
  description: 'Grant a role to a user',
  tags: ['user-access'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'User access post request object.',
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
      description: 'User access post response object.',
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

function getUsersForRole(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'user-access', message: 'get-users', body: req.body });
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Database connection failed.'
      };
    }
    try {
      const sqlStatement: SQLStatement = getUsersForRoleSQL(req.body.roleId);
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      const result = response.rows;
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
