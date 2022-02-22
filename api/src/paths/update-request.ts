'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { grantRoleByValueSQL } from '../queries/role-queries';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import {
  createUpdateRequestSQL,
  declineUpdateRequestSQL,
  approveUpdateRequestsSQL,
  getUpdateRequestsSQL,
  updateUpdateRequestStatusSQL
} from '../queries/update-request-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('update-request');

export const POST: Operation = [postHandler()];
export const GET: Operation = [getUpdateRequests()];

POST.apiDoc = {
  description: 'Create a new update request.',
  tags: ['update-request'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }
    try {
      const sqlStatement: SQLStatement = getUpdateRequestsSQL();
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      const result = (response && response.rows) || null;
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getUpdateRequests', message: 'error', error });
      throw error;
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
      throw {
        status: 400,
        message: 'Invalid body for request'
      };
    }
  };
}

/**
 * Create an update request
 */
async function createUpdateRequest(req, res, next, newUpdateRequest) {
  // TODO: Ensure user exists before creating update request
  defaultLog.debug({ label: 'update-request', message: 'create', body: newUpdateRequest });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = createUpdateRequestSQL(newUpdateRequest);
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
}

async function batchApproveUpdateRequests(req, res, next, approvedUpdateRequests) {
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const requests = approvedUpdateRequests;
    // for each request, approve it
    for (const request of requests) {
      // Create user record
      const sqlStatement: SQLStatement = approveUpdateRequestsSQL(request);
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      await connection.query(sqlStatement.text, sqlStatement.values);

      // Update request status
      const sqlStatement2: SQLStatement = updateUpdateRequestStatusSQL(request.primary_email, 'APPROVED');
      if (!sqlStatement2) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      await connection.query(sqlStatement2.text, sqlStatement2.values);

      for (const requestedRole of request.requested_roles.split(',')) {
        const sqlStatement3: SQLStatement = grantRoleByValueSQL(request.primary_email, requestedRole);
        if (!sqlStatement3) {
          throw {
            status: 400,
            message: 'Failed to build SQL statement'
          };
        }
        await connection.query(sqlStatement3.text, sqlStatement3.values);
      }
    }
    return res.status(200).json({ count: requests.length });
  } catch (error) {
    defaultLog.debug({ label: 'batchApproveUpdateRequests', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}

async function declineUpdateRequest(req, res, next, declinedUpdateRequest) {
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const request = declinedUpdateRequest;
    console.log('Attemping to decline request...', request);
    const sqlStatement: SQLStatement = declineUpdateRequestSQL(request.primary_email);
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
    defaultLog.debug({ label: 'declineUpdateRequest', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}
