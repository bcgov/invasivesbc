'use strict';

import { ManagedUpload } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { WRITE_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { ActivityPostRequestBody, IMediaItem, MediaBase64 } from '../models/activity';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { IPutActivitySQL, postActivitySQL, putActivitySQL } from '../queries/activity-queries';
import { uploadFileToS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('activity');

export const POST: Operation = [uploadMedia(), createActivity()];

export const PUT: Operation = [uploadMedia(), updateActivity()];

const post_put_apiDoc = {
  description: 'Create a new activity.',
  tags: ['activity'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Activity post request object.',
    content: {
      'application/json': {
        schema: {
          required: ['activity_type', 'activity_subtype'],
          properties: {
            activity_id: {
              type: 'string',
              format: 'uuid',
              example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
              description: 'An RFC4122 UUID'
            },
            created_timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2018-11-13T20:20:39+00:00',
              description: 'Date created on user device. Must be in ISO8601 format.'
            },
            activity_type: {
              type: 'string',
              title: 'Activity type'
            },
            activity_subtype: {
              type: 'string',
              title: 'Activity subtype'
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
              },
              description: 'An array of GeoJSON Features'
            },
            form_data: {
              oneOf: [
                { $ref: '#/components/schemas/Activity_Observation_PlantTerrestial' },
                { $ref: '#/components/schemas/Activity_Observation_PlantAquatic' },
                { $ref: '#/components/schemas/Activity_Observation_AnimalTerrestrial' },
                { $ref: '#/components/schemas/Activity_Observation_AnimalAquatic' },
                { $ref: '#/components/schemas/Activity_Treatment_ChemicalPlant' },
                { $ref: '#/components/schemas/Activity_Treatment_MechanicalPlant' },
                { $ref: '#/components/schemas/Activity_Treatment_BiologicalPlant' },
                { $ref: '#/components/schemas/Activity_Treatment_BiologicalDispersalPlant' },
                { $ref: '#/components/schemas/Activity_Treatment_MechanicalTerrestrialAnimal' },
                { $ref: '#/components/schemas/Activity_Treatment_ChemicalTerrestrialAnimal' },
                { $ref: '#/components/schemas/Activity_Treatment_BiologicalTerrestrialAnimal' },
                { $ref: '#/components/schemas/Activity_Monitoring_ChemicalTerrestrialAquaticPlant' },
                { $ref: '#/components/schemas/Activity_Monitoring_MechanicalTerrestrialAquaticPlant' },
                { $ref: '#/components/schemas/Activity_Monitoring_BiologicalTerrestrialPlant' },
                { $ref: '#/components/schemas/Activity_Monitoring_MechanicalTerrestrialAnimal' },
                { $ref: '#/components/schemas/Activity_Monitoring_ChemicalTerrestrialAnimal' },
                { $ref: '#/components/schemas/Activity_Monitoring_BiologicalTerrestrialAnimal' }
              ]
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Activity post response object.',
      content: {
        'application/json': {
          schema: {
            required: ['activity_incoming_data_id'],
            properties: {
              activity_incoming_data_id: {
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

POST.apiDoc = {
  ...post_put_apiDoc
};

PUT.apiDoc = {
  ...post_put_apiDoc
};

/**
 * Uploads any media in the request to S3, adding their keys to the request, and calling next().
 *
 * Does nothing if no media is present in the request.
 *
 * @returns {RequestHandler}
 */
function uploadMedia(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'activity', message: 'uploadMedia', body: req.body });

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
 * Creates a new activity record.
 *
 * @returns {RequestHandler}
 */
function createActivity(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'activity', message: 'createActivity', body: req.params });

    const data = { ...req.body, mediaKeys: req['mediaKeys'] };

    const sanitizedActivityData = new ActivityPostRequestBody(data);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = postActivitySQL(sanitizedActivityData);

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
      defaultLog.debug({ label: 'createActivity', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Updates an activity record.
 *
 * Note: An update consists of marking the existing record as 'deleted' and creating a new record with the updated data.
 *
 * @returns {RequestHandler}
 */
function updateActivity(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'activity', message: 'updateActivity', body: req.params });

    const data = { ...req.body, mediaKeys: req['mediaKeys'] };

    const sanitizedActivityData = new ActivityPostRequestBody(data);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatements: IPutActivitySQL = putActivitySQL(sanitizedActivityData);

      if (!sqlStatements || !sqlStatements.updateSQL || !sqlStatements.createSQL) {
        throw {
          status: 400,
          message: 'Failed to build SQL statements'
        };
      }

      let createResponse = null;

      try {
        // Perform both update and create operations as a single transaction
        await connection.query('BEGIN');

        await connection.query(sqlStatements.updateSQL.text, sqlStatements.updateSQL.values);
        createResponse = await connection.query(sqlStatements.createSQL.text, sqlStatements.createSQL.values);

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
      }

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'updateActivity', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
