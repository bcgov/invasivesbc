'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { createUserSQL } from '../queries/createUserQuery';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('user-access');

export const POST: Operation = [createUser()];

POST.apiDoc = {
  description: 'Get some information about users and their roles',
  tags: ['create-user'],
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
          required: ['id', 'type'],
          properties: {
            id: {
              type: 'string',
              example: 'idir',
              description: 'provider type'
            },
            type: {
              type: 'string',
              example: 'banana123idirid',
              description: 'An idir UUID'
            },
            username: {
              type: 'string',
              example: 'name@provider',
              description: 'SSO preferred username'
            },
            email: {
              type: 'string',
              example: 'banana@pajamas.com',
              description: 'An email'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Create user record if not exists',
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

function createUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'create-user', message: 'sql step', body: req.body });
    console.log('req', JSON.stringify(req.body));
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Database connection failed.'
      };
    }
    try {
      const sqlStatement: SQLStatement = createUserSQL(req.body.type, req.body.id, req.body.username, req.body.email);
      if (!sqlStatement) {
        throw {
          status: 500,
          message: 'Failed to build SQL statement'
        };
      }
      await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json({ resp: 'user created ' });
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
