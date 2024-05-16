import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import {
  getRolesForUserSQL,
  getUsersForRoleSQL,
  grantRoleToUserSQL,
  revokeRoleFromUserSQL
} from 'queries/role-queries';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('user-access');

export const POST: Operation = [batchGrantRoleToUser()];
export const DELETE: Operation = [revokeRoleFromUser()];
export const GET: Operation = [decideGET()];

GET.apiDoc = {
  description: 'Get some information about users and their roles',
  tags: ['user-access'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  parameters: [
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
  ],
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

POST.apiDoc = {
  description: 'Grant a role to a user',
  tags: ['user-access'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'User access post request object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'User access post response object.',
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

DELETE.apiDoc = {
  description: 'Grant a role to a user',
  tags: ['user-access'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'User access post request object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'User access post response object.',
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

// Returns a function that will be used as a middleware for the GET request
// Returns 400 if both parameters are provided
function decideGET() {
  return async (req, res, next) => {
    const roleId = req.query.roleId;
    const userId = req.query.userId;
    if (roleId && userId) {
      return res.status(400).json({
        error: 'Only one of roleId or userId may be provided',
        request: req.body,
        namespace: 'user-access',
        code: 400
      });
    }
    if (roleId) {
      return await getUsersForRole(req, res, next, roleId);
    }
    if (userId) {
      return await getRolesForUser(req, res, next, userId);
    }
    return await getRolesForSelf(req, res, next);
  };
}

function batchGrantRoleToUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'user-access', message: 'batch-grant', body: req.body });
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace: 'user-access',
        code: 503
      });
    }
    try {
      for (const userId of req.body.userIds) {
        const sqlStatement: SQLStatement = grantRoleToUserSQL(userId, req.body.roleId);
        if (!sqlStatement) {
          return res.status(500).json({
            error: 'Failed to generate SQL statement',
            request: req.body,
            namespace: 'user-access',
            code: 500
          });
        }
        const response = await connection.query(sqlStatement.text, sqlStatement.values);
        const result = response.rows;
        return res.status(201).json({
          message: 'Successfully granted role to user',
          request: req.body,
          result: result,
          count: response.rowCount,
          namespace: 'user-access',
          code: 201
        });
      }
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to grant role to user',
        request: req.body,
        error: error,
        namespace: 'user-access',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

function revokeRoleFromUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'user-access', message: 'revoke', body: req.body });
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'user-access',
        code: 503
      });
    }
    try {
      const sqlStatement: SQLStatement = revokeRoleFromUserSQL(req.body.userId, req.body.roleId);
      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to generate SQL statement',
          request: req.body,
          namespace: 'user-access',
          code: 500
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json({
        message: 'Successfully revoked role from user',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'user-access',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to revoke role from user',
        request: req.body,
        error: error,
        namespace: 'user-access',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

async function getUsersForRole(req, res, next, roleId) {
  defaultLog.debug({ label: '{userId}', message: 'getUsersForRole', body: req.query });
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Database connection unavailable',
      request: req.body,
      namespace: 'user-access',
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = getUsersForRoleSQL(roleId);
    if (!sqlStatement) {
      return res.status(500).json({
        message: 'Failed to generate SQL statement',
        request: req.body,
        namespace: 'user-access',
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(200).json({
      message: 'Successfully retrieved users for role',
      request: req.body,
      result: response.rows,
      count: response.rowCount,
      namespace: 'user-access',
      code: 200
    });
  } catch (error) {
    defaultLog.debug({ label: 'getUsersForRole', message: 'error', error });
    return res.status(500).json({
      message: 'Failed to retrieve users for role',
      request: req.body,
      error: error,
      namespace: 'user-access',
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function getRolesForUser(req, res, next, userId) {
  defaultLog.debug({ label: '{userId}', message: 'getRolesForUser', body: req.query });
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Database connection unavailable',
      request: req.body,
      namespace: 'user-access',
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = getRolesForUserSQL(userId);
    if (!sqlStatement) {
      return res.status(500).json({
        message: 'Failed to generate SQL statement',
        request: req.body,
        namespace: 'user-access',
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(200).json({
      message: 'Successfully retrieved roles for user',
      request: req.body,
      result: response.rows,
      count: response.rowCount,
      namespace: 'user-access',
      code: 200
    });
  } catch (error) {
    defaultLog.debug({ label: 'getRolesForUser', message: 'error', error });
    return res.status(500).json({
      message: 'Failed to retrieve roles for user',
      request: req.body,
      error: error,
      namespace: 'user-access',
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function getRolesForSelf(req, res, next) {
  return res.status(200).json({
    message: 'Successfully retrieved roles for self',
    request: req.body,
    result: {
      roles: req.authContext.roles,
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
    },
    count: 1,
    namespace: 'user-access',
    code: 200
  });
}
