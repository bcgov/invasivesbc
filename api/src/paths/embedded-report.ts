'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc.js';
import { getDBConnection } from '../database/db.js';
import { getAllEmbeddedReports } from '../queries/embedded-report-queries.js';

export const GET: Operation = [listValidEmbeddedReports()];

const LIST_API_DOC = {
  tags: ['metabase'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : []
};

GET.apiDoc = {
  description: 'Get the list of queryable embedded reports',
  ...LIST_API_DOC
};

function listValidEmbeddedReports(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace: 'embedded-report',
        code: 503
      });
    }

    try {
      const sql = getAllEmbeddedReports();

      const response = await connection.query(sql.text, sql.values);

      return res.status(200).json({
        message: 'Successfully got code tables',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'reports',
        code: 200
      });
    } finally {
      connection.release();
    }
  };
}
