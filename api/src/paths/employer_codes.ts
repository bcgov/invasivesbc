'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { SQLStatement } from 'sql-template-strings';
import { getEmployerCodesSQL } from '../queries/code-queries';
// import { getEmployers, getFundingAgencies } from '../utils/code-utils';

export const GET: Operation = [getEmployerCodes()];

GET.apiDoc = {
  description: 'Fetches employer codes',
  tags: ['agency_codes'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getEmployerCodesSQL();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = (response && response.rows) || null;

      return res.status(200).json(result);
    } finally {
      connection.release();
    }
  };
}
