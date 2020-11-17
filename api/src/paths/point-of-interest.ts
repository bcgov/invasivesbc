'use strict';

import { ManagedUpload } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { WRITE_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { IMediaItem, MediaBase64, PointOfInterestPostRequestBody } from '../models/point-of-interest';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { postPointOfInterestSQL } from '../queries/point-of-interest-queries';
import { uploadFileToS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('point-of-interest');

export const POST: Operation = [uploadMedia(), createPointOfInterest()];

POST.apiDoc = {
  description: 'Create a new point of interest.',
  tags: ['point-of-interest'],
  security: [
    {
      Bearer: WRITE_ROLES
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
                ...geoJSON_Feature_Schema
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
 * Uploads any media in the request to S3, adding their keys to the request, and calling next().
 *
 * Does nothing if no media is present in the request.
 *
 * TODO: make media handling an extension that can be added to different endpoints/record types
 *
 * @returns {RequestHandler}
 */
function uploadMedia(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'point-of-interest', message: 'uploadMedia', body: req.body });

    if (!req.body.media || !req.body.media.length) {
      // no media objects included, skipping media upload step
      return next();
    }

    const rawMediaArray: IMediaItem[] = req.body.media;

    const s3UploadPromises: Promise<ManagedUpload.SendData>[] = [];

    rawMediaArray.forEach((rawMedia: IMediaItem) => {
      if (!rawMedia) {
        return;
      }

      let media: MediaBase64;
      try {
        media = new MediaBase64(rawMedia);
      } catch (error) {
        defaultLog.debug({ label: 'uploadMedia', message: 'error', error });
        throw {
          status: 400,
          message: 'Included media was invalid/encoded incorrectly'
        };
      }

      const metadata = {
        filename: media.mediaName || '',
        description: media.mediaDescription || '',
        date: media.mediaDate || '',
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      s3UploadPromises.push(uploadFileToS3(media, metadata));
    });

    const results = await Promise.all(s3UploadPromises);

    req['mediaKeys'] = results.map(result => result.Key);

    next();
  };
}

/**
 * Creates a new point of interest record.
 *
 * @returns {RequestHandler}
 */
function createPointOfInterest(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'point-of-interest', message: 'createPointOfInterest', body: req.params });

    const data = { ...req.body, mediaKeys: req['mediaKeys'] };

    const sanitizedPointOfInterestData = new PointOfInterestPostRequestBody(data);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = postPointOfInterestSQL(sanitizedPointOfInterestData);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = (response && response.rows && response.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'createPointOfInterest', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
