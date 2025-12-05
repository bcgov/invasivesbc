import { Readable } from 'stream';
import { RequestHandler, Response } from 'express';
import { Operation } from 'express-openapi';
import csvParser from 'csv-parser';
import SQL from 'sql-template-strings';
import { ACTIVATED_ROLES } from 'constants/misc';
import { InvasivesRequest } from 'utils/auth-utils';
import OpenAPISpec from 'utils/OpenAPISpec';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import QueryHandler from 'utils/endpoints/QueryHandler';

const logger = new LoggerHandler('batch');
const GET: Operation = [listBatches()];
const POST: Operation = [createBatch()];

new OpenAPISpec('Get the list of batch uploads', ['batch']).security(ACTIVATED_ROLES).build(GET);
new OpenAPISpec('Create a new file upload.', ['batch'])
  .security(ACTIVATED_ROLES)
  .requestBody({
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
  })
  .response(201, {
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
  })
  .build(POST);

function listBatches(): RequestHandler {
  return async (req: InvasivesRequest, res: Response) => {
    const sql = SQL`
      select id, status, template, created_at, created_by
      from batch_uploads
      where created_by = ${req.authContext.user.user_id}
      order by created_at desc
    `;
    const { rows } = await new QueryHandler().query(sql);
    logger.debug('[listBatches]', { rows });
    return res.status(200).json({ result: rows });
  };
}

function createBatch(): RequestHandler {
  return async (req: InvasivesRequest, res: Response) => {
    const data = { ...req.body };
    const decoded = atob(data['csvData']);
    const template = data['template'];

    const parser = csvParser({
      mapHeaders: ({ header }) => header.trim()
    });

    const parsedCSV = { headers: [], rows: [] };
    let i = 1;
    await new Promise<void>((resolve, _) => {
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

    const db = new QueryHandler({ maintain: true });
    try {
      await db.query(SQL`BEGIN`);
      const response = await db.query(SQL`
        INSERT INTO batch_uploads (csv_data, json_representation, created_by, template)
        VALUES (${decoded}, ${parsedCSV}, ${req.authContext.user.user_id}, ${template})
        RETURNING id
      `);
      const createdId = response.rows[0]['id']; // Batch ID -- e.g. 555
      await db.query(SQL`COMMIT`);
      return res.status(201).json({ batchId: createdId });
    } catch (error) {
      await db.query(SQL`ROLLBACK`);
      throw error;
    } finally {
      db?.close();
    }
  };
}

export { GET, POST };
