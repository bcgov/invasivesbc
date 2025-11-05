import { NextFunction, RequestHandler, Response } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, Role } from 'constants/misc';
import {
  getActivitySubtypesUserHasWritePermissionOn,
  getRolesForUserSQL,
  getUsersForRoleSQL,
  grantRoleToUserSQL,
  revokeRoleFromUserSQL
} from 'queries/role-queries';
import { InvasivesRequest } from 'utils/auth-utils';
import OpenAPISpec from 'utils/OpenAPISpec';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import verifyUserRole from 'utils/validateRole';
import QueryHandler from 'utils/endpoints/QueryHandler';

const logger = new LoggerHandler('user-access');

const POST: Operation = [batchGrantRoleToUser()];
const DELETE: Operation = [revokeRoleFromUser()];
const GET: Operation = [decideGET()];

// GET Spec
new OpenAPISpec('Get some information about users and their roles', ['user-access'])
  .security()
  .parameters([
    {
      in: 'query',
      name: 'roleId',
      required: false
    },
    {
      in: 'query',
      name: 'userId',
      required: false
    }
  ])
  .response(200, {
    description: 'User Acccess get response object array.',
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

// POST Spec
new OpenAPISpec('Grant a role to a user.', ['user-access'])
  .security([Role.MASTER_ADMINISTRATOR])
  .requestBody({
    description: 'User access post request object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  })
  .response(200, {
    description: 'User access post response object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  })
  .build(POST);

// Delete Spec
new OpenAPISpec('Delete a role from a user', ['user-access'])
  .security(ALL_ROLES)
  .requestBody({
    description: 'User access post request object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  })
  .response(200, {
    description: 'User access post response object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  })
  .build(DELETE);

// Returns a function that will be used as a middleware for the GET request
// Returns 400 if both parameters are provided
function decideGET() {
  return async (req, res, next) => {
    const roleId = req.query.roleId;
    const userId = req.query.userId;
    if (roleId && userId) return res.status(400).send('Only one of roleId or userId may be provided');

    if (roleId) {
      return await getUsersForRole(req, res, roleId);
    }
    if (userId) {
      return await getRolesForUser(req, res, userId);
    }
    return await getRolesForSelf(req, res, next);
  };
}

function batchGrantRoleToUser(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (verifyUserRole(POST.apiDoc, req)) return res.sendStatus(401);
    logger.debug('batch-grant', { body: req.body });
    const db = new QueryHandler({ maintain: true });
    try {
      const result = [];
      for (const userId of req.body.userIds) {
        const sqlStatement: SQLStatement = grantRoleToUserSQL(userId, req.body.roleId);
        const response = await db.query(sqlStatement);
        result.push(...(response?.rows ?? []));
      }
      return res.status(201).json({ result });
    } catch (e) {
      logger.error(e, '[batchGrantRoleToUser]');
      return res.status(500).send('Failed to grant role to user');
    } finally {
      db?.close();
    }
  };
}

function revokeRoleFromUser(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (verifyUserRole(POST.apiDoc, req)) return res.sendStatus(401);

    logger.debug('[revokeRoleFromUser]', { body: req.body });
    try {
      const { userId, roleId } = req.body.userId;
      if (!userId || !roleId) return res.sendStatus(400);

      const sqlStatement: SQLStatement = revokeRoleFromUserSQL(req.body.userId, req.body.roleId);
      const response = await new QueryHandler().query(sqlStatement);

      return res.status(200).json({ result: response.rows });
    } catch (e) {
      e.error(e, '[revokeRoleFromUser]');
      return res.status(500).send('Failed to revoke role from user');
    }
  };
}

async function getUsersForRole(req: InvasivesRequest, res: Response, roleId) {
  try {
    const response = await new QueryHandler().query(getUsersForRoleSQL(roleId));
    logger.debug('[getUsersForRole]', { body: req.query, result: response.rows });
    return res.status(200).json({ result: response.rows });
  } catch (e) {
    logger.error(e, '[getUsersForRole]');
    return res.status(500).send('Failed to retrieve users for role');
  }
}

async function getRolesForUser(req: InvasivesRequest, res: Response, userId) {
  try {
    const response = await new QueryHandler().query(getRolesForUserSQL(userId));
    logger.debug('[getRolesForUser]', { body: req.query, result: response.rows });
    return res.status(200).json({ result: response.rows });
  } catch (e) {
    logger.error(e, '[getRolesForUser]');
    return res.status(500).send('Failed to retrieve roles for user');
  }
}

async function getRolesForSelf(req: InvasivesRequest, res: Response, _: NextFunction) {
  try {
    const writePrivilege = await new QueryHandler().query(
      getActivitySubtypesUserHasWritePermissionOn(req.authContext.user.user_id)
    );

    const result = {
      roles: req.authContext.roles,
      writePrivilege: writePrivilege.rows.map((act) => act.form_subtype),
      v2BetaAccess: req.authContext.user.v2beta,
      extendedInfo: {
        user_id: req.authContext.user.user_id,
        account_status: req.authContext.user.account_status,
        activation_status: req.authContext.user.activation_status,
        work_phone_number: req.authContext.user.work_phone_number,
        funding_agencies: req.authContext.user.funding_agencies,
        employer: req.authContext.user.employer,
        pac_number: req.authContext.user.pac_number,
        pac_service_number_1: req.authContext.user.pac_service_number_1,
        pac_service_number_2: req.authContext.user.pac_service_number_2
      }
    };
    logger.debug('[getRolesForSelf]', { body: req.query, result });
    return res.status(200).json({ message: 'Successfully retrieved roles for self', result });
  } catch (e) {
    logger.error(e, '[getRolesForSelf]');
    return res.sendStatus(500);
  }
}

export {DELETE, POST, GET}
