'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { ALL_ROLES, SECURITY_ON } from '../../../constants/misc';
import { getDBConnection } from '../../../database/db';
import { InvasivesRequest } from '../../../utils/auth-utils';
import { TemplateService } from '../../../utils/batch/template-utils';
import { BatchValidationService } from '../../../utils/batch/validation';
import { getLogger } from '../../../utils/logger';
import { BatchExecutionService } from '../../../utils/batch/execution';

export const POST: Operation = [execBatch()];

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
          required: ['desiredActivityState', 'treatmentOfErrorRows'],
          properties: {
            desiredActivityState: {
              type: 'string'
            },
            treatmentOfErrorRows: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Executed successfully',
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

POST.apiDoc = {
  description: 'Run a batch.',
  ...POST_API_DOC
};

const defaultLog = getLogger('batch');

function execBatch(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const connection = await getDBConnection();
    const id = req.params.id;

    const { desiredActivityState, treatmentOfErrorRows } = req.body;

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
                created_at,
                created_by
         from batch_uploads
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

      const validationResult = BatchValidationService.validateBatchAgainstTemplate(
        template,
        retrievedBatch['json_representation'],
        req.authContext.user
      );

      try {
        const batchExecResult = await BatchExecutionService.executeBatch(
          connection,
          id,
          template,
          validationResult.validatedBatchData,
          desiredActivityState,
          treatmentOfErrorRows,
          req.authContext.user
        );

        return res.status(200).json({
          message: 'Batch update executed successfully',
          request: req.body,
          result: batchExecResult,
          count: 1,
          namespace: 'batch',
          code: 200
        });
      } catch (error) {
        defaultLog.error(error);
        return res.status(400).json({
          message: 'Batch update exec failed',
          request: req.body,
          count: 1,
          namespace: 'batch',
          code: 400
        });
      }
    } catch (error) {
      defaultLog.error(error);
      return res.status(500).json({
        message: `Error executing batch ${id}`,
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
