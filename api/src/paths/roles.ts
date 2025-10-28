import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getAllRolesSQL } from 'queries/role-queries';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import QueryHandler from 'utils/endpoints/QueryHandler';

const logger = new LoggerHandler('roles');
export const GET: Operation = [getRoles()];

GET.apiDoc = {
  description: 'Get some information about users and their roles',
  tags: ['roles'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  responses: {
    200: {
      description: 'User Acccess get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              // Don't specify exact response, as it will vary, and is not currently enforced anyways
              // Eventually this could be updated to be a oneOf list, similar to the Post request below.
            }
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
