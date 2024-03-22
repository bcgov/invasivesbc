import { InvasivesRequest } from 'utils/auth-utils';
import { PostgresTileService } from 'utils/vectors/tile-service';
import { RequestHandler } from 'express';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { Operation } from 'express-openapi';

export const GET: Operation = [tile()];


const GET_API_DOC = {
  tags: ['vectors'],
  security: SECURITY_ON
    ? [
      {
        Bearer: ALL_ROLES
      }
    ]
    : []
};

GET.apiDoc = {
  description: 'Get a vector tile',
  ...GET_API_DOC
};


function tile(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const { source, z, x, y } = req.params;

    const query = JSON.parse(req.query['query']) || {};

    //@todo validate source, tile bounds
    const tileData = await PostgresTileService.tile(source, Number(z), Number(x), Number(y), req.authContext?.user?.user_id, query);

    res.setHeader('content-type', 'application/vnd.mapbox-vector-tile');
    res.status(200).send(tileData);
  };
}
