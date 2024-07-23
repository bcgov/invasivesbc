import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { getEmailSettingsSQL, updateEmailSettingsSQL } from 'queries/email-settings-queries';
import { getLogger } from 'utils/logger';
import { InvasivesRequest } from 'utils/auth-utils';
import isAdminFromAuthContext from 'utils/isAdminFromAuthContext';

const defaultLog = getLogger('email-settings');

export const GET: Operation = [getEmailSettings()];
export const PUT: Operation = [updateEmailSettings()];

PUT.apiDoc = {
  description: 'update email setting.',
  tags: ['email-settings'],
  security: SECURITY_ON
    ? [
      {
        Bearer: ALL_ROLES
      }
    ]
    : [],
  requestBody: {
    description: 'email setting put request object.',
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
      description: 'email setting put response object.',
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
  description: 'Get list of email settings',
  tags: ['email-settings'],
  security: SECURITY_ON
    ? [
      {
        Bearer: ALL_ROLES
      }
    ]
    : [],
  responses: {
    200: {
      description: 'email setting post response object.',
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

export async function getEmailSettingsFromDB() {
  const connection = await getDBConnection();
  if (!connection) {
    return {
      message: 'Database connection unavailable',
      namespace: 'email-settings',
      code: 503
    };
  }
  try {
    const sqlStatement: SQLStatement = getEmailSettingsSQL();
    if (!sqlStatement) {
      return {
        message: 'Invalid request',
        namespace: 'email-settings',
        code: 400
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = response?.rows;
    return {
      message: 'email settings retrieved',
      result: result,
      namespace: 'email-settings',
      code: 200
    };
  } catch (error) {
    defaultLog.debug({ label: 'getEmailSettings', message: 'error', error });
    return {
      message: 'Database encountered an error',
      error: error,
      namespace: 'email-settings',
      code: 500
    };
  } finally {
    connection.release();
  }
}

function getEmailSettings(): RequestHandler {
  return async (req, res) => {
    if (!isAdminFromAuthContext(req)) {
      return res.status(401).json({
        message: 'Unauthorized access',
        request: req.body,
        namespace: 'email-settings',
        code: 401
      });
    };
    const response = await getEmailSettingsFromDB();
    return res.status(response.code).json({ ...response, request: req.body });
  };
}

function updateEmailSettings(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    defaultLog.debug({ label: 'email-settings', message: 'updateEmailSettings', body: req.params });
    if (!isAdminFromAuthContext(req)) {
      return res.status(401).json({
        message: 'Invalid request, user is not authorized to update this record',
        request: req.body,
        namespace: 'email-settings',
        code: 401
      });
    }
    const data = { ...req.body, user_role: req.authContext?.roles[0] };
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'email-settings',
        code: 503
      });
    }
    try {
      const sqlStatement = updateEmailSettingsSQL(
        data.enabled,
        data.authenticationURL,
        data.emailServiceURL,
        data.clientId,
        data.clientSecret,
        data.id
      );
      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to build SQL statement.',
          request: req.body,
          namespace: 'email-settings',
          code: 500
        });
      }
      await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json({
        message: 'Updated successfully',
        request: req.body,
        namespace: 'email-settings',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'updateEmailSettings', message: 'error', error });
      return res.status(500).json({
        message: 'Error updating email settings.',
        request: req.body,
        error: error,
        namespace: 'email-settings',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
