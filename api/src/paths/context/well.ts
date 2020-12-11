'use strict';

import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../../constants/misc';
import { getLogger } from '../../utils/logger';
import proj4 from 'proj4';

const defaultLog = getLogger('activity');


export const GET: Operation = [getWell()];

GET.apiDoc = {
  description: 'Fetches the distance to the closest well in meters from a given location.',
  tags: ['activity','databc'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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
      description: 'GeoJSON feature from DataBC Layer',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
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
 * Fetches a single feature of a DataBC WFS layer from a geographic point location.
 *
 * @return {RequestHandler}
 */
function getWell(): RequestHandler {
  return async (req, res, next) => {

    // Grab coordinates from the query string
    const {lon,lat} = req.query;

    // Error if no coordinates
    if (!lon || !lat) {
      throw {
        status: 400,
        message: 'Did not supply valid coordinates'
      }
    }

    defaultLog.debug({ label: 'dataBC', message: 'getElevation', body: req.body });

    // Make the coordinates url friendly
    // const coords = encodeURIComponent(`${lon},${lat}`);
    // const coords = `${lon},${lat}`;
    const albers = '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'

    const alb = proj4(albers,[Number(lon),Number(lat)]);
    const coords = `${alb[0]}+${alb[1]}`


    // TODO: URL encode the lon and lat
    const base = 'https://openmaps.gov.bc.ca/geo/pub/wfs';
    const typeName = 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW';
    const cql = `CQL_FILTER=DWITHIN(GEOMETRY,POINT(${coords}),500,meters)`

    // Formulate the url.
    const url = `${base}?service=WFS&version=2.0.0&request=GetFeature&typeName=${typeName}&outputFormat=json&maxFeatures=1000&srsName=epsg:4326&${cql}`;

    const getClosest = (response) => {
      console.log('response: ',response);
      console.log('res: ',res);
    }

    axios.get(url)
      .then(getClosest)
      .catch((error) => {
        return defaultLog.debug({ label: 'getWell', message: 'error', error });
      });

  };
}
