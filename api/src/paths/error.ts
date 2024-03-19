import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc.js';
import { getDBConnection } from '../database/db.js';
import { getLogger } from '../utils/logger.js';
import { ErrorPostRequestBody } from '../models/error.js';
import { saveErrorSQL } from '../queries/error-queries.js';
import { InvasivesRequest } from '../utils/auth-utils.js';

const defaultLog = getLogger('error');

export const POST: Operation = [errorLog()];

POST.apiDoc = {
  description: 'Log error from client on saga crash',
  tags: ['error'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'error info from the client on crash',
    content: {
      'application/json': {
        schema: {
          properties: {
            error: {
              type: 'object'
            },
            clientState: {
              type: 'object'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Success'
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
 * Fetches all jurisdiction records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function errorLog(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    defaultLog.debug({
      label: 'error',
      message: 'client error',
      // body: req.body,
      namespace: 'error'
    });

    const sanitizedSearchCriteria = new ErrorPostRequestBody(req.body);
    sanitizedSearchCriteria.created_by = req.authContext?.friendlyUsername;
    sanitizedSearchCriteria.created_by_with_guid = req.authContext?.preferredUsername;

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace: 'error',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = saveErrorSQL(sanitizedSearchCriteria);

      if (!sqlStatement) {
        return res.status(500).json({
          error: 'Failed to generate SQL statement',
          request: req.body,
          namespace: 'error log',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'error logged',
        request: req.body,
        namespace: 'error log',
        code: 200
      });
    } catch (error) {
      const errorMessage = error.message ? error.message : error;
      defaultLog.debug({ label: 'error log', message: 'error', errorMessage });
      return res.status(500).json({
        message: 'Failed to log error',
        request: req.body,
        error: error,
        namespace: 'error log',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
