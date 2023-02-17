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
// import { getLogger } from '../utils/logger';

// const defaultLog = getLogger('access-request');

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
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'access-request',
        code: 503
      });
    }
    try {
      const sqlStatement: SQLStatement = getAccessRequestsSQL();
      if (!sqlStatement) {
        return res.status(400).json({
          message: 'Invalid request',
          request: req.body,
          namespace: 'access-request',
          code: 400
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      const result = (response && response.rows) || null;
      return res.status(200).json({
        message: 'Access requests retrieved',
        request: req.body,
        result: result,
        namespace: 'access-request',
        code: 200
      }); // TODO: UPDATE THIS
    } catch (error) {
      // defaultLog.debug({ label: 'getAccessRequests', message: 'error', error });
      return res.status(500).json({
        message: 'Database encountered an error',
        request: req.body,
        error: error,
        namespace: 'access-request',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

function postHandler(): RequestHandler {
  return async (req, res, next) => {
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
      return res.status(400).json({
        message: 'Invalid request, no approvedAccessRequests, declinedAccessRequest or newAccessRequest specified',
        request: req.body,
        namespace: 'access-request',
        code: 400
      });
    }
  };
}

/**
 * Create an access request
 */
async function createAccessRequest(req, res, next, newAccessRequest) {
  // defaultLog.debug({ label: 'access-request', message: 'create', body: newAccessRequest });
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Database connection unavailable',
      request: req.body,
      namespace: 'access-request',
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = createAccessRequestSQL(newAccessRequest);
    if (!sqlStatement) {
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        request: req.body,
        namespace: 'access-request',
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = { count: (response && response.rowCount) || 0 };
    return res.status(200).json({
      message: 'Access request created',
      request: req.body,
      result: result,
      namespace: 'access-request',
      code: 200
    });
  } catch (error) {
    // defaultLog.debug({ label: 'create', message: 'error', error });
    return res.status(500).json({
      message: 'Database encountered an error',
      request: req.body,
      error: error,
      namespace: 'access-request',
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function batchApproveAccessRequests(req, res, next, approvedAccessRequests) {
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Database connection unavailable',
      request: req.body,
      namespace: 'access-request',
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
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          request: req.body,
          namespace: 'access-request',
          code: 500
        });
      }
      const response1 = await connection.query(sqlStatement.text, sqlStatement.values);
      const result1 = response1.rows;

      // Update request status
      const sqlStatement2: SQLStatement = updateAccessRequestStatusSQL(request.primary_email, 'APPROVED');
      if (!sqlStatement2) {
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          request: req.body,
          namespace: 'access-request',
          code: 500
        });
      }
      // query update access request status
      const response2 = await connection.query(sqlStatement2.text, sqlStatement2.values);
      const result2 = response2.rows;
      for (const requestedRole of request.requested_roles.split(',')) {
        const sqlStatement3: SQLStatement = grantRoleByValueSQL(request.primary_email, requestedRole);
        if (!sqlStatement3) {
          return res.status(500).json({
            message: 'Failed to build SQL statement',
            request: req.body,
            namespace: 'access-request',
            code: 500
          });
        }
        // query grant role by value
        await connection.query(sqlStatement3.text, sqlStatement3.values);
        // const result3 = response3.rows;
      }
      return res.status(201).json({
        message: 'Access request approved',
        request: req.body,
        result: { result1, result2 },
        namespace: 'access-request',
        code: 201
      });
    }
  } catch (error) {
    // defaultLog.debug({ label: 'batchApproveAccessRequests', message: 'error', error });
    return res.status(500).json({
      message: 'Database encountered an error',
      request: req.body,
      error: error,
      namespace: 'access-request',
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function declineAccessRequest(req, res, next, declinedAccessRequest) {
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Database connection unavailable',
      request: req.body,
      namespace: 'access-request',
      code: 503
    });
  }
  try {
    const request = declinedAccessRequest;
    const sqlStatement: SQLStatement = declineAccessRequestSQL(request.primary_email);
    if (!sqlStatement) {
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        request: req.body,
        namespace: 'access-request',
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = response.rows;
    return res.status(200).json({
      message: 'Access request declined',
      request: req.body,
      result: result,
      namespace: 'access-request',
      code: 200
    });
  } catch (error) {
    // defaultLog.debug({ label: 'declineAccessRequest', message: 'error', error });
    return res.status(500).json({
      message: 'Database encountered an error',
      request: req.body,
      error: error,
      namespace: 'access-request',
      code: 500
    });
  } finally {
    connection.release();
  }
}
