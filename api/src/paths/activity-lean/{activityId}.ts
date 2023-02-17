'use strict';

import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { getDBConnection } from './../../database/db';
import { getFileFromS3 } from './../../utils/file-utils';
// import { getLogger } from './../../utils/logger';
import { getMediaItemsList } from './../media';

// const defaultLog = getLogger('activity/{activityId}');

export const GET: Operation = [getActivity(), getMedia(), returnActivity()];

GET.apiDoc = {
  description: 'Fetches a single activity based on its primary key.',
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  parameters: [
    {
      in: 'path',
      name: 'activityId',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              // Don't specify exact response, as it will vary, and is not currently enforced anyways
              // Eventually this could be updated to be a oneOf list, similar to the Post request below.
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
    // defaultLog.debug({ label: '{activityId}', message: 'getActivity', body: req.params });

    const activityId = req.params.activityId;

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'activity-lean/{activityId}',
        code: 503
      });
    }

    try {
      const sql = `
        select
        jsonb_build_object (
          'type', 'Feature',
          'properties', json_build_object(
            'activity_id', activity_id,
            'activity_type', activity_type,
            'activity_subtype', activity_subtype
          ),
          'geometry', public.st_asGeoJSON(geog)::jsonb
        ) as "geojson"
      from
        invasivesbc.activity_incoming_data
      where
        activity_id = '${activityId}'
      `;
      // TODO: Query most recent. Deleted timestamp null

      const response = await connection.query(sql);

      const result = (response && response.rows && response.rows[0]) || null;

      req['activity'] = result;
    } catch (error) {
      // defaultLog.debug({ label: 'getActivity', message: 'error', error });
      return res.status(500).json({
        message: 'Error fetching activity',
        request: req.body,
        namespace: 'activity-lean/{activityId}',
        code: 500
      });
    } finally {
      connection.release();
    }

    return next();
  };
}

function getMedia(): RequestHandler {
  return async (req, res, next) => {
    // defaultLog.debug({ label: '{activityId}', message: 'getMedia', body: req.body });

    const activity = req['activity'];

    if (!activity || !activity.media_keys || !activity.media_keys.length) {
      // No media keys found, skipping get media step
      return next();
    }

    const s3GetPromises: Promise<GetObjectOutput>[] = [];

    activity['media_keys'].forEach((key: string) => {
      s3GetPromises.push(getFileFromS3(key));
    });

    const response = await Promise.all(s3GetPromises);

    // Add encoded media to activity
    req['activity'].media = getMediaItemsList(response, activity['media_keys']);

    return next();
  };
}

/**
 * Sends a 200 response with JSON contents of `rew.activity`.
 *
 * @return {RequestHandler}
 */
function returnActivity(): RequestHandler {
  return async (req, res) => {
    return res.status(200).json(req['activity']);
  };
}
