import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PoolClient, QueryResult } from 'pg';
import SQL from 'sql-template-strings';
import { ALL_ROLES } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { InvasivesRequest } from 'utils/auth-utils';
import { TemplateService } from 'utils/batch/template-utils';
import { BatchValidationService } from 'utils/batch/validation/validation';
import { BatchExecutionService } from 'utils/batch/execution';
import OpenAPISpec from 'utils/OpenAPISpec';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import { autofillBatch } from 'utils/batch/autofillBatch';

const logger = new LoggerHandler('batch');
const POST: Operation = [execBatch()];

new OpenAPISpec('Batch upload processor', ['batch'])
  .security(ALL_ROLES)
  .requestBody({
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
  })
  .response(200, {
    description: 'Executed successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object'
        }
      }
    }
  })
  .build(POST);

function execBatch(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const START_TIME = Date.now();
    const id = req.params.id;
    const { desiredActivityState, treatmentOfErrorRows } = req.body;

    let connection: PoolClient | undefined;
    try {
      connection = await getDBConnection();
      const response: QueryResult = await connection.query(
        SQL`
          SELECT
            id,
            status,
            csv_data,
            json_representation,
            validation_messages,
            template,
            created_at,
            created_by
          FROM batch_uploads
          WHERE created_by = ${req.authContext.user.user_id}
          AND id = ${id}`
      );

      if (response.rowCount === 0) return res.sendStatus(404);

      const retrievedBatch = response.rows[0];
      const template = await TemplateService.getTemplateWithExistingDBConnection(retrievedBatch.template, connection);

      if (!template) return res.status(404).send(`Missing template: ${template}`);

      const validationResult = await BatchValidationService.validateBatchAgainstTemplate(
        template,
        retrievedBatch.json_representation,
        [],
        req.authContext.user
      );
      await BatchExecutionService.executeBatch({
        dbConnection: connection,
        id: id,
        template: template,
        validatedBatchData: validationResult.validatedBatchData,
        desiredFinalStatus: desiredActivityState,
        errorRowsBehaviour: treatmentOfErrorRows,
        userInfo: req.authContext.user
      });
      logger.info('[execute] Finished Batch upload', { id, executionTime: `${Date.now() - START_TIME}ms` });
      // Return the success to the user, so they can continue on
      res.status(200).json({ desiredActivityState, treatmentOfErrorRows });
      // Now in the background gather and update the autofill information.
      await autofillBatch(id);
    } finally {
      connection?.release();
    }
  };
}

export { POST };
