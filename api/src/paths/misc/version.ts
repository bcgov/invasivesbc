import { Operation } from 'express-openapi';

const GET: Operation = [
  (req, res) => {
    const versionInfo = {
      version: process.env.VERSION || '0',
      environment: process.env.environment || process.env.NODE_ENV || 'localhost'
    };

    res.status(200).json({
      message: 'Got version info',
      request: req.body,
      result: versionInfo,
      namespace: 'misc/version',
      code: 200
    });
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
export default { GET };
