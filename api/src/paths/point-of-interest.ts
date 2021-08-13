'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { PointOfInterestPostRequestBody } from '../models/point-of-interest';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { postPointOfInterestSQL, postPointsOfInterestSQL } from '../queries/point-of-interest-queries';
import { getLogger } from '../utils/logger';
import { uploadMedia } from './media';

const defaultLog = getLogger('point-of-interest');

export const POST: Operation = [uploadMedia(), createPointOfInterest()];

POST.apiDoc = {
  description: 'Create a new point of interest.',
  tags: ['point-of-interest'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Point of interest post request object.',
    content: {
      'application/json': {
        schema: {
          required: ['point_of_interest_type', 'point_of_interest_subtype'],
          properties: {
            point_of_interest_type: {
              type: 'string',
              title: 'Point of Interest type'
            },
            point_of_interest_subtype: {
              type: 'string',
              title: 'Point of Interest subtype'
            },
            media: {
              type: 'array',
              title: 'Media',
              items: {
                $ref: '#/components/schemas/Media'
              }
            },
            geometry: {
              type: 'array',
              title: 'Geometries',
              items: {
                ...(geoJSON_Feature_Schema as any)
              }
            },
            form_data: {
              oneOf: [{ $ref: '#/components/schemas/PointOfInterest_IAPP_Site' }]
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Point of Interest post response object.',
      content: {
        'application/json': {
          schema: {
            required: ['point_of_interest_incoming_data_id'],
            properties: {
              point_of_interest_incoming_data_id: {
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
 * Creates a new point of interest record.  If request body is an array of points of interest,
 * then creates them all in a single batch query
 *
 * @returns {RequestHandler}
 */
function createPointOfInterest(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'point-of-interest', message: 'createPointOfInterest', body: req.params });
    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement = Array.isArray(req.body)
        ? postPointsOfInterestSQL(
            req.body.map((poi) => new PointOfInterestPostRequestBody({ ...poi, mediaKeys: poi['mediaKeys'] }))
          )
        : postPointOfInterestSQL(new PointOfInterestPostRequestBody({ ...req.body, mediaKeys: req['mediaKeys'] }));

      if (!sqlStatement)
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = response?.rows?.[0] || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'createPointOfInterest', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
