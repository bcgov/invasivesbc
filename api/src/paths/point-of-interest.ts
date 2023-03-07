'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { PointOfInterestPostRequestBody } from '../models/point-of-interest';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { postPointOfInterestSQL, postPointsOfInterestSQL } from '../queries/point-of-interest-queries';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';
import { uploadMedia } from './media';

const namespace = 'point-of-interest';

export const POST: Operation = [uploadMedia(), createPointOfInterest()];

POST.apiDoc = {
  description: 'Create a new point of interest.',
  tags: [namespace],  // no poi tag.  activity? or add more tags
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
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
            },
            species_positive: {
              type: 'array',
              title: 'Species Codes',
              items: {
                type: 'string'
              }
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
    // defaultLog.debug({ label: 'point-of-interest', message: 'createPointOfInterest', body: req.params });
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);
   
   
    const connection = await getDBConnection();
    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace,
        code: 503
      });
    }

    try {
      const sqlStatement = Array.isArray(req.body)
        ? postPointsOfInterestSQL(
            req.body.map((poi) => new PointOfInterestPostRequestBody({ ...poi, mediaKeys: poi['mediaKeys'] }))
          )
        : postPointOfInterestSQL(new PointOfInterestPostRequestBody({ ...req.body, mediaKeys: req['mediaKeys'] }));
        logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);

      if (!sqlStatement) {
        logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          request: req.body,
          namespace,
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);

      return res.status(201).json({
        message: 'Point of interest created',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace,
        code: 201
      });
    } catch (error) {
      logErr()(namespace,`Error creating point of interest\n${req?.body}\n${error}`);
      throw error;
    } finally {
      connection.release();
    }
  };
}
