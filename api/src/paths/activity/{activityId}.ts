import { RequestHandler, Response } from 'express';
import { Operation } from 'express-openapi';

import { SQLStatement } from 'sql-template-strings';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { ACTIVATED_ROLES } from 'constants/misc';
import { getActivityHistorySQL, getActivitySqlWithPermissions } from 'queries/activity-queries';
import { getFileFromS3 } from 'utils/file-utils';
import { getMediaItemsList } from 'paths/media';
import { InvasivesRequest } from 'utils/auth-utils';
import OpenAPISpec from 'utils/OpenAPISpec';
import QueryHandler from 'utils/endpoints/QueryHandler';
import LoggerHandler from 'utils/endpoints/LoggerHandler';

const logger = new LoggerHandler('activity');

const GET: Operation = [getActivity(), getMedia(), returnActivity()];

new OpenAPISpec('Fetches a single activity based on its primary key.', ['activity'])
  .security(ACTIVATED_ROLES)
  .parameters({
    description: 'activity id',
    in: 'path',
    name: 'activityId',
    required: true,
    schema: {
      type: 'string'
    }
  })
  .response(200, {
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
  })
  .build(GET);

/**
 * @desc Fetches a single activity record based on its primary key.
 */
function getActivity(): RequestHandler {
  return async (req: InvasivesRequest, res: Response, next) => {
    const db = new QueryHandler({ maintain: true });
    try {
      const activityId = req.params.activityId;
      const sqlStatement: SQLStatement = getActivitySqlWithPermissions(activityId, req?.authContext?.user?.user_id);
      const sqlStatement2: SQLStatement = getActivityHistorySQL(activityId);

      if (!sqlStatement || !sqlStatement2) return res.status(500).send('Unable to generate SQL statement');

      logger.debug('Activity With Permissions SQL', { body: sqlStatement });
      logger.debug('Activity Audit SQL', { body: sqlStatement2 });

      const response1 = await db.query(sqlStatement);
      const response2 = await db.query(sqlStatement2);

      const result1 = response1?.rows?.[0] ?? null;
      const result2 = response2?.rows ?? null;

      req['activity'] = result1;
      req['activity_history'] = result2;
    } finally {
      db?.close();
    }
    return next();
  };
}

function getMedia(): RequestHandler {
  return async (req, _, next) => {
    const activity = req['activity'];

    if (!activity?.media_keys?.length) {
      // No media keys found, skipping get media step
      return next();
    }

    try {
      const s3GetPromises: Promise<GetObjectCommandOutput>[] = activity['media_keys']?.map(async (key: string) =>
        getFileFromS3(key)
      );
      const response = await Promise.all(s3GetPromises);
      // Add encoded media to activity
      req['activity'].media = await getMediaItemsList(response, activity['media_keys']);
    } catch (e) {
      logger.error(e, 'Error retrieving media keys from s3');
    }
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
    if (!req['activity']) return res.status(400).send('Activity not found. Maybe it was deleted');

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
