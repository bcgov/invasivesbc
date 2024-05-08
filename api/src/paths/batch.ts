import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { InvasivesRequest } from 'utils/auth-utils';
import { getLogger } from 'utils/logger';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

const GET: Operation = [listBatches()];
const POST: Operation = [createBatch()];

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

const POST_API_DOC = {
  tags: ['batch'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Batch upload processor',
    content: {
      'application/json': {
        schema: {
          required: ['csvData'],
          properties: {
            csvData: {
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
              id: { type: 'number' }
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
const defaultLog = getLogger('batch');

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

function createBatch(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const connection = await getDBConnection();

    const data = { ...req.body };
    const decoded = atob(data['csvData']);
    const template = data['template'];

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'batch',
        code: 503
      });
    }

    const parser = csvParser({
      mapHeaders: ({ header }) => header.trim()
    });

    const parsedCSV = {
      headers: [],
      rows: []
    };

    let i = 1;

    const readComplete = new Promise<void>((resolve, reject) => {
      Readable.from(decoded)
        .pipe(parser)
        .on('headers', async (headers) => {
          parsedCSV.headers = headers;
        })
        .on('data', async (row) => {
          parsedCSV.rows.push({
            rowIndex: i,
            data: row
          });
          i++;
        })
        .on('close', () => {
          resolve();
        });
    });

    await readComplete;

    let createdId;

    try {
      await connection.query('BEGIN');

      const response: QueryResult = await connection.query(
        `insert into batch_uploads (csv_data, json_representation, created_by, template)
         values ($1, $2, $3, $4)
         returning id`,
        [decoded, parsedCSV, req.authContext.user.user_id, template]
      );

      await connection.query('COMMIT');

      createdId = response.rows[0]['id'];
    } catch (error) {
      await connection.query('ROLLBACK');
      defaultLog.error({ label: 'batchUpload', message: 'error', error });
      return res.status(500).json({
        message: 'Error creating batch upload',
        request: req.body,
        error: error,
        namespace: 'batch',
        code: 500
      });
    } finally {
      connection.release();
    }
    return res.status(201).json({
      message: 'Upload successful',
      request: req.body,
      batchId: createdId,
      namespace: 'batch',
      code: 201
    });
  };
}

export default { GET, POST };
