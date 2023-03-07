'use strict';

import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../../utils/logger';

const namespace = 'context/elevation';

export const GET: Operation = [getElevation()];

GET.apiDoc = {
  description: 'Fetches elevation for a single point',
  tags: ['activity', 'elevation'],
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
      description: 'Elevation value',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              elevation: {
                type: 'integer'
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
 * Fetches all activity records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getElevation(): RequestHandler {
  return async (req, res) => {
    // Grab coordinates from the query string
    const { lon, lat } = req.query;

    // Error if no coordinates
    if (!lon || !lat) {
      return res.status(400).json({
        message: 'Bad request - missing coordinates',
        request: req.query,
        namespace,
        code: 400
      });
    }

    // defaultLog.debug({ label: 'elevation', message: 'getElevation', body: req.body });

    const url = `https://geogratis.gc.ca/services/elevation/cdem/altitude?lat=${lat}&lon=${lon}`;

    axios
      .get(url)
      .then((response) => {
        return res.status(200).json({
          message: 'Got elevation',
          request: req.query,
          result: response.data?.altitude,
          namespace,
          code: 200
        });
      })
      .catch((error) => {
        // defaultLog.debug({ label: 'getElevation', message: 'error', error, namespace: 'context/elevation' });
        return res.status(500).json({
          message: 'Error getting elevation',
          request: req.query,
          error,
          namespace,
          code: 500
        });
      });
  };
}
