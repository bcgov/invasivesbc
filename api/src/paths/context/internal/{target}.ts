'use strict';

import { RequestHandler, Response } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../../constants/misc';
import { getDBConnection } from '../../../database/db';
// import { getLogger } from '../../../utils/logger';

const namespace = 'context/internal/{target}';

export const GET: Operation = [getContext()];

GET.apiDoc = {
  description: 'Fetch internal contextual data for a single point.',
  tags: ['activity', 'RISO', 'IPMA'],
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
      name: 'target',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Target value',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              target: {
                type: 'string'
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
 * ## getPlanningArea
 * Get the Invasive Plant Management Area
 * @param lon {float} Longitude
 * @param lat {float} Latitude
 * @param res {object} Express response object
 * @param attr {string} The postgres table attribute to target
 * @param table {string} The postgres table to target
 */
const getPlanningArea = async (lon: any, lat: any, res: Response, attr: string, table: string) => {
  const connection = await getDBConnection();

  if (!connection) {
    return res.status(503).json({
      message: 'Database connection unavailable',
      namespace,
      code: 503
    });
  }

  const sql = `
    select
      target.${attr} "target"
    from
      public.${table} "target"
    where
      public.st_intersects(
        public.st_geographyFromText('POINT(${lon} ${lat})'),
        target.geog
      )
  `;

  try {
    const response = await connection.query(sql);
    const target = response.rows[0]?.target || '';
    res.status(200).json({ target });
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
};

/**
 * ## getContext
 * Relay function for all context functions
 *
 */
function getContext(): RequestHandler {
  return async (req, res) => {
    // Grab coordinates from the query string
    const { lon, lat } = req.query;

    // Error if no coordinates
    if (!lon || !lat || lon === 'undefined' || lat === 'undefined') {
      return res.status(400).json({
        message: 'Invalid coordinates provided',
        request: req.query,
        namespace,
        code: 400
      });
    }

    const target = req.params.target;

    switch (target) {
      case 'ipma':
        getPlanningArea(lon, lat, res, 'ipma', 'invasive_plant_management_areas');
        break;
      case 'riso':
        getPlanningArea(lon, lat, res, 'agency', 'regional_invasive_species_organization_areas');
        break;
      case 'utm':
        getPlanningArea(lon, lat, res, 'utm_zone', 'utm_zones');
        break;
      default:
        res.status(401).json({
          message: 'Please specify a target dataset',
          request: req.params,
          namespace,
          code: 401
        });
    }

    // defaultLog.debug({ label: 'context', message: 'getContext', body: req.body });
  };
}
