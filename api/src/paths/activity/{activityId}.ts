import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { getActivityHistorySQL, getActivitySQL } from 'queries/activity-queries';
import { getFileFromS3 } from 'utils/file-utils';
import { getLogger } from 'utils/logger';
import { getMediaItemsList } from 'paths/media';
import { InvasivesRequest } from 'utils/auth-utils';

const defaultLog = getLogger('activity');

const GET: Operation = [getActivity(), getMedia(), returnActivity()];

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
  return async (req: InvasivesRequest, res, next) => {
    if (req.authContext.roles.length === 0) {
      res.status(401).json({ message: 'No Role for user' });
    }
    defaultLog.debug({ label: '{activityId}', message: 'getActivity', body: req.params });

    const activityId = req.params.activityId;

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'activity/{activityId}',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getActivitySQL(activityId);
      const sqlStatement2: SQLStatement = getActivityHistorySQL(activityId);

      if (!sqlStatement || !sqlStatement2) {
        return res.status(500).json({
          message: 'Unable to generate SQL statement.',
          request: req.body,
          namespace: 'activity/{activityId}',
          code: 500
        });
      }

      defaultLog.debug({ label: '{activityId}', message: 'activity audit sql ', body: sqlStatement2 });
      const response1 = await connection.query(sqlStatement.text, sqlStatement.values);
      const response2 = await connection.query(sqlStatement2.text, sqlStatement2.values);

      const result1 = (response1 && response1.rows && response1.rows[0]) || null;
      const result2 = (response2 && response2.rows ) || null;

      defaultLog.debug({ label: '{activityId}', message: 'activity response', body: JSON.stringify(result1) });

      req['activity'] = result1;
      req['activity_history'] = result2;
    } catch (error) {
      defaultLog.debug({ label: 'getActivity', message: 'error', error });
      return res.status(500).json({
        message: 'Unable to fetch activity.',
        request: req.body,
        error: error,
        namespace: 'activity/{activityId}',
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
    defaultLog.debug({ label: '{activityId}', message: 'getMedia', body: req.body });

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
    if (req['activity'] === null) {
      return res.status(404).json({
        message: 'Activity not found.  Maybe it was deleted.',
        request: req.body,
        namespace: 'activity/{activityId}',
        code: 404
      });
    }
    // original blob from client:
    const originalPayload = { ...req['activity'].activity_payload };

    // other columns in activity_incoming_data:
    const supplementalFields = { ...req['activity'], activity_history: [...req['activity_history']] };
    delete supplementalFields.activity_payload;

    // merge the two
    const returnVal = { ...originalPayload, ...supplementalFields };

    return res.status(200).json(returnVal);
  };
}

export { GET };
