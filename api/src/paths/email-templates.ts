'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import {
  getEmailTemplatesSQL, updateEmailTemplatesSQL
} from '../queries/email-templates-queries';
import { getLogger } from '../utils/logger';
import { InvasivesRequest } from 'utils/auth-utils';

const defaultLog = getLogger('email-templates');

export const GET: Operation = [getEmailTemplates()];
export const PUT: Operation = [updateEmailTemplates()];

PUT.apiDoc = {
  description: 'update email template.',
  tags: ['email-templates'],
  security: SECURITY_ON
    ? [
      {
        Bearer: ALL_ROLES
      }
    ]
    : [],
  requestBody: {
    description: 'email template put request object.',
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
      description: 'email template put response object.',
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
  description: 'Get list of email templates',
  tags: ['email-templates'],
  security: SECURITY_ON
    ? [
      {
        Bearer: ALL_ROLES
      }
    ]
    : [],
  responses: {
    200: {
      description: 'email template post response object.',
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

export async function getEmailTemplatesFromDB() {
  const connection = await getDBConnection();
  if (!connection) {
    return {
      message: 'Database connection unavailable',
      namespace: 'email-templates',
      code: 503
    };
  }
  try {
    const sqlStatement: SQLStatement = getEmailTemplatesSQL();
    if (!sqlStatement) {
      return {
        message: 'Invalid request',
        namespace: 'email-templates',
        code: 400
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = response?.rows;
    return {
      message: 'email templates retrieved',
      result: result,
      namespace: 'email-templates',
      code: 200
    };
  } catch (error) {
    defaultLog.error({ label: 'getEmailTemplates', message: 'error', error });
    return {
      message: 'Database encountered an error',
      error: error,
      namespace: 'email-templates',
      code: 500
    };
  } finally {
    connection.release();
  }
}

function getEmailTemplates(): RequestHandler {
  return async (req, res) => {
    const response = await getEmailTemplatesFromDB();
    return res.status(response.code).json({ ...response, request: req.body });
  };
};

function updateEmailTemplates(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    defaultLog.debug({ label: 'email-templates', message: 'updateEmailTemplates', body: req.params });
    const isAdmin = (req as any).authContext.roles.find(role => role.role_id === 18)
    if (!isAdmin) {
      return res.status(401).json({
        message: 'Invalid request, user is not authorized to update this record',
        request: req.body,
        namespace: 'email-templates',
        code: 401
      });
    }
    const data = { ...req.body, user_role: req.authContext?.roles[0] };
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'email-templates',
        code: 503
      });
    }
    try {
      const sqlStatement = updateEmailTemplatesSQL(data.fromemail, data.emailsubject, data.emailbody, data.id);
      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to build SQL statement.',
          request: req.body,
          namespace: 'email-templates',
          code: 500
        });
      }
      await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json({
        message: 'Updated successfully',
        request: req.body,
        namespace: 'email-templates',
        code: 200,
      });
    } catch (error) {
      defaultLog.debug({ label: 'updateEmailTemplates', message: 'error', error });
      return res.status(500).json({
        message: 'Error updating email templates.',
        request: req.body,
        error: error,
        namespace: 'email-templates',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
};
