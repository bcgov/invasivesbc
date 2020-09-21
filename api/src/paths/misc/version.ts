import { Operation } from 'express-openapi';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('observation-controller');

export const GET: Operation = [
  (req, res, next) => {
    defaultLog.debug({ label: 'misc-version-get' });

    const versionInfo = {
      version: process.env.VERSION || '0',
      environment: process.env.environment || process.env.NODE_ENV || 'localhost'
    };

    res.status(200).json(versionInfo);
  }
];

GET.apiDoc = {
  description: 'Get all observation plant code values.',
  tags: ['misc'],
  responses: {
    200: {
      description: 'Code values for a plant observation',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              version: {
                description: 'api version',
                type: 'number'
              },
              environment: {
                description: 'api environment',
                type: 'string'
              }
            }
          }
        }
      }
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};
