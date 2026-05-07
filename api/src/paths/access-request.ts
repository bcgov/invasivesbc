import { RequestHandler, Response } from 'express';
import { Operation } from 'express-openapi';
import SQL, { SQLStatement } from 'sql-template-strings';
import { PoolClient } from 'pg';
import { getEmailTemplatesFromDB } from './email-templates';
import { ACTIVATED_ROLES, Role, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import {
  approveAccessRequestsSQL,
  createAccessRequestSQL,
  getAccessRequestsSQL,
  updateAccessRequestSQL,
  updateAccessRequestStatusSQL,
  userHasPendingAccessRequestSQL
} from 'queries/access-request-queries';
import { grantRoleByValueSQL, revokeAllRolesExceptAdmin } from 'queries/role-queries';
import { getUserByBCEIDSQL, getUserByIDIRSQL } from 'queries/user-queries';
import { getLogger } from 'utils/logger';
import { buildMailer } from 'utils/mailer';
import isAdminFromAuthContext from 'utils/isAdminFromAuthContext';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import { InvasivesRequest } from 'utils/auth-utils';

const defaultLog = getLogger('access-request');
const logger = new LoggerHandler('access-request');

const POST: Operation = [postHandler()];
const GET: Operation = [getAccessRequests()];

POST.apiDoc = {
  description: 'Create a new access request.',
  tags: ['access-request'],
  security: SECURITY_ON
    ? [
        {
          Bearer: [...ACTIVATED_ROLES, Role.NOT_ACTIVATED]
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
          Bearer: ACTIVATED_ROLES
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
    if (!isAdminFromAuthContext(req)) {
      return res.status(401).json({
        message: 'Unauthorized access',
        request: req.body,
        namespace: 'access-request',
        code: 401
      });
    }
    let connection: PoolClient | undefined;
    try {
      connection = await getDBConnection();

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
      connection?.release();
    }
  };
}
/**
 * @desc Handles post requests, any keycloak user can make an access request, only admins can approve/deny them
 */
function postHandler(): RequestHandler {
  return async (req: InvasivesRequest, res: Response, next) => {
    const approvedAccessRequests = req.body.approvedAccessRequests;
    const declinedAccessRequest = req.body.declinedAccessRequest;
    const newAccessRequest = req.body.newAccessRequest;
    if (newAccessRequest) {
      return await createAccessRequest(req, res, next, newAccessRequest);
    }
    if (!isAdminFromAuthContext(req)) {
      return res.status(401).json({
        message: 'Unauthorized access',
        request: req.body,
        namespace: 'access-request',
        code: 401
      });
    }
    if (approvedAccessRequests) {
      return await batchApproveAccessRequests(req, res, next, approvedAccessRequests);
    } else if (declinedAccessRequest) {
      return await declineAccessRequest(req, res, next, declinedAccessRequest);
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
async function createAccessRequest(req, res, _, newAccessRequest) {
  defaultLog.debug({ label: 'access-request', message: 'create', body: newAccessRequest });

  let connection: PoolClient | undefined;

  try {
    connection = await getDBConnection();
    const { bceid, idir } = newAccessRequest;
    const pendingRequestSQL = userHasPendingAccessRequestSQL(bceid ?? idir);
    const pendingRequestSQLResponse = await connection.query(pendingRequestSQL.text, pendingRequestSQL.values);
    const updateExistingRequest = pendingRequestSQLResponse.rowCount > 0;

    const sqlStatement: SQLStatement = updateExistingRequest
      ? updateAccessRequestSQL(pendingRequestSQLResponse.rows[0].access_request_id, newAccessRequest)
      : createAccessRequestSQL(newAccessRequest);

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
      message: `Access request ${updateExistingRequest ? 'updated' : 'created'}`,
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
    connection?.release();
  }
}

async function batchApproveAccessRequests(req: InvasivesRequest, res: Response, _, approvedAccessRequests) {
  // Filter out any requests with no roles
  const approvedRequests = approvedAccessRequests.filter((aar) => !!aar.requested_roles);
  let connection: PoolClient | undefined;

  try {
    connection = await getDBConnection();
    // Step 1: Begin Transaction
    await connection.query(SQL`BEGIN`);
    for (const request of approvedRequests) {
      // Step 2: Fetch details of user
      const getUserDetailSQL: SQLStatement = request.idir_userid
        ? getUserByIDIRSQL(request.idir_userid)
        : getUserByBCEIDSQL(request.bceid_userid);

      const response = await connection.query(getUserDetailSQL.text, getUserDetailSQL.values);
      const { user_id, email } = response.rows[0];
      logger.info('', { user_id, email });
      if (!user_id || !email) throw new Error(`User not found in Database | ${user_id}: ${email}`);
      // Step 3: Revoke Existing [Non-admin] Roles
      await connection.query(revokeAllRolesExceptAdmin(user_id));

      // Step 4: Add New roles
      for (const role of request.requested_roles.split(',')) {
        const grantNewRoleSQL: SQLStatement = grantRoleByValueSQL(email, role);
        await connection.query(grantNewRoleSQL.text, grantNewRoleSQL.values);
        logger.debug(`Granted new Role to user: ${email}: ${role}`);
      }

      // Step 5: Update Statuses
      await connection.query(updateAccessRequestStatusSQL(email, 'APPROVED', request.access_request_id));
      await connection.query(approveAccessRequestsSQL(request));
    }

    // Step 6: Commit Transactions
    await connection.query(SQL`COMMIT`);

    // Step 7: Email User(s) after all requests processed
    const mailer = await buildMailer();
    const templatesResponse = await getEmailTemplatesFromDB();
    const approvedTemplate = templatesResponse.result?.find((template) => template.templatename === 'Approved');
    for (const request of approvedAccessRequests) {
      mailer.sendEmail(
        [request.primary_email],
        approvedTemplate.fromemail,
        approvedTemplate.emailsubject,
        approvedTemplate.emailbody,
        'html'
      );
    }
    return res.status(201).json({
      message: 'Access requests processed',
      request: req.body,
      namespace: 'access-request',
      code: 201
    });
  } catch (ex) {
    await connection.query(SQL`ROLLBACK`);
    const reqIds = approvedAccessRequests.map((r) => r.access_request_id).join(',');
    logger.error(ex, `Error occurred in approving access requests id(s): ${reqIds}`);
    throw ex;
  } finally {
    connection?.release();
  }
}

async function declineAccessRequest(req: InvasivesRequest, res: Response, _, declinedAccessRequest) {
  let connection: PoolClient | undefined;

  try {
    connection = await getDBConnection();
    const request = declinedAccessRequest;
    const sqlStatement: SQLStatement = updateAccessRequestStatusSQL(
      request.primary_email,
      'DECLINED',
      request.access_request_id
    );
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
    const declinedTemplate = templatesResponse.result?.find((template) => template.templatename === 'Declined');
    mailer.sendEmail(
      [request.primary_email],
      declinedTemplate.fromemail,
      declinedTemplate.emailsubject,
      declinedTemplate.emailbody,
      'html'
    );
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
    connection?.release();
  }
}

export { POST, GET };
