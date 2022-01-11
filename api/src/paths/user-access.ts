'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import {
  getRolesForUserSQL,
  getUsersForRoleSQL,
  grantRoleToUserSQL,
  revokeRoleFromUserSQL
} from '../queries/role-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('user-access');

export const POST: Operation = [batchGrantRoleToUser()];
export const DELETE: Operation = [revokeRoleFromUser()];
export const GET: Operation = [decideGET()];

GET.apiDoc = {
  description: 'Get some information about users and their roles',
  tags: ['user-access'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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

function decideGET() {
  return async (req, res, next) => {
    const roleId = req.query.roleId;
    const userId = req.query.userId;
    console.log('userId', userId);
    console.log('roleId', roleId);
    if (roleId && userId) {
      return res.status(400).send('Cannot specify both roleId and userId');
    }
    if (roleId) {
      return await getUsersForRole(req, res, next, roleId);
    }
    if (userId) {
      return await getRolesForUser(req, res, next, userId);
    }
    return res.status(400).send('Must specify either roleId or userId');
  };
}

function batchGrantRoleToUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'user-access', message: 'batch-grant', body: req.body });
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Database connection failed.'
      };
    }
    try {
      for (const userId of req.body.userIds) {
        const sqlStatement: SQLStatement = grantRoleToUserSQL(userId, req.body.roleId);
        if (!sqlStatement) {
          throw {
            status: 400,
            message: 'Failed to build SQL statement'
          };
        }
        const response = await connection.query(sqlStatement.text, sqlStatement.values);
        const result = { count: (response && response.rowCount) || 0 };
        return res.status(200).json(result);
      }
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      throw error;
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
      throw {
        status: 503,
        message: 'Database connection failed.'
      };
    }
    try {
      const sqlStatement: SQLStatement = revokeRoleFromUserSQL(req.body.userId, req.body.roleId);
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      const result = { count: (response && response.rowCount) || 0 };
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'create', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

async function getUsersForRole(req, res, next, roleId) {
  console.log('getUsersForRole Triggered. roleId: ', roleId);
  defaultLog.debug({ label: '{userId}', message: 'getUsersForRole', body: req.query });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = getUsersForRoleSQL(roleId);
    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    console.log('result', result);
    return res.status(200).json(result);
  } catch (error) {
    defaultLog.debug({ label: 'getUsersForRole', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}

async function getRolesForUser(req, res, next, userId) {
  console.log('getRolesForUser Triggered. userId: ', userId);
  defaultLog.debug({ label: '{userId}', message: 'getRolesForUser', body: req.query });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = getRolesForUserSQL(userId);
    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    console.log('result', result);
    return res.status(200).json(result);
  } catch (error) {
    defaultLog.debug({ label: 'getRolesForUser', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}
