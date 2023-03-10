'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { InvasivesRequest } from '../utils/auth-utils';

export const GET: Operation = [listBatches()];

const GET_API_DOC = {
  tags: ['batch'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : []
};

GET.apiDoc = {
  description: 'Get the list of batch uploads',
  ...GET_API_DOC
};

function listBatches(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'batch',
        code: 503
      });
    }

    try {
      const response: QueryResult = await connection.query(
        `select id, status, template, created_at, created_by
         from batch_uploads
         where created_by = $1
         order by created_at desc`,
        [req.authContext.user.user_id]
      );

      return res.status(200).json({
        message: 'Batches listed',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'batch',
        code: 200
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error listing batches',
        request: req.body,
        error: error,
        namespace: 'batch',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
