'use strict';

import {RequestHandler} from 'express';
import {Operation} from 'express-openapi';
import {QueryResult} from 'pg';
import {ALL_ROLES, SECURITY_ON} from '../../constants/misc';
import {getDBConnection} from '../../database/db';
import {InvasivesRequest} from '../../utils/auth-utils';
import {TemplateService} from '../../utils/batch/template-utils';
import {BatchValidationService} from '../../utils/batch/validation/validation';
import csvParser from 'csv-parser';
import {Readable} from 'stream';
import {getLogger} from '../../utils/logger';

export const GET: Operation = [getBatch()];
export const PUT: Operation = [updateBatch()];
export const DELETE: Operation = [deleteBatch()];

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
  description: 'Get a batch upload by ID',
  ...GET_API_DOC
};

const PUT_API_DOC = {
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
    200: {
      description: 'Updated successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object'
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

PUT.apiDoc = {
  description: 'Update the CSV Data in a batch upload.',
  ...PUT_API_DOC
};

const defaultLog = getLogger('batch');

function getBatch(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const connection = await getDBConnection();
    const id = req.params.id;

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
        `select id,
                status,
                csv_data,
                json_representation,
                validation_messages,
                template,
                array(select json_build_object('id', aid.activity_id, 'short_id', aid.short_id) from activity_incoming_data aid where aid.batch_id = b.id) as created_activities,
                created_at,
                created_by
         from batch_uploads b
         where created_by = $1
           and id = $2`,
        [req.authContext.user.user_id, id]
      );

      if (response.rowCount === 0) {
        return res.status(404).json({
          message: 'Not found',
          namespace: 'batch',
          code: 404
        });
      }

      const retrievedBatch = response.rows[0];

      const template = await TemplateService.getTemplateWithExistingDBConnection(retrievedBatch.template, connection);
      if (!template) {
        return res.status(500).json({
          message: `Missing template: ${template}`,
          request: req.body,
          error: null,
          namespace: 'batch',
          code: 500
        });
      }

      const validationResult = await BatchValidationService.validateBatchAgainstTemplate(
        template,
        retrievedBatch['json_representation'],
        req.authContext.user
      );

      const responseObject = {
        ...retrievedBatch,
        template,
        json_representation: validationResult.validatedBatchData,
        globalValidationMessages: validationResult.globalValidationMessages,
        canProceed: validationResult.canProceed
      };

      return res.status(200).json({
        message: 'Batch retrieved',
        request: req.body,
        result: responseObject,
        count: 1,
        namespace: 'batch',
        code: 200
      });
    } catch (error) {
      const message = error?.message || error;
      defaultLog.error({ message: 'Could not retrieve batch', error: message, id });
      return res.status(500).json({
        message: `Error retrieving batch ${id}`,
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

function updateBatch(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const connection = await getDBConnection();

    const data = { ...req.body };
    const id = req.params.id;

    const decoded = atob(data['csvData']);

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

    try {
      const response: QueryResult = await connection.query(
        `update batch_uploads
         set csv_data            = $1,
             json_representation = $2
         where id = $3
           and created_by = $4`,
        [decoded, parsedCSV, id, req.authContext.user.user_id]
      );

      const rereadResponse: QueryResult = await connection.query(
        `select id,
                status,
                csv_data,
                json_representation,
                validation_messages,
                template,
                created_at,
                created_by
         from batch_uploads
         where created_by = $1
           and id = $2`,
        [req.authContext.user.user_id, id]
      );

      if (rereadResponse.rowCount === 0) {
        return res.status(404).json({
          message: 'Not found',
          namespace: 'batch',
          code: 404
        });
      }

      const retrievedBatch = rereadResponse.rows[0];

      const template = await TemplateService.getTemplateWithExistingDBConnection(retrievedBatch.template, connection);
      if (!template) {
        return res.status(500).json({
          message: `Missing template: ${template}`,
          request: req.body,
          error: null,
          namespace: 'batch',
          code: 500
        });
      }

      const validationResult = await BatchValidationService.validateBatchAgainstTemplate(
        template,
        retrievedBatch['json_representation'],
        req.authContext.user
      );

      const responseObject = {
        ...retrievedBatch,
        template,
        json_representation: validationResult.validatedBatchData,
        globalValidationMessages: validationResult.globalValidationMessages,
        canProceed: validationResult.canProceed
      };

      return res.status(200).json({
        message: 'Upload successful',
        request: req.body,
        result: responseObject,
        namespace: 'batch',
        code: 200
      });
    } catch (error) {
      defaultLog.error({ label: 'batchUpload', message: 'error', error });
      return res.status(500).json({
        message: 'Error updating batch upload',
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

function deleteBatch(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const connection = await getDBConnection();

    const id = req.params.id;

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'batch',
        code: 503
      });
    }

    try {
      const rereadResponse: QueryResult = await connection.query(
        `delete from batch_uploads
         where status = 'NEW' and id = $1 and created_by = $2`,
        [id, req.authContext.user.user_id]
      );

      if (rereadResponse.rowCount === 0) {
        return res.status(404).json({
          message: 'Could not delete batch ' + id,
          namespace: 'batch',
          code: 404
        });
      }

      return res.status(200).json({
        message: 'Batch delete successful',
        request: req.body,
        result: {},
        namespace: 'batch',
        code: 200
      });
    } catch (error) {
      defaultLog.error({ label: 'batchDelete', message: 'error', error });
      return res.status(500).json({
        message: 'Error deleting batch',
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
