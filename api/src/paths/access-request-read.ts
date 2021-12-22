'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getAccessRequestForUserSQL } from '../queries/access-request-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('access-request');

export const POST: Operation = [getAccessRequestData()];

POST.apiDoc = {
  description: 'Get access request record.',
  tags: ['access-request'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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
    defaultLog.debug({ label: 'access-request', message: 'create', body: req.body });

    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getAccessRequestForUserSQL(req.body.username, req.body.email);
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json(response.rows[0]);
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
