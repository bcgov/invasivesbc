import { InvasivesRequest } from 'utils/auth-utils';
import { PostgresTileService } from 'utils/vectors/tile-service';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';

export const GET: Operation = [tile()];


const GET_API_DOC = {
  tags: ['public-map', 'vectors'],
  security: []
};

GET.apiDoc = {
  description: 'Get a vector tile',
  ...GET_API_DOC
};


function tile(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const { z, x, y } = req.params;

    const tileData = await PostgresTileService.tile('public', {
      z,
      x,
      y
    });

    res.setHeader('content-type', 'application/vnd.mapbox-vector-tile');
    res.status(200).send(tileData);
  };
}
