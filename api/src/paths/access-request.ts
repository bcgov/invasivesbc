'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import {
  createAccessRequestSQL,
  declineAccessRequestSQL,
  approveAccessRequestsSQL,
  getAccessRequestsSQL
} from '../queries/access-request-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('access-request');

export const POST: Operation = [postHandler()];
export const GET: Operation = [getAccessRequests()];

POST.apiDoc = {
  description: 'Create a new access request.',
  tags: ['access-request'],
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
  description: 'Get list of access requests',
  tags: ['access-request'],
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

function getAccessRequests(): RequestHandler {
  return async (req, res, next) => {
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }
    try {
      const sqlStatement: SQLStatement = getAccessRequestsSQL();
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
      defaultLog.debug({ label: 'getAccessRequests', message: 'error', error });
      throw error;
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
      throw {
        status: 400,
        message: 'Invalid body for request'
      };
    }
  };
}

/**
 * Create an access request
 */
async function createAccessRequest(req, res, next, newAccessRequest) {
  defaultLog.debug({ label: 'access-request', message: 'create', body: newAccessRequest });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = createAccessRequestSQL(newAccessRequest);
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

async function batchApproveAccessRequests(req, res, next, approvedAccessRequests) {
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const requests = approvedAccessRequests;
    // for each request, approve it
    for (const request of requests) {
      console.log('Attempting to approve request...', request);
      const sqlStatement: SQLStatement = approveAccessRequestsSQL(request);
      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      await connection.query(sqlStatement.text, sqlStatement.values);
    }
    return res.status(200).json({ count: requests.length });
  } catch (error) {
    defaultLog.debug({ label: 'batchApproveAccessRequests', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}

async function declineAccessRequest(req, res, next, declinedAccessRequest) {
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const request = declinedAccessRequest;
    const sqlStatement: SQLStatement = declineAccessRequestSQL(request.email);
    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }
  } catch (error) {
    defaultLog.debug({ label: 'declineAccessRequest', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}
