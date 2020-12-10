'use strict';

import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../../constants/misc';
import { getLogger } from '../../utils/logger';

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

    // Convert point coordinates into a bounding box
    const coords = `${lon},${lat},${parseFloat(lon as string) + 0.00001},${parseFloat(lat as string) + 0.00001}`

    const base = 'https://openmaps.gov.bc.ca/geo/pub/wfs';
    const typeName = 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW';
    const cql = `CQL_FILTER=DWITHIN(GEOMETRY,POINT(${lon}&#44;${lat}),1000,meters)`

    // Formulate the url.
    const url = `${base}?service=WFS&version=2.0.0&request=GetFeature&typeName=${typeName}:&outputFormat=json&maxFeatures=1000&srsName=epsg:4326&${cql}`;

    res.send(url);

    // axios.get(url)
    //   .then((response) => {
    //     return res.status(200).json({target: response.data?.features[0]?.properties});
    //   })
    //   .catch((error) => {
    //     return defaultLog.debug({ label: 'getWell', message: 'error', error });
    //   });
  };
}
