'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { ALL_ROLES } from '../../constants/misc';
import { getDBConnection } from '../../database/db';
import { getLogger } from '../../utils/logger';
import { atob } from 'js-base64';
import { processCSVData } from '../../utils/csv-intake-processor';

const defaultLog = getLogger('batch');

export const GET: Operation = [listBatches()];
export const POST: Operation = [uploadBatch()];

const GET_API_DOC = {
  tags: ['batch'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ]
};

const POST_API_DOC = {
  tags: ['batch'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Batch upload processor',
    content: {
      'application/json': {
        schema: {
          required: ['data'],
          properties: {
            data: {
              type: 'string',
              title: 'Encoded',
              description: 'base64-encoded CSV data'
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Created successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'number'
              }
            }
          }
        }
      }
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

POST.apiDoc = {
  description: 'Create a new file upload.',
  ...POST_API_DOC
};

GET.apiDoc = {
  description: 'Get the list of batch uploads',
  ...GET_API_DOC
};

/**
 * Creates a new activity record.
 *
 * @returns {RequestHandler}
 */
function uploadBatch(): RequestHandler {
  return async (req, res) => {
    const data = { ...req.body };

    // base64 decode
    const decoded = atob(data['data']);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    let createdId;

    try {
      try {
        // Perform both get and create operations as a single transaction
        await connection.query('BEGIN');

        const response: QueryResult = await connection.query(
          `insert into batch_uploads (csv_data, created_by)
           values ($1, $2)
           returning id `,
          [decoded, req['auth_payload'].preferred_username]
        );

        createdId = response.rows[0]['id'];

        try {
          const csvOutcome = await processCSVData(connection, req['auth_payload'].preferred_username, decoded);

          const updatedStatus = {
            status: csvOutcome.success ? 'SUCCESS' : 'ERROR',
            validationStatus: csvOutcome.validationMessages.length == 0 ? 'VALID' : 'INVALID',
            validationMessages: csvOutcome.validationMessages
          };

          await connection.query(
            `update batch_uploads set status = $2, validation_status = $3, validation_messages = $4 where id = $1`,
            [
              createdId,
              updatedStatus.status,
              updatedStatus.validationStatus,
              JSON.stringify(updatedStatus.validationMessages)
            ]
          );
        } catch (e) {
          await connection.query(`update batch_uploads set status = 'ERROR' where id = $1`, [createdId]);
        }

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
      }

      const result = {
        id: createdId
      };

      return res.status(201).json(result);
    } catch (error) {
      defaultLog.error({ label: 'batchUpload', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

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
