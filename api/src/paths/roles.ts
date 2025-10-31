import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAllRolesSQL } from 'queries/role-queries';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import QueryHandler from 'utils/endpoints/QueryHandler';
import OpenAPISpec from 'OpenAPISpec';

const logger = new LoggerHandler('roles');
const GET: Operation = [getRoles()];

new OpenAPISpec('Get some information about users and their roles', ['roles'])
  .security()
  .response(200, {
    description: 'All Role Codes',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {}
        }
      }
    }
  })
  .build(GET);

function getRoles(): RequestHandler {
  return async (_req, res, _next) => {
    try {
      const db = new QueryHandler();
      const response = await db.query(getAllRolesSQL());
      return res.status(200).json({ result: response.rows });
    } catch (error) {
      logger.error('[getRoles]', error.stack);
      return res.status(500).json(error);
    }
  };
}

export { GET };
