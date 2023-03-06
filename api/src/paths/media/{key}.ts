'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { getS3SignedURL } from '../../utils/file-utils';

export const GET: Operation = [getSignedURL()];
const namespace = 'media/{key}';

GET.apiDoc = {
  description: 'Fetches a signed url for a single media item based on its key.',
  tags: ['media'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  parameters: [
    {
      in: 'path',
      name: 'key',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'text/plain': {
          schema: {
            type: 'string',
            description: 'A signed url'
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

function getSignedURL(): RequestHandler {
  return async (req, res) => {
    if (!req.params.key) {
      return res.status(400).json({
        message: 'Missing key',
        request: req.body,
        namespace,
        code: 400
      });
    }

    const result = await getS3SignedURL(req.params.key);

    return res.status(200).json({
      message: 'Signed url',
      request: req.body,
      result: result,
      namespace,
      code: 200
    });
  };
}
