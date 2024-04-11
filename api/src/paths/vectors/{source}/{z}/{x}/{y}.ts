import { InvasivesRequest } from 'utils/auth-utils';
import { PostgresTileService } from 'utils/vectors/tile-service';
import { RequestHandler } from 'express';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { Operation } from 'express-openapi';
import { sanitizeActivityFilterObject } from 'paths/v2/activities';
import { sanitizeIAPPFilterObject } from 'paths/v2/iapp';

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
    if(req.authContext.roles.length === 0) {
      res.status(401).json({ message: 'No Role for user'})
    }
    const rawBodyCriteria = JSON.parse(decodeURI(req.query.filterObject as string))
    const { source } = req.params;
    let filterObj = null 
    if(source === 'activities') {
      filterObj = sanitizeActivityFilterObject(rawBodyCriteria, req);
    }
    else {
      filterObj = sanitizeIAPPFilterObject(rawBodyCriteria, req);
    }

    //@todo validate source, tile bounds
    const tileData = await PostgresTileService.tile(source, filterObj)

    res.setHeader('content-type', 'application/vnd.mapbox-vector-tile');
    res.status(200).send(tileData);
  };
}