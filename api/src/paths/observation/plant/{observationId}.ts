import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../../../constants/misc';
import { getDBConnection } from '../../../database/db';
import { getSingleObservationPlantSQL } from '../../../queries/observation-queries';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('observation-controller');

export const parameters = [
  {
    in: 'path',
    name: 'observationId',
    required: true
  }
];

export const GET: Operation = [
  async (req, res, next) => {
    defaultLog.info({ label: 'observation-plant-{observationId}', message: 'params', params: req.params });

    if (!req.params || !req.params.observationId) {
      defaultLog.warn({ label: 'observation-plant-{observationId}', message: 'observationId was null' });
      throw {
        status: 400,
        message: 'Required param observationId was missing or invalid'
      };
    }

    const observationId = req.params.observationId;

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    const sqlStatement: SQLStatement = getSingleObservationPlantSQL(observationId);

    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rowCount && response.rows[0]) || null;

    connection.release();

    return res.status(200).json(result);
  }
];

GET.apiDoc = {
  description: 'Get a plant observation for the specific observationId.',
  tags: ['observation', 'plant'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  responses: {
    200: {
      description: 'Plant observation',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ObservationPlantResponse'
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
