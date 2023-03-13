'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { grantRoleByValueSQL } from '../queries/role-queries';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import {
  createAccessRequestSQL,
  declineAccessRequestSQL,
  approveAccessRequestsSQL,
  getAccessRequestsSQL,
  updateAccessRequestStatusSQL
} from '../queries/access-request-queries';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';

const namespace = 'access-request';

export const POST: Operation = [postHandler()];
export const GET: Operation = [getAccessRequests()];

POST.apiDoc = {
  description: 'Create a new access request.',
  tags: ['access-request'],
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
  description: 'Get list of access requests',
  tags: ['access-request'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
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

function getAccessRequests(): RequestHandler {
  return async (req, res, next) => {

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
      const sqlStatement: SQLStatement = getAccessRequestsSQL();
      if (!sqlStatement) {
        logErr()(namespace,`Invalid request: 500\n${req?.body}`);
        return res.status(500).json({
          message: 'Invalid request',
          request: req.body,
          namespace,
          code: 500
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      const result = (response && response.rows) || null;
      logData()(namespace,logMetrics.SQL_RESULTS,result);
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
      return res.status(200).json({
        message: 'Access requests retrieved',
        request: req.body,
        result: result,
        namespace,
        code: 200
      }); // TODO: UPDATE THIS
    } catch (error) {
      logErr()(namespace,`Error getting Access requests\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Database encountered an error',
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

function postHandler(): RequestHandler {
  return async (req, res, next) => {
    logEndpoint()(req,res);
    const approvedAccessRequests = req.body.approvedAccessRequests;
    const declinedAccessRequest = req.body.declinedAccessRequest;
    const newAccessRequest = req.body.newAccessRequest;
    if (approvedAccessRequests) {
      return await batchApproveAccessRequests(req, res, next, approvedAccessRequests);
    } else if (declinedAccessRequest) {
      return await declineAccessRequest(req, res, next, declinedAccessRequest);
    } else if (newAccessRequest) {
      return await createAccessRequest(req, res, next, newAccessRequest);
    } else {
      const errMsg = 'Invalid request, no approvedAccessRequests, declinedAccessRequest or newAccessRequest specified';
      logErr()(namespace,`${errMsg}\n${req?.body}`);
      return res.status(400).json({
        message: errMsg,
        request: req.body,
        namespace,
        code: 400
      });
    }
  };
}

/**
 * Create an access request
 */
async function createAccessRequest(req, res, next, newAccessRequest) {
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
    const sqlStatement: SQLStatement = createAccessRequestSQL(newAccessRequest);
    logData()(namespace,logMetrics.SQL_QUERY_SOURCE,`${newAccessRequest}\n${sqlStatement.sql}`);

    if (!sqlStatement) {
      logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        request: req.body,
        namespace,
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = { count: (response && response.rowCount) || 0 };
    logData()(namespace,logMetrics.SQL_RESULTS,result);
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
    return res.status(200).json({
      message: 'Access request created',
      request: req.body,
      result: result,
      namespace,
      code: 200
    });
  } catch (error) {
    logErr()(namespace,`Error create\n${req?.body}\n${error}`);
    return res.status(500).json({
      message: 'Database encountered an error',
      request: req.body,
      error: error,
      namespace,
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function batchApproveAccessRequests(req, res, next, approvedAccessRequests) {
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
    const requests = approvedAccessRequests;
    // for each request, approve it
    for (const request of requests) {
      // Create user record
      const sqlStatement: SQLStatement = approveAccessRequestsSQL(request);
      if (!sqlStatement) {
      logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          request: req.body,
          namespace,
          code: 500
        });
      }
      const response1 = await connection.query(sqlStatement.text, sqlStatement.values);
      const result1 = response1.rows;
      logData()(namespace,logMetrics.SQL_RESULTS,result1);

      // Update request status
      const sqlStatement2: SQLStatement = updateAccessRequestStatusSQL(request.primary_email, 'APPROVED');
      if (!sqlStatement2) {
      logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          request: req.body,
          namespace,
          code: 500
        });
      }
      // query update access request status
      const response2 = await connection.query(sqlStatement2.text, sqlStatement2.values);
      const result2 = response2.rows;
      logData()(namespace,logMetrics.SQL_RESULTS,result2);
      for (const requestedRole of request.requested_roles.split(',')) {
        const sqlStatement3: SQLStatement = grantRoleByValueSQL(request.primary_email, requestedRole);
        if (!sqlStatement3) {
          logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
          return res.status(500).json({
            message: 'Failed to build SQL statement',
            request: req.body,
            namespace,
            code: 500
          });
        }
        // query grant role by value
        await connection.query(sqlStatement3.text, sqlStatement3.values);
        // const result3 = response3.rows;
      }
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
      return res.status(201).json({
        message: 'Access request approved',
        request: req.body,
        result: { result1, result2 },
        namespace,
        code: 201
      });
    }
  } catch (error) {
    logErr()(namespace,`Error batch Approve\n${req?.body}\n${error}`);
    return res.status(500).json({
      message: 'Database encountered an error',
      request: req.body,
      error: error,
      namespace,
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function declineAccessRequest(req, res, next, declinedAccessRequest) {
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
    const request = declinedAccessRequest;
    const sqlStatement: SQLStatement = declineAccessRequestSQL(request.primary_email);
    if (!sqlStatement) {
      logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        request: req.body,
        namespace,
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = response.rows;
    logData()(namespace,logMetrics.SQL_RESULTS,result);
    logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);
    return res.status(200).json({
      message: 'Access request declined',
      request: req.body,
      result: result,
      namespace,
      code: 200
    });
  } catch (error) {
    logErr()(namespace,`Error decline\n${req?.body}\n${error}`);
    return res.status(500).json({
      message: 'Database encountered an error',
      request: req.body,
      error: error,
      namespace,
      code: 500
    });
  } finally {
    connection.release();
  }
}
