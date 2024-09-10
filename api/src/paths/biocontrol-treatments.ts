import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('biocontrol-treatments');

export const GET: Operation = [getBiocontrolTreatments()];

GET.apiDoc = {
  description: 'Fetches all Biocontrol treatment code pairings',
  tags: ['biocontrol-treatments'],
  security: SECURITY_ON ? [{ Bearer: ALL_ROLES }] : [],
  responses: {
    200: {
      description: 'Biocontrol treatments response object',
      content: {
        'application/json': {
          schema: {
            properties: {}
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

function getBiocontrolTreatments(): RequestHandler {
  return async (req, res, next) => {
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'biocontrol-treatments',
        code: 503
      });
    }
    try {
      const sqlStatement: SQLStatement = SQL`SELECT plant_code_name, agent_code_name FROM plant_agent_treatment;`;
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      const result = (response && response.rows) ?? null;

      return res.status(200).json({
        message: 'Biocontrol Treatments retrieved',
        request: req.body,
        result: result,
        namespace: 'biocontrol-treatments',
        code: 200
      });
    } catch (error) {
      defaultLog.error({ label: 'getBiocontrolTreatments', message: 'error', error });
      return res.status(500).json({
        message: 'Database encountered an error',
        request: req.body,
        error: error,
        namespace: 'biocontrol-treatments',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
