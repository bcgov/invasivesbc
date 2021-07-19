'use strict';

import { RequestHandler, Response } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../../../constants/misc';
import { getDBConnection } from '../../../database/db';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('activity');

export const GET: Operation = [getContext()];

GET.apiDoc = {
  description: 'Fetch internal contextual data for a single point.',
  tags: ['activity', 'RISO', 'IPMA'],
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
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
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
    defaultLog.debug({ label: 'getContext', message: 'error', error });
    throw error;
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

    console.log(typeof lon, typeof lat);
    // Error if no coordinates
    if (!lon || !lat || lon === 'undefined' || lat === 'undefined') {
      throw {
        status: 400,
        message: 'Did not supply valid coordinates'
      };
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
        res.status(401).send('Please specify a target dataset');
    }

    defaultLog.debug({ label: 'context', message: 'getContext', body: req.body });
  };
}
