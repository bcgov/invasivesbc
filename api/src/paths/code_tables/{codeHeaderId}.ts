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
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'code_tables/{codeHeaderId}',
        code: 503
      });
    }

    const codeHeaderId = req.params.codeHeaderId;

    try {
      const sqlStatement: SQLStatement = fetchCodeTablesSQL(codeHeaderId);

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      if (!req.headers.accept || req.headers.accept === 'application/json' || req.headers.accept === '*/*') {
        return res.status(200).json({
          message: 'Got code table values',
          request: req.body,
          result: response.rows,
          count: response.rowCount,
          namespace: 'code_tables/{codeHeaderId}',
          code: 200
        });
      } else if (req.headers.accept === 'text/csv') {
        let csvResult = ['Code', 'Description'].join(', ') + '\n';
        for (const row of response.rows) {
          csvResult += `"${row.code}", "${row.description}"\n`;
        }
        return res.status(200).contentType('text/csv').json({
          message: 'Got code table values',
          request: req.body,
          result: csvResult,
          count: csvResult.length,
          namespace: 'code_tables/{codeHeaderId}',
          code: 200
        });
      } else {
        return res.status(415).json({
          message: 'Unacceptable response type: ' + req.headers.accept,
          request: req.body,
          namespace: 'code_tables/{codeHeaderId}',
          code: 415
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to fetch code table values',
        request: req.body,
        error: error,
        namespace: 'code_tables/{codeHeaderId}',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
