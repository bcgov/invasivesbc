'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../../constants/misc';
import { getDBConnection } from './../../database/db';
import { fetchCodeTablesSQL } from '../../queries/code-queries';

export const GET: Operation = [getCodeTableValues()];

GET.apiDoc = {
  description: 'Fetches a single activity based on its primary key.',
  tags: ['activity'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'codeHeaderId',
      required: true
    }
  ]
};

function getCodeTableValues(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    const codeHeaderId = req.params.codeHeaderId;

    try {
      const sqlStatement: SQLStatement = fetchCodeTablesSQL(codeHeaderId);

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = (response && response.rows) || null;

      if (!req.headers.accept || req.headers.accept === 'application/json' || req.headers.accept === '*/*') {
        return res.status(200).json(result);
      } else if (req.headers.accept === 'text/csv') {
        let csvResult = ['Code', 'Description'].join(', ') + '\n';
        for (const row of response.rows) {
          csvResult += `"${row.code}", "${row.description}"\n`;
        }
        return res.status(200).contentType('text/csv').send(csvResult);
      } else {
        return res.status(415).send('unacceptable response type: ' + req.headers.accept);
      }
    } finally {
      connection.release();
    }
  };
}
