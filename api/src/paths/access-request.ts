'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { createAccessRequestSQL } from '../queries/access-request-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('access-request');

export const POST: Operation = [createAccessRequest()];

POST.apiDoc = {
  description: 'Create a new access request.',
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
 * Create an access request
 */
function createAccessRequest(): RequestHandler {
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
      console.log('CREATE ACCESS REQUEST: ', req.body);
      const sqlStatement: SQLStatement = createAccessRequestSQL(req.body);
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = { count: (response && response.rowCount) || 0 };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
