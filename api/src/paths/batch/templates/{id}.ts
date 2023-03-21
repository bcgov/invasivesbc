'use strict';

import {RequestHandler} from 'express';
import {Operation} from 'express-openapi';
import {ALL_ROLES, SECURITY_ON} from '../../../constants/misc';
import {TemplateService} from '../../../utils/batch/template-utils';

export const GET: Operation = [downloadTemplate()];

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
  description: 'Download a template, in CSV or JSON',
  ...GET_API_DOC
};

function downloadTemplate(): RequestHandler {
  return async (req, res) => {
    let template;
    try {
      template = await TemplateService.getTemplate(req.params['id']);
    } catch (e) {
      return res.status(404);
    }

    switch (req.headers.accept) {
      case 'text/csv':
        return res
          .status(200)
          .contentType('text/csv')
          .send(template.columns.map((c) => c.name).join(', ') + '\n');
        break;
      case 'application/json':
      default:
        return res.status(200).json(template);
        break;
    }
  };
}
