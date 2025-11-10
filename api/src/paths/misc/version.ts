import { Operation } from 'express-openapi';
import { Request, Response } from 'express';
import OpenAPISpec from 'utils/OpenAPISpec';

const GET: Operation = [handleGet()];

new OpenAPISpec('API version information', ['misc'])
  .response(200, {
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
  })
  .build(GET);

function handleGet() {
  return (_: Request, res: Response) =>
    res.status(200).json({
      version: process.env.VERSION || '0',
      environment: process.env.environment || process.env.NODE_ENV || 'localhost'
    });
}

export { GET };
