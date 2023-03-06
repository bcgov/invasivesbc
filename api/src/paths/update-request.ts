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
// import { getLogger } from '../utils/logger';

const namespace = ('update-request');

export const POST: Operation = [postHandler()];
export const GET: Operation = [getUpdateRequests()];

POST.apiDoc = {
  description: 'Create a new update request.',
  tags: ['update-request'],
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
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Failed to establish database connection',
        req: req.body,
        namespace: 'update-request',
        code: 503
      });
    }
    try {
      const sqlStatement: SQLStatement = getUpdateRequestsSQL();
      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          req: req.body,
          namespace: 'update-request',
          code: 500
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json({
        message: 'Got update requests',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'update-request',
        code: 200
      });
    } catch (error) {
      // defaultLog.debug({ label: 'getUpdateRequests', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to get update requests',
        req: req.body,
        error: error,
        namespace: 'update-request',
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
        namespace: 'update-request',
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
  // defaultLog.debug({ label: 'update-request', message: 'create', body: newUpdateRequest });
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Failed to establish database connection',
      req: req.body,
      namespace: 'update-request',
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = createUpdateRequestSQL(newUpdateRequest);
    if (!sqlStatement) {
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        req: req.body,
        namespace: 'update-request',
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(201).json({
      message: 'Update request created',
      request: req.body,
      result: response.rows,
      count: response.rowCount,
      namespace: 'update-request',
      code: 201
    });
  } catch (error) {
    // defaultLog.debug({ label: 'create', message: 'error', error });
    return res.status(500).json({
      message: 'Failed to create update request',
      req: req.body,
      error: error,
      namespace: 'update-request',
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function batchApproveUpdateRequests(req, res, next, approvedUpdateRequests) {
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Failed to establish database connection',
      req: req.body,
      namespace: 'update-request',
      code: 503
    });
  }
  try {
    const requests = approvedUpdateRequests;
    // for each request, approve it
    for (const request of requests) {
      // Create user record
      const sqlStatement: SQLStatement = approveUpdateRequestsSQL(request);
      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          req: req.body,
          namespace: 'update-request',
          code: 500
        });
      }
      await connection.query(sqlStatement.text, sqlStatement.values);

      // Update request status
      const sqlStatement2: SQLStatement = updateUpdateRequestStatusSQL(request.primary_email, 'APPROVED');
      if (!sqlStatement2) {
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          req: req.body,
          namespace: 'update-request',
          code: 500
        });
      }
      await connection.query(sqlStatement2.text, sqlStatement2.values);

      for (const requestedRole of request.requested_roles.split(',')) {
        const sqlStatement3: SQLStatement = grantRoleByValueSQL(request.primary_email, requestedRole);
        if (!sqlStatement3) {
          return res.status(500).json({
            message: 'Failed to build SQL statement',
            req: req.body,
            namespace: 'update-request',
            code: 500
          });
        }
        await connection.query(sqlStatement3.text, sqlStatement3.values);
      }
    }
    return res.status(200).json({
      message: 'Approved update requests',
      request: req.body,
      result: requests,
      count: requests.length,
      namespace: 'update-request',
      code: 200
    });
  } catch (error) {
    // defaultLog.debug({ label: 'batchApproveUpdateRequests', message: 'error', error });
    return res.status(500).json({
      message: 'Failed to approve update requests',
      req: req.body,
      error: error,
      namespace: 'update-request',
      code: 500
    });
  } finally {
    connection.release();
  }
}

async function declineUpdateRequest(req, res, next, declinedUpdateRequest) {
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Failed to establish database connection',
      req: req.body,
      namespace: 'update-request',
      code: 503
    });
  }
  try {
    const request = declinedUpdateRequest;
    const sqlStatement: SQLStatement = declineUpdateRequestSQL(request.primary_email);
    if (!sqlStatement) {
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        req: req.body,
        namespace: 'update-request',
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(200).json({
      message: 'Declined update request',
      request: req.body,
      result: response.rows,
      count: response.rowCount,
      namespace: 'update-request',
      code: 200
    });
  } catch (error) {
    // defaultLog.debug({ label: 'declineUpdateRequest', message: 'error', error });
    return res.status(500).json({
      message: 'Failed to decline update request',
      req: req.body,
      error: error,
      namespace: 'update-request',
      code: 500
    });
  } finally {
    connection.release();
  }
}
