'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { SQLStatement } from 'sql-template-strings';
import { listCodeTablesSQL } from '../queries/code-queries';

export const GET: Operation = [listCodeTables()];

const LIST_API_DOC = {
  tags: ['template'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ]
};

GET.apiDoc = {
  description: 'Get the list of queryable code tables',
  ...LIST_API_DOC
};

function listCodeTables(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = listCodeTablesSQL();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = (response && response.rows) || null;

      return res.status(200).json(result);
    } finally {
      connection.release();
    }
  };
}
