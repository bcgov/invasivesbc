'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { VALID_EMBEDDED_REPORTS } from './embedded-report/{reportId}';

export const GET: Operation = [listValidEmbeddedReports()];

const LIST_API_DOC = {
  tags: ['metabase'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : []
};

GET.apiDoc = {
  description: 'Get the list of queryable embedded reports',
  ...LIST_API_DOC
};

function listValidEmbeddedReports(): RequestHandler {
  return async (req, res) => {
    return res.status(200).json({
      message: 'Successfully got code tables',
      request: req.body,
      result: VALID_EMBEDDED_REPORTS,
      count: VALID_EMBEDDED_REPORTS.length,
      namespace: 'reports',
      code: 200
    });
  };
}
