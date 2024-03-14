import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc.js';
import { getDBConnection } from '../database/db.js';
import { SQLStatement } from 'sql-template-strings';
import { listCodeTablesSQL } from '../queries/code-queries.js';

export const GET: Operation = [listCodeTables()];

const LIST_API_DOC = {
  tags: ['template'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : []
};

GET.apiDoc = {
  description: 'Get the list of queryable code tables',
  ...LIST_API_DOC
};

function listCodeTables(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'code_tables',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = listCodeTablesSQL();

      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to generate SQL statement',
          request: req.body,
          namespace: 'code_tables',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'Successfully got code tables',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'code_tables',
        code: 200
      });
    } finally {
      connection.release();
    }
  };
}
