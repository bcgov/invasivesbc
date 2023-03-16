'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { grantRoleByValueSQL } from '../queries/role-queries';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import {
  createUpdateRequestSQL,
  declineUpdateRequestSQL,
  approveUpdateRequestsSQL,
  getUpdateRequestsSQL,
  updateUpdateRequestStatusSQL
} from '../queries/update-request-queries';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';

const namespace = 'update-request';

export const POST: Operation = [postHandler()];
export const GET: Operation = [getUpdateRequests()];

POST.apiDoc = {
  description: 'Create a new update request.',
  tags: [namespace],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Access request post request object.',
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
      description: 'Access request post response object.',
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

GET.apiDoc = {
  description: 'Get list of update requests',
  tags: ['update-request'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  responses: {
    200: {
      description: 'Access request post response object.',
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

function getUpdateRequests(): RequestHandler {
  return async (req, res, next) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    const connection = await getDBConnection();
    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        message: 'Failed to establish database connection',
        req: req.body,
        namespace,
        code: 503
      });
    }
    try {
      const sqlStatement: SQLStatement = getUpdateRequestsSQL();
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
      logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
      if (!sqlStatement) {
        logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          req: req.body,
          namespace,
          code: 500
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      logData()(namespace,logMetrics.SQL_RESULTS,JSON.stringify(response));
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
      return res.status(200).json({
        message: 'Got update requests',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace,
        code: 200
      });
    } catch (error) {
      logErr()(namespace,`Error getting update requests\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Failed to get update requests',
        req: req.body,
        error: error,
        namespace,
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

function postHandler(): RequestHandler {
  return async (req, res, next) => {
    const approvedUpdateRequests = req.body.approvedUpdateRequests;
    const declinedUpdateRequest = req.body.declinedUpdateRequest;
    const newUpdateRequest = req.body.newUpdateRequest;
    if (approvedUpdateRequests) {
      return await batchApproveUpdateRequests(req, res, next, approvedUpdateRequests);
    } else if (declinedUpdateRequest) {
      return await declineUpdateRequest(req, res, next, declinedUpdateRequest);
    } else if (newUpdateRequest) {
      return await createUpdateRequest(req, res, next, newUpdateRequest);
    } else {
      return res.status(400).json({
        message: 'Invalid request - specify either approvedUpdateRequests, declinedUpdateRequest or newUpdateRequest',
        req: req.body,
        namespace,
        code: 400
      });
    }
  };
}

/**
 * Create an update request
 */
async function createUpdateRequest(req, res, next, newUpdateRequest) {
  // TODO: Ensure user exists before creating update request
  logEndpoint()(req,res);
  const startTime = getStartTime(namespace);
  const connection = await getDBConnection();
  if (!connection) {
    logErr()(namespace,`Database connection unavailable: 503\n${newUpdateRequest}`);
    return res.status(503).json({
      message: 'Failed to establish database connection',
      req: newUpdateRequest,
      namespace,
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = createUpdateRequestSQL(newUpdateRequest);
    logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
    logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
    if (!sqlStatement) {
      logErr()(namespace,`Error generating SQL statement: 500\n${newUpdateRequest}`);
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        req: newUpdateRequest,
        namespace,
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    logData()(namespace,logMetrics.SQL_RESULTS,JSON.stringify(response));
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
    return res.status(201).json({
      message: 'Update request created',
      request: newUpdateRequest,
      result: response.rows,
      count: response.rowCount,
      namespace,
      code: 201
    });
  } catch (error) {
    logErr()(namespace,`Error creating update request\n${newUpdateRequest}\n${error}`);
    return res.status(500).json({
      message: 'Failed to create update request',
      req: newUpdateRequest,
      error: error,
      namespace,
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function batchApproveUpdateRequests(req, res, next, approvedUpdateRequests) {
  logEndpoint()(req,res);
  const startTime = getStartTime(namespace);
  const connection = await getDBConnection();
  if (!connection) {
    logErr()(namespace,`Error generating SQL statement: 500\n${approvedUpdateRequests}`);
    return res.status(503).json({
      message: 'Failed to establish database connection',
      req: approvedUpdateRequests,
      namespace,
      code: 503
    });
  }
  try {
    const requests = approvedUpdateRequests;
    // for each request, approve it
    for (const request of requests) {
      // Create user record
      const sqlStatement: SQLStatement = approveUpdateRequestsSQL(request);
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
      logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
      if (!sqlStatement) {
        logErr()(namespace,`Error generating SQL statement: 500\n${approvedUpdateRequests}`);
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          req: approvedUpdateRequests,
          namespace,
          code: 500
        });
      }
      await connection.query(sqlStatement.text, sqlStatement.values);

      // Update request status
      const sqlStatement2: SQLStatement = updateUpdateRequestStatusSQL(request.primary_email, 'APPROVED');
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement2.sql);
      logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement2.values);
      if (!sqlStatement2) {
        logErr()(namespace,`Error generating SQL statement: 500\n${approvedUpdateRequests}`);
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          req: approvedUpdateRequests,
          namespace,
          code: 500
        });
      }
      await connection.query(sqlStatement2.text, sqlStatement2.values);

      for (const requestedRole of request.requested_roles.split(',')) {
        const sqlStatement3: SQLStatement = grantRoleByValueSQL(request.primary_email, requestedRole);
        logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement3.sql);
        logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement3.values);
        if (!sqlStatement3) {
        logErr()(namespace,`Error generating SQL statement: 500\n${approvedUpdateRequests}`);
          return res.status(500).json({
            message: 'Failed to build SQL statement',
            req: approvedUpdateRequests,
            namespace,
            code: 500
          });
        }
        await connection.query(sqlStatement3.text, sqlStatement3.values);
      }
    }
    logData()(namespace,logMetrics.SQL_RESULTS,'Approved update requests');
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
    return res.status(200).json({
      message: 'Approved update requests',
      request: approvedUpdateRequests,
      result: requests,
      count: requests.length,
      namespace,
      code: 200
    });
  } catch (error) {
    logErr()(namespace,`Error approving update requests\n${approvedUpdateRequests}\n${error}`);
    return res.status(500).json({
      message: 'Failed to approve update requests',
      req: approvedUpdateRequests,
      error: error,
      namespace,
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function declineUpdateRequest(req, res, next, declinedUpdateRequest) {
  logEndpoint()(req,res);
  const startTime = getStartTime(namespace);
  const connection = await getDBConnection();
  if (!connection) {
    logErr()(namespace,`Database connection unavailable: 503\n${declinedUpdateRequest}`);
    return res.status(503).json({
      message: 'Failed to establish database connection',
      req: declinedUpdateRequest,
      namespace,
      code: 503
    });
  }
  try {
    const request = declinedUpdateRequest;
    const sqlStatement: SQLStatement = declineUpdateRequestSQL(request.primary_email);
    logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
    logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);
    if (!sqlStatement) {
      logErr()(namespace,`Error generating SQL statement: 500\n${declinedUpdateRequest}`);
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        req: declinedUpdateRequest,
        namespace,
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    logData()(namespace,logMetrics.SQL_RESULTS,JSON.stringify(response));
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
    return res.status(200).json({
      message: 'Declined update request',
      request: declinedUpdateRequest,
      result: response.rows,
      count: response.rowCount,
      namespace,
      code: 200
    });
  } catch (error) {
    logErr()(namespace,`Error declining update request\n${declinedUpdateRequest}\n${error}`);
    return res.status(500).json({
      message: 'Failed to decline update request',
      req: declinedUpdateRequest,
      error: error,
      namespace,
      code: 500
    });
  } finally {
    connection.release();
  }
}
