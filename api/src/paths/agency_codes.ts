import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc.js';
import { getDBConnection } from '../database/db.js';
import { SQLStatement } from 'sql-template-strings';
import { getFundingAgencyCodesSQL } from '../queries/code-queries.js';

export const GET: Operation = [getAgencyCodes()];

GET.apiDoc = {
  description: 'Fetches agency codes',
  tags: ['agency_codes'],
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

function getAgencyCodes(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace: 'agency-codes',
        code: '503'
      });
    }

    try {
      const sqlStatement: SQLStatement = getFundingAgencyCodesSQL();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'Successfully fetched agency codes',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'agency-codes',
        code: '200'
      });
    } finally {
      connection.release();
    }
  };
}
