'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../../constants/misc';
import { HEADERS } from '../../utils/csv-intake-processor';

export const GET: Operation = [getTemplate()];

const GET_API_DOC = {
  tags: ['batch', 'template'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ]
};

GET.apiDoc = {
  description: 'Get a CSV template for uploading batch plant forms',
  ...GET_API_DOC
};

function getTemplate(): RequestHandler {
  return async (req, res) => {
    const headerRow = HEADERS.join(',');
    return res
      .status(200)
      .contentType('text/csv')
      .send(headerRow + '\n');
  };
}
