'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import {
  approveAccessRequestsSQL, createAccessRequestSQL, getAccessRequestsSQL,
  updateAccessRequestStatusSQL
} from '../queries/access-request-queries';
import { grantRoleByValueSQL, revokeAllRolesExceptAdmin } from '../queries/role-queries';
import { getUserByBCEIDSQL, getUserByIDIRSQL } from '../queries/user-queries';
import { getLogger } from '../utils/logger';
import { buildMailer } from '../utils/mailer';
import { getEmailTemplatesFromDB } from './email-templates';

const defaultLog = getLogger('access-request');

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
      defaultLog.debug({ label: 'getAccessRequests', message: 'error', error });
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
  defaultLog.debug({ label: 'access-request', message: 'create', body: newAccessRequest });
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
    defaultLog.debug({ label: 'create', message: 'error', error });
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
    for (const request of requests) {
      if (!request.requested_roles)
        continue;
      try {
        // Update request status
        const sqlStatement2: SQLStatement = updateAccessRequestStatusSQL(request.primary_email, 'APPROVED', request.access_request_id);
        if (!sqlStatement2) {
          return res.status(500).json({
            message: 'Failed to build SQL statement',
            request: req.body,
            namespace: 'access-request',
            code: 500
          });
        }
        await connection.query(sqlStatement2.text, sqlStatement2.values);
        const sqlStatement5: SQLStatement = request.idir_userid ? getUserByIDIRSQL(request.idir_userid) : getUserByBCEIDSQL(request.bceid_userid);
        if (!sqlStatement5) {
          return res.status(500).json({
            message: 'Failed to generate SQL statement',
            request: req.body,
            namespace: 'user-access',
            code: 500
          });
        }
        const response = await connection.query(sqlStatement5.text, sqlStatement5.values);
        const userId = response.rows[0].user_id;
        const sqlStatement4: SQLStatement = revokeAllRolesExceptAdmin(userId);
        if (!sqlStatement4) {
          return res.status(500).json({
            message: 'Failed to generate SQL statement',
            request: req.body,
            namespace: 'user-access',
            code: 500
          });
        }
        await connection.query(sqlStatement4.text, sqlStatement4.values);
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
          await connection.query(sqlStatement3.text, sqlStatement3.values);
        }
        const sqlStatement: SQLStatement = approveAccessRequestsSQL(request);
        if (!sqlStatement) {
          return res.status(500).json({
            message: 'Failed to build SQL statement',
            request: req.body,
            namespace: 'access-request',
            code: 500
          });
        }
        await connection.query(sqlStatement.text, sqlStatement.values);
        const mailer = await buildMailer();
        const templatesResponse = await getEmailTemplatesFromDB();
        const approvedTemplate = templatesResponse.result?.find(template => template.templatename === 'Approved')
        mailer.sendEmail([request.primary_email],
          approvedTemplate.fromemail,
          approvedTemplate.emailsubject,
          approvedTemplate.emailbody,
          'html');
      } catch (error) {
        defaultLog.debug({ label: 'batchApproveAccessRequests', message: 'database encountered an error', error });
      }
    }
  } catch (error) {
    defaultLog.debug({ label: 'batchApproveAccessRequests', message: 'error', error });
  } finally {
    connection.release();
  }
  return res.status(201).json({
    message: 'Acccess requests processed',
    request: req.body,
    namespace: 'access-request',
    code: 201
  });
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
    const sqlStatement: SQLStatement = updateAccessRequestStatusSQL(request.primary_email, 'DECLINED', request.access_request_id);
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
    const mailer = await buildMailer();
    const templatesResponse = await getEmailTemplatesFromDB();
    const declinedTemplate = templatesResponse.result?.find(template => template.templatename === 'Declined')
    mailer.sendEmail([request.primary_email],
      declinedTemplate.fromemail,
      declinedTemplate.emailsubject,
      declinedTemplate.emailbody,
      'html');
    return res.status(200).json({
      message: 'Access request declined',
      request: req.body,
      result: result,
      namespace: 'access-request',
      code: 200
    });
  } catch (error) {
    defaultLog.debug({ label: 'declineAccessRequest', message: 'error', error });
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
