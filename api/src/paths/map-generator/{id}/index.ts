import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { InvasivesRequest } from 'utils/auth-utils';
import { MapGenerationService } from 'utils/map-generator/map-generation-service';
import { ACTIVATED_ROLES, SECURITY_ON } from 'constants/misc';

const GET: Operation = [get()];

GET.apiDoc = {
  description: 'Fetches map generation requests by id',
  tags: ['map-generator'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ACTIVATED_ROLES
        }
      ]
    : []
};

function get(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (!req.authContext.user?.user_id) {
      throw new Error('User context is required');
    }

    const userid: number = req.authContext.user.user_id as unknown as number;

    const id = req.params.id;
    const result = await MapGenerationService.getRequest(id, userid);
    res.status(200).json(result);
  };
}

export { GET };
