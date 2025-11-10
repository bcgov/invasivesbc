import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAllRolesSQL } from 'queries/role-queries';
import QueryHandler from 'utils/endpoints/QueryHandler';
import OpenAPISpec from 'utils/OpenAPISpec';

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
    const { rows } = await new QueryHandler().query(getAllRolesSQL());
    return res.status(200).json({ result: rows });
  };
}

export { GET };
