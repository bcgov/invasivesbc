'use strict';

import {RequestHandler} from 'express';
import {Operation} from 'express-openapi';
import {QueryResult} from 'pg';
import {ALL_ROLES, SECURITY_ON} from '../../constants/misc';
import {getDBConnection} from '../../database/db';
import {InvasivesRequest} from '../../utils/auth-utils';
import {TemplateService} from '../../utils/batch/template-utils';
import {BatchValidationResult, BatchValidationService} from '../../utils/batch/validation';

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
  description: 'Get a batch upload by ID',
  ...GET_API_DOC
};

function listBatches(): RequestHandler {
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
        retrievedBatch['json_representation']
      );

      const responseObject = {
        ...retrievedBatch,
        template,
        json_representation: validationResult.validatedBatchData,
        globalValidationMessages: validationResult.globalValidationMessages,
        canProceed: validationResult.canProceed,
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