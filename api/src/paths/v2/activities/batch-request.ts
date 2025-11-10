import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from 'constants/misc';
import { getActivityHistorySQL, getActivitiesByIdsSQL } from 'queries/activity-queries';
import { getFileFromS3 } from 'utils/file-utils';
import { getMediaItemsList } from 'paths/media';
import { InvasivesRequest } from 'utils/auth-utils';
import OpenAPISpec from 'utils/OpenAPISpec';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import QueryHandler from 'utils/endpoints/QueryHandler';

const logger = new LoggerHandler('/v2/activities/batch-request');
const GET: Operation = [getActivity()];

new OpenAPISpec('Returns multiple Activity Records for device caching', ['activity'])
  .security(ALL_ROLES)
  .parameters({
    in: 'query',
    name: 'idList',
    required: true,
    description: 'A list of IDs to retrieve records for.',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'string'
          },
          example: ['id1', 'id2', 'id3']
        }
      }
    }
  })
  .response(200, {
    description: 'Activity get response object array.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {}
        }
      }
    }
  })
  .build(GET);

/**
 * @desc Fetch a batch of records for caching via their IDs
 * @return { RequestHandler }
 */
function getActivity(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const db = new QueryHandler({ maintain: true });
    const idList: string[] = JSON.parse(req.query.idList as string);
    try {
      const resObj: Record<PropertyKey, any> = {};
      const entries = await db.query(getActivitiesByIdsSQL(idList));
      entries.rows.forEach(async (a) => {
        resObj[a.activity_id] = { ...a.activity_payload, ...a };
        delete resObj[a.activity_id].activity_payload;
        if (a?.media_keys?.length > 0) {
          try {
            const response = await Promise.all(a?.media_keys?.map(async (key: string) => getFileFromS3(key)));
            resObj[a.activity_id].media = getMediaItemsList(response, a.media_keys);
          } catch (e) {
            logger.error(e, 'Error fetching media from bucket');
          }
        }
      });
      for (const id of idList) {
        const result = await db.query(getActivityHistorySQL(id));
        resObj[id].activity_history = result.rows;
      }
      return res.status(200).json(resObj);
    } finally {
      db?.close();
    }
  };
}

export { GET };
