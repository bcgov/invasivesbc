'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getAccessRequestForUserSQL } from '../queries/access-request-queries';
// import { getLogger } from '../utils/logger';

const namespace = ('access-request');

export const POST: Operation = [getAccessRequestData()];

POST.apiDoc = {
  description: 'Get access request record.',
  tags: ['access-request'],
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
    // defaultLog.debug({ label: 'access-request', message: 'create', body: req.body });

    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'access-request-read',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getAccessRequestForUserSQL(req.body.username, req.body.email);
      if (!sqlStatement) {
        return res.status(400).json({
          message: 'Invalid request',
          request: req.body,
          namespace: 'access-request-read',
          code: 400
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      if (response.rows.length > 0) {
        return res.status(200).json({
          message: 'Got access request for user',
          code: 200,
          namespace: 'access-request-read',
          result: response.rows[0]
        });
      } else {
        return res.status(200).json({
          message: 'No access request for user',
          code: 200,
          namespace: 'access-request-read',
          result: {}
        });
      }
    } catch (error) {
      // defaultLog.debug({ label: 'create', message: 'error', error });
      return res.status(500).json({
        message: 'Database encountered an error',
        request: req.body,
        error: error,
        namespace: 'access-request-read',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
