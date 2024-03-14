import { ALL_ROLES } from '../constants/misc.js';

export const retrieveGetDoc = (responseDescription: string) => {
  return {
    security: [
      {
        Bearer: ALL_ROLES
      }
    ],
    responses: {
      200: {
        description: responseDescription,
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  // Don't specify exact response, as it will vary, and is not currently enforced anyways
                  // Eventually this could be updated to be a oneOf list, similar to the Post request below.
                }
              }
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
};
