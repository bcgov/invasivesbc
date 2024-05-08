import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { deleteFileFromS3 } from 'utils/file-utils';

const DELETE: Operation = [deleteMedia()];

DELETE.apiDoc = {
  description: 'Deletes a photo from activity record',
  tags: ['media'],
  // security: SECURITY_ON
  //   ? [
  //       {
  //         Bearer: ALL_ROLES
  //       }
  //     ]
  //   : [],
  parameters: [
    {
      in: 'path',
      name: 'key',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Delete photo from activity.',
      content: {
        'text/plain': {
          schema: {
            type: 'string',
            description: 'Photo deleted'
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

export function deleteMedia(): RequestHandler {
  return async (req, res, next) => {
    if (!req.params.key) {
      // No media keys found, skipping delete media step
      return next();
    }

    const result = await deleteFileFromS3(req.params.key);

    return res.status(200).json({
      message: 'Delete file',
      request: req.body,
      result: result,
      code: 200
    });
  };
}

export default { DELETE };
