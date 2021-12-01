'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { ALL_ROLES } from '../../constants/misc';
import { getDBConnection } from '../../database/db';
import { getLogger } from '../../utils/logger';
import { atob } from 'js-base64';

const defaultLog = getLogger('batch');

export const GET: Operation = [listBatches()];

const GET_API_DOC = {
  tags: ['batch'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ]
};

GET.apiDoc = {
  description: 'Get the list of batch uploads',
  ...GET_API_DOC
};

function listBatches(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      try {
        // Perform both get and create operations as a single transaction
        await connection.query('BEGIN');

        const response: QueryResult = await connection.query(
          `select id, status, validation_status, validation_messages, created_at, created_by from batch_uploads where created_by like $1 order by created_at desc limit 10`,
          [req['auth_payload'].preferred_username]
        );

        await connection.query('COMMIT');

        return res.status(200).json(response.rows);
      } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      defaultLog.error({ label: 'batchUpload', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
