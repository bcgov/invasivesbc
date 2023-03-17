'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';
import {
  getRolesForUserSQL,
  getUsersForRoleSQL,
  grantRoleToUserSQL,
  revokeRoleFromUserSQL
} from '../queries/role-queries';

const namespace = 'user-access';

export const POST: Operation = [batchGrantRoleToUser()];
export const DELETE: Operation = [revokeRoleFromUser()];
export const GET: Operation = [decideGET()];

GET.apiDoc = {
  description: 'Get some information about users and their roles',
  tags: [namespace],
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
  tags: [namespace],
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
  tags: [namespace],
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
  return async (req, res) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    const roleId = req.query.roleId;
    const userId = req.query.userId;
    if (roleId && userId) {
      return res.status(400).json({
        error: 'Only one of roleId or userId may be provided',
        request: req.body,
        namespace,
        code: 400
      });
    }
    if (roleId) {
      return await getUsersForRole(req, res, roleId, startTime);
    }
    if (userId) {
      return await getRolesForUser(req, res, userId, startTime);
    }
    return await getRolesForSelf(req, res, startTime);
  };
}

function batchGrantRoleToUser(): RequestHandler {
  return async (req, res) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    const connection = await getDBConnection();
    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace,
        code: 503
      });
    }
    try {
      for (const userId of req.body.userIds) {
        const sqlStatement: SQLStatement = grantRoleToUserSQL(userId, req.body.roleId);
        logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
        logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
        if (!sqlStatement) {
          logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
          return res.status(500).json({
            error: 'Failed to generate SQL statement',
            request: req.body,
            namespace,
            code: 500
          });
        }
        const response = await connection.query(sqlStatement.text, sqlStatement.values);
        const result = response.rows;
        logData()(namespace,logMetrics.SQL_RESULTS,JSON.stringify(result));
        logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
        return res.status(201).json({
          message: 'Successfully granted role to user',
          request: req.body,
          result: result,
          count: response.rowCount,
          namespace,
          code: 201
        });
      }
    } catch (error) {
      logErr()(namespace,`Error granting role to user\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Failed to grant role to user',
        request: req.body,
        error: error,
        namespace,
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

function revokeRoleFromUser(): RequestHandler {
  return async (req, res) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    const connection = await getDBConnection();
    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);

      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace,
        code: 503
      });
    }
    try {
      const sqlStatement: SQLStatement = revokeRoleFromUserSQL(req.body.userId, req.body.roleId);
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
      logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
      if (!sqlStatement) {
        logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
        return res.status(500).json({
          message: 'Failed to generate SQL statement',
          request: req.body,
          namespace,
          code: 500
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      logData()(namespace,logMetrics.SQL_RESULTS,JSON.stringify(response));
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
      return res.status(200).json({
        message: 'Successfully revoked role from user',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace,
        code: 200
      });
    } catch (error) {
      logErr()(namespace,`Error revoking role from user\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Failed to revoke role from user',
        request: req.body,
        error: error,
        namespace,
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

async function getUsersForRole(req, res, roleId, startTime = getStartTime(namespace)) {
  const connection = await getDBConnection();
  if (!connection) {
    logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
    return res.status(503).json({
      message: 'Database connection unavailable',
      request: req.body,
      namespace,
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = getUsersForRoleSQL(roleId);
    logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
    logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
    if (!sqlStatement) {
      logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
      return res.status(500).json({
        message: 'Failed to generate SQL statement',
        request: req.body,
        namespace,
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    logData()(namespace,logMetrics.SQL_RESULTS,JSON.stringify(response));
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
    return res.status(200).json({
      message: 'Successfully retrieved users for role',
      request: req.body,
      result: response.rows,
      count: response.rowCount,
      namespace,
      code: 200
    });
  } catch (error) {
    logErr()(namespace,`Error retrieving users for role\n${req?.body}\n${error}`);
    return res.status(500).json({
      message: 'Failed to retrieve users for role',
      request: req.body,
      error: error,
      namespace,
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function getRolesForUser(req, res, userId, startTime = getStartTime(namespace)) {
  const connection = await getDBConnection();
  if (!connection) {
    logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
    return res.status(503).json({
      message: 'Database connection unavailable',
      request: req.body,
      namespace,
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = getRolesForUserSQL(userId);
    logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
    logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
    if (!sqlStatement) {
      logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
      return res.status(500).json({
        message: 'Failed to generate SQL statement',
        request: req.body,
        namespace,
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    logData()(namespace,logMetrics.SQL_RESULTS,JSON.stringify(response));
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
    return res.status(200).json({
      message: 'Successfully retrieved roles for user',
      request: req.body,
      result: response.rows,
      count: response.rowCount,
      namespace,
      code: 200
    });
  } catch (error) {
    logErr()(namespace,`Error retrieving roles for user\n${req?.body}\n${error}`);
    return res.status(500).json({
      message: 'Failed to retrieve roles for user',
      request: req.body,
      error: error,
      namespace,
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function getRolesForSelf(req, res, startTime = getStartTime(namespace)) {
  logData()(namespace,logMetrics.SQL_QUERY_SOURCE,'Get roles for self');
  logData()(namespace,logMetrics.SQL_PARAMS,JSON.stringify(req.authContext.roles));

  const msg = 'Successfully retrieved roles for self';
  logData()(namespace,logMetrics.SQL_RESULTS,msg);
  logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
  return res.status(200).json({
    message: msg,
    request: req.body,
    result: {
      roles: req.authContext.roles,
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
    namespace,
    code: 200
  });
}
