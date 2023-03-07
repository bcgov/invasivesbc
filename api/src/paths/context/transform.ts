'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { getDBConnection } from '../../database/db';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../../utils/logger';

const namespace = 'context/transform';

export const GET: Operation = [getContext()];

GET.apiDoc = {
  description: 'Transform from geographic coordinates to any EPSG codded coordinate',
  tags: ['activity', 'transform', 'projection'],
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
      in: 'query',
      name: 'epsg',
      description: 'The EPSG integer code for the destination projection.',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'An array of transformed coordinates: x & y',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              x: {
                type: 'number'
              },
              y: {
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
 * ## getContext
 * Relay function for all context functions
 *
 */
function getContext(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.query,
        namespace,
        code: 503
      });
    }

    // Grab coordinates and epsg from the query string
    const { lon, lat, epsg } = req.query;

    // Error if no coordinates
    if (!lon || !lat || !epsg) {
      return res.status(400).json({
        message: 'Did not supply valid coordinates or epsg code',
        request: req.query,
        namespace,
        code: 400
      });
    }

    const sql = `
      select
        public.st_x(
          public.st_transform(
            public.st_setSrid(
              public.st_point(${lon},${lat})
            ,4326)
          ,${epsg})
        ) "x",
        public.st_y(
          public.st_transform(
            public.st_setSrid(
              public.st_point(${lon},${lat})
            ,4326)
          ,${epsg})
        ) "y"
    `;

    try {
      const response = await connection.query(sql);
      const payload = { target: response.rows[0] };
      res.status(200).json({ message: 'Got context', request: req.query, result: payload, code: 200 });
    } catch (error) {
      // defaultLog.debug({ label: 'getContext', message: 'error', error });
      return res.status(500).json({
        message: 'Error fetching context',
        error: error,
        namespace,
        code: 500
      });
    } finally {
      connection.release();
    }

    // defaultLog.debug({ label: 'context', message: 'getContext', body: req.body });
  };
}
