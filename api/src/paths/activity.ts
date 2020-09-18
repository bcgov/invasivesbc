'use strict';

import { ManagedUpload } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, WRITE_ROLES } from './../constants/misc';
import { getDBConnection } from './../database/db';
import { ActivityPostRequestBody, ActivitySearchCriteria, IMediaItem, MediaBase64 } from './../models/activity';
import { getActivitiesSQL, postActivitySQL } from './../queries/activity-queries';
import { uploadFileToS3 } from './../utils/file-utils';
import { getLogger } from './../utils/logger';

const defaultLog = getLogger('activity-controller');

export const GET: Operation = [getAllActivities()];

GET.apiDoc = {
  description: 'Fetches all activities based on search criteria.',
  tags: ['activity'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Activities search criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            activity_type: {
              type: 'string'
            },
            activity_sub_type: {
              type: 'string'
            },
            page: {
              type: 'number',
              default: 0,
              minimum: 0
            },
            limit: {
              type: 'number',
              default: 25,
              minimum: 0,
              maximum: 100
            },
            date_range_start: {
              type: 'string',
              description: 'Date range start, in YYYY-MM-DD format'
            },
            date_range_end: {
              type: 'string',
              description: 'Date range end, in YYYY-MM-DD format'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
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

export const POST: Operation = [uploadMedia(), createActivity()];

POST.apiDoc = {
  description: 'Create a new activity.',
  tags: ['activity'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Activity post response object.',
    content: {
      'application/json': {
        schema: {
          required: [
            'activity_type',
            'activityTypeData',
            'activity_sub_type',
            'activitySubTypeData',
            'date',
            'locationAndGeometry'
          ],
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
              additionalProperties: false,
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
              description: 'An array of media objects to upload and associate to the activity record',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['fileName', 'encodedFile'],
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

/**
 * Uploads any media in the request to S3, adding their keys to the request, and calling next().
 *
 * Does nothing if no media is present in the request.
 *
 * @returns {RequestHandler}
 */
function uploadMedia(): RequestHandler {
  return async (req, res, next) => {
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

      let media;
      try {
        media = new MediaBase64(rawMedia);
      } catch (error) {
        throw {
          status: 400,
          message: 'Included media was invalid/encoded incorrectly',
          errors: [error]
        };
      }

      const metadata = {
        filename: media.fileName,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      s3UploadPromises.push(uploadFileToS3(media, metadata));
    });

    const results = await Promise.all(s3UploadPromises);

    req['mediaKeys'] = results.map((result) => result.Key);

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
    defaultLog.debug({ label: 'activity', message: 'body', body: req.body });

    const data: ActivityPostRequestBody = { ...req.body, mediaKeys: req['mediaKeys'] };

    const sanitizedActivityData = new ActivityPostRequestBody(data);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    const sqlStatement: SQLStatement = postActivitySQL(sanitizedActivityData);

    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    connection.release();

    const result = (response && response.rows && response.rows[0]) || null;

    return res.status(200).json(result);
  };
}

/**
 * Fetches all activity records based on request search criteria.
 *
 * @return {RequestHandler}
 */
function getAllActivities(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'activity', message: 'body', body: req.body });

    const sanitizedSearchCriteria = new ActivitySearchCriteria(req.body);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    const sqlStatement: SQLStatement = getActivitiesSQL(sanitizedSearchCriteria);

    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    connection.release();

    const result = (response && response.rows) || null;

    return res.status(200).json(result);
  };
}
