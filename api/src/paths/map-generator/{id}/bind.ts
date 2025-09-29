import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { InvasivesRequest } from 'utils/auth-utils';
import { MapGenerationService } from 'utils/map-generator/map-generation-service';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';

const POST: Operation = [bind()];

POST.apiDoc = {
  description: 'Bind additional ids to an idlist map generation request',
  tags: ['map-generator'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: '',
    required: true,
    content: {
      'application/json': {
        schema: {
          required: ['idList'],
          properties: {
            idList: {
              type: 'array',
              items: {
                type: 'number'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    202: {
      description: 'Binding was successful'
    }
  }
};

type BindRequest = {
  idList: number[];
};

function bind(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (!req.authContext.user?.user_id) {
      throw new Error('User context is required');
    }

    const userid: number = req.authContext.user.user_id as unknown as number;

    const id = req.params.id;
    const bindRequest = req.body as BindRequest;
    await MapGenerationService.bindIDsToRequest(id, bindRequest.idList, userid);
    res.status(202).send();
  };
}

export { POST };
