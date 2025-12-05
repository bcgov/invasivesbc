import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import {ACTIVATED_ROLES, Role, SECURITY_ON} from 'constants/misc';
import { getDBConnection } from 'database/db';
import { getFundingAgencyCodesSQL } from 'queries/code-queries';
import { PoolClient } from 'pg';

export const GET: Operation = [getAgencyCodes()];

GET.apiDoc = {
  description: 'Fetches agency codes',
  tags: ['agency_codes'],
  security: SECURITY_ON
    ? [
        {
          Bearer: [...ACTIVATED_ROLES, Role.NOT_ACTIVATED]
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
    let connection: PoolClient | undefined;

    try {
      connection = await getDBConnection();
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
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to fetch agency codes',
        request: req.body,
        error: error,
        namespace: 'agency-codes',
        code: 500
      });
    } finally {
      connection?.release();
    }
  };
}
