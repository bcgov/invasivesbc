import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { InvasivesRequest } from 'utils/auth-utils';
import {
  MapGenerationRequestCreationRequest,
  MapGenerationService,
  MapGenerationValueLiterals
} from 'utils/map-generator/map-generation-service';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';

const GET: Operation = [list()];
const POST: Operation = [create()];

GET.apiDoc = {
  description: 'Fetches all map generation requests',
  tags: ['map-generator'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : []
};

POST.apiDoc = {
  description: 'Create new generation request',
  tags: ['map-generator'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Generation request specifications',
    required: true,
    content: {
      'application/json': {
        schema: {
          required: ['vectorGenerationMode'],
          properties: {
            vectorGenerationMode: {
              type: 'string',
              enum: [...MapGenerationValueLiterals.VectorGenerationMode]
            },
            expires: {
              type: 'string',
              format: 'full-date'
            },
            minZoom: {
              type: 'number',
              minimum: 1,
              maximum: 24
            },
            maxZoom: {
              type: 'number',
              minimum: 1,
              maximum: 24
            },
            archiveFormat: {
              type: 'string',
              enum: [...MapGenerationValueLiterals.ArchiveFormat]
            },
            audience: {
              type: 'string',
              enum: [...MapGenerationValueLiterals.Audience]
            },
            idList: {
              type: 'array',
              items: {
                type: 'number'
              }
            },
            bbox: {
              type: 'object',
              required: ['minX', 'minY', 'maxX', 'maxY'],
              properties: {
                minX: {
                  type: 'number',
                  minimum: -180,
                  maximum: 180
                },
                minY: {
                  type: 'number',
                  minimum: -180,
                  maximum: 180
                },
                maxX: {
                  type: 'number',
                  minimum: -180,
                  maximum: 180
                },
                maxY: {
                  type: 'number',
                  minimum: -180,
                  maximum: 180
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Identifier of created request',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'identifier of created map generation request'
              }
            }
          }
        }
      }
    }
  }
};

function list(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (!req.authContext.user?.user_id) {
      throw new Error('User context is required');
    }

    const userid: number = req.authContext.user.user_id as unknown as number;

    const requests = await MapGenerationService.listRequests(userid);
    res.status(200).json(requests);
  };
}

function create(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (!req.authContext.user?.user_id) {
      throw new Error('User context is required');
    }

    const userid: number = req.authContext.user.user_id as unknown as number;

    const validatedRequest: MapGenerationRequestCreationRequest = {
      ...req.body,
      tileType: 'VECTOR',
      creatingUserId: userid
    };
    const result = await MapGenerationService.createRequest(validatedRequest);
    res.status(200).json({ id: result });
  };
}

export { GET, POST };
