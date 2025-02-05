import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { getEmployerCodesSQL } from 'queries/code-queries';
import { PoolClient } from 'pg';

export const GET: Operation = [getEmployerCodes()];

GET.apiDoc = {
  description: 'Fetches employer codes',
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

function getEmployerCodes(): RequestHandler {
  return async (req, res) => {
    let connection: PoolClient | undefined;

    try {
      connection = await getDBConnection();
      const sqlStatement: SQLStatement = getEmployerCodesSQL();

      if (!sqlStatement) {
        return res.status(500).json({
          error: 'Failed to generate SQL statement',
          request: req.body,
          namespace: 'employer_codes',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'Successfully fetched employer codes',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'employer_codes',
        code: 200
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Failed fetching employer codes',
        request: req.body,
        error: error,
        namespace: 'employer_codes',
        code: 500
      });
    } finally {
      connection?.release();
    }
  };
}
