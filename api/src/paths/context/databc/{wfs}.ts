'use strict';

import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../../constants/misc';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('activity');

export const GET: Operation = [getDataBC()];

GET.apiDoc = {
  description: 'Fetches a single feature of a DataBC WFS layer from a geographic point location.',
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
    },
    {
      in: 'path',
      name: 'wfs',
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
            properties: {}
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
function getDataBC(): RequestHandler {
  return async (req, res) => {
    // Grab coordinates from the query string
    const { lon, lat } = req.query;

    // Grab the wfs target from the url path
    const wfs = req.params.wfs;

    // Error if no coordinates
    if (!lon || !lat) {
      return res.status(400).json({
        message: 'Bad request - missing coordinates',
        request: req.query,
        namespace: 'context/databc/{wfs}',
        code: 400
      });
    }

    defaultLog.debug({ label: 'dataBC', message: 'getElevation', body: req.body });

    // Convert point coordinates into a bounding box
    const coords = `${lon},${lat},${parseFloat(lon as string) + 0.00001},${parseFloat(lat as string) + 0.00001}`;

    // Formulate the url.
    const url = `https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=pub:${wfs}&outputFormat=json&maxFeatures=1&srsName=epsg:4326&bbox=${coords},epsg:4326`;

    axios
      .get(url)
      .then((response) => {
        return res.status(200).json({
          message: 'Got DataBC Layer',
          request: req.body,
          result: response.data?.features?.[0]?.properties,
          namespace: 'context/databc/{wfs}',
          code: 200
        });
      })
      .catch((error) => {
        defaultLog.debug({ label: 'getDataBC', message: 'error', error });
        throw error;
      });
  };
}
