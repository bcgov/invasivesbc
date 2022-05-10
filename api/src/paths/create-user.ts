'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { createUserSQL } from '../queries/createUserQuery';
import { getLogger } from '../utils/logger';
import { InvasivesRequest } from '../utils/auth-utils';

const defaultLog = getLogger('user-access');

export const POST: Operation = [createUser()];

POST.apiDoc = {
  description: 'Get some information about users and their roles',
  tags: ['create-user'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
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
  return async (req: InvasivesRequest, res) => {
    defaultLog.debug({ label: 'create-user', message: 'sql step', body: req.body });
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Failed to establish database connection',
        request: req.body,
        namespace: 'create-user',
        code: 503
      });
    }
    try {
      if (req.body.username !== req.authContext.preferredUsername) {
        return res.status(400).json({
          message: 'Username in request is not calling user',
          request: req.body,
          namespace: 'create-user',
          code: 400
        });
      }

      const sqlStatement: SQLStatement = createUserSQL(req.body.type, req.body.id, req.body.username, req.body.email);
      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to generate SQL statement',
          request: req.body,
          namespace: 'create-user',
          code: 500
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json({
        message: 'User created',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'create-user',
        code: '200'
      });
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      return res
        .status(500)
        .json({ message: 'Failed to create user', request: req.body, error, namespace: 'create-user', code: 500 });
    } finally {
      connection.release();
    }
  };
}
