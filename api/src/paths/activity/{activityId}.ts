'use strict';

import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from './../../constants/misc';
import { getDBConnection } from './../../database/db';
import { IMediaItem } from './../../models/activity';
import { getActivitySQL } from './../../queries/activity-queries';
import { getFileFromS3 } from './../../utils/file-utils';
import { getLogger } from './../../utils/logger';

const defaultLog = getLogger('activity-controller');

export const GET: Operation = [getActivity(), getMedia(), returnActivity()];

export const parameters = [
  {
    in: 'path',
    name: 'activityId',
    required: true
  }
];

GET.apiDoc = {
  description: 'Fetches a single activity based on its primary key.',
  tags: ['activity'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'application/json': {
          schema: {
            properties: {
              activity_type: {
                type: 'string'
              },
              activityTypeData: {
                type: 'object'
              },
              activity_sub_type: {
                type: 'string'
              },
              activitySubTypeData: {
                type: 'object'
              },
              date: {
                type: 'string',
                description: 'Date in YYYY-MM-DD format'
              },
              locationAndGeometry: {
                type: 'object',
                description: 'Location and geometry information',
                properties: {
                  anchorPointY: {
                    type: 'number'
                  },
                  anchorPointX: {
                    type: 'number'
                  },
                  area: {
                    type: 'number'
                  },
                  geometry: {
                    type: 'object',
                    description: 'A geoJSON object'
                  },
                  jurisdiction: {
                    type: 'string'
                  },
                  agency: {
                    type: 'string'
                  },
                  observer1FirstName: {
                    type: 'string'
                  },
                  observer1LastName: {
                    type: 'string'
                  },
                  locationComment: {
                    type: 'string'
                  },
                  generalComment: {
                    type: 'string'
                  },
                  photoTaken: {
                    type: 'boolean'
                  }
                }
              },
              media: {
                type: 'array',
                description: 'An array of media objects associated to the activity record',
                items: {
                  type: 'object',
                  properties: {
                    fileName: {
                      type: 'string'
                    },
                    encodedFile: {
                      type: 'string',
                      format: 'base64',
                      description: 'A Data URL base64 encoded image',
                      example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4REy...'
                    }
                  }
                }
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
 * Fetches a single activity record based on its primary key.
 *
 * @return {RequestHandler}
 */
function getActivity(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: '{activityId}', message: 'params', body: req.params });

    const activityId = Number(req.params.activityId);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    const sqlStatement: SQLStatement = getActivitySQL(activityId);

    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    connection.release();

    const result = (response && response.rows && response.rows[0]) || null;

    req['activity'] = result;

    return next();
  };
}

function getMedia(): RequestHandler {
  return async (req, res, next) => {
    const activity = req['activity'];

    if (!activity || !req['activity'].media_keys || !req['activity'].media_keys.length) {
      // No media keys found, skipping get media step
      return next();
    }

    const s3GetPromises: Promise<GetObjectOutput>[] = [];

    activity['media_keys'].forEach((key: string) => {
      s3GetPromises.push(getFileFromS3(key));
    });

    const response = await Promise.all(s3GetPromises);

    const result: IMediaItem[] = response.map((s3Object: GetObjectOutput) => {
      // Encode image buffer as base64
      const contentString = Buffer.from(s3Object.Body).toString('base64');

      // Append DATA Url string
      const encodedFile = `data:${s3Object.ContentType};base64,${contentString}`;

      const mediaItem: IMediaItem = { fileName: s3Object.Metadata.filename, encodedFile: encodedFile };

      return mediaItem;
    });

    // Add encoded media to activity
    req['activity'].media = result;

    return next();
  };
}

/**
 * Sends a 200 response with JSON contents of `rew.activity`.
 *
 * @return {RequestHandler}
 */
function returnActivity(): RequestHandler {
  return async (req, res, next) => {
    return res.status(200).json(req['activity']);
  };
}
