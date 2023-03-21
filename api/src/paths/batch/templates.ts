'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { TemplateService } from '../../utils/batch/template-utils';

export const GET: Operation = [listTemplates()];

const GET_API_DOC = {
  tags: ['batch', 'template'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : []
};

GET.apiDoc = {
  description: 'Get the list of all available templates',
  ...GET_API_DOC
};

function listTemplates(): RequestHandler {
  return async (req, res) => {
    return res.status(200).json(await TemplateService.listTemplatesShallow());
  };
}
