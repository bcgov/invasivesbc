import distance from '@turf/distance';
import { point } from '@turf/helpers';
import nearestPoint from '@turf/nearest-point';
import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import proj4 from 'proj4';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('activity');

const GET: Operation = proxyWell();

GET.apiDoc = {
  description:
    'Fetches the distance to the closest well in meters from a given location. An object is return containing the closest feature along with the distance to the provided point.',
  tags: ['activity', 'databc'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  parameters: [
    {
      in: 'query',
      name: 'lon',
      required: true
    },
    {
      in: 'query',
      name: 'lat',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'GeoJSON feature from DataBC Layer and distance to it in meters',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              well: {
                type: 'object'
              },
              distance: {
                type: 'number'
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

/**
 * Given a point location all wells within 500 meters are requests
 * The closest well is extracted and returned along with the distance.
 *
 * @param req {object} Either the express object...
 *   or if called as a module it must be in the format of:
 *   {query: {
 *     lon: xxx.xxxxx,
 *     lat: xx.xxxxx
 *    }}
 * @param res {object} Express response object. If missing it is a module call
 * @param next {function} Callback function. Gets passed the data from the API
 * @return {object} The closest well object. Including a distance to the supplied location.
 */
function getWell(req, res, next) {
  // Grab coordinates from the query string
  const { lon, lat } = req.query;

  // Error if no coordinates
  if (!lon || !lat) {
    return res.status(400).json({
      message: 'Bad request - missing coordinates',
      request: req.query,
      code: 400
    });
  }

  defaultLog.debug({ label: 'dataBC', message: 'getElevation', body: req.body });

  /*
    Here is the projection definition of the well layer
    stored in the BCGW
  */
  const albers =
    '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs';

  const alb = proj4(albers, [Number(lon), Number(lat)]);
  const coords = `${alb[0]}+${alb[1]}`;

  // TODO: URL encode the lon and lat
  const base = 'https://openmaps.gov.bc.ca/geo/pub/wfs';
  const typeName = 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW';
  const cql = `CQL_FILTER=DWITHIN(GEOMETRY,POINT(${coords}),500,meters)`;

  // Formulate the url.
  const url = `${base}?service=WFS&version=2.0.0&request=GetFeature&typeName=${typeName}&outputFormat=json&maxFeatures=1000&srsName=epsg:4326&${cql}`;

  let bundle = {};
  /* ### getClosest
    Get the closest well feature and distance to location
    @param response {object} Response from BCGW
    @return {object} The express response object or the axios return
    */
  const getClosest = (response) => {
    // There should be at least one well.
    if (response?.data?.features?.length > 0) {
      const loc = point([Number(lon), Number(lat)]);
      const closestWell = nearestPoint(loc, response.data);
      const dist = Math.round(distance(loc, closestWell) * 1000);

      bundle = {
        distance: dist,
        well: closestWell
      };
    } else {
      // Otherwise there are no wells
      bundle = {
        distance: null,
        well: {}
      };
    }

    if (res) {
      // If an ajax reqest
      return res.status(201).json({
        message: 'Got closest well',
        result: bundle,
        request: req.query,
        namespace: 'context/well',
        code: 201
      });
    } else {
      // Otherwise just a module request
      return bundle;
    }
  };

  /* ### failure
    Handle a failure of requesting well from BCGW
    @param error {object} The axios error object
    @return {object} The express response object or the axios return
    */
  const failure = (error) => {
    defaultLog.debug({ label: 'getWell', message: 'error', error });
    const err = { error };
    if (res) {
      return res.status(501).json({
        message: 'Failed to get well',
        request: req.query,
        error: err,
        namespace: 'context/well',
        code: 501
      });
    } else {
      return err;
    }
  };

  /* ### moduleReturn
    The module implementation accepts a callback as the third parameter
    Make sure it's run with the data.
    @param data {object} The well data object recieved from the BCTW
  */
  const moduleReturn = (data) => {
    if (next && !res) {
      next(data);
    }
  };

  // Everything ready to go for our request
  axios.get(url).then(getClosest).then(moduleReturn).catch(failure);
}

/* ## proxyWell
  This allows us to export the getWell function for
  ECMAScript module usage.
 */
function proxyWell(): RequestHandler {
  return async (req, res, next) => {
    getWell(req, res, next);
  };
}

// Make available as a model as well.
export { getWell };
export default { GET };
