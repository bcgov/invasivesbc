'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { getDBConnection } from '../../database/db';
import { getLogger } from '../../utils/logger';
import { atob } from 'js-base64';
import {InvasivesRequest} from "../../utils/auth-utils";

// const defaultLog = getLogger('batch');

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
        namespace: 'batch/upload',
        code: 503
      });
    }

    try {
      try {
        // Perform both get and create operations as a single transaction
        await connection.query('BEGIN');

        const response: QueryResult = await connection.query(
          `select id, status, validation_status, validation_messages, created_at, created_by from batch_uploads where created_by like $1 order by created_at desc limit 10`,
          [req.authContext.preferredUsername]
        );

        await connection.query('COMMIT');

        return res.status(200).json({
          message: 'Batches listed',
          request: req.body,
          result: response.rows,
          count: response.rowCount,
          namespace: 'batch/upload',
          code: 200
        });
      } catch (error) {
        await connection.query('ROLLBACK');
        return res.status(500).json({
          message: 'Error creating batch upload',
          request: req.body,
          error: error,
          namespace: 'batch/upload',
          code: 500
        });
      }
    } catch (error) {
      // defaultLog.error({ label: 'batchUpload', message: 'error', error });
      return res.status(500).json({
        message: 'Error creating batch upload',
        request: req.body,
        error: error,
        namespace: 'batch/upload',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
