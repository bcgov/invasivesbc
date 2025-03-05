import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { getActivityHistorySQL, getActivitiesByIdsSQL } from 'queries/activity-queries';
import { getFileFromS3 } from 'utils/file-utils';
import { getLogger } from 'utils/logger';
import { getMediaItemsList } from 'paths/media';
import { PoolClient } from 'pg';
import { InvasivesRequest } from 'utils/auth-utils';

const NAMESPACE = '/v2/activities/batch-request';
const defaultLog = getLogger(NAMESPACE);

const GET: Operation = [getActivity()];

GET.apiDoc = {
  description: 'Returns multiple Activity Records for device caching',
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
      in: 'query',
      name: 'idList',
      required: true,
      description: 'A list of IDs to retrieve records for.',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['id1', 'id2', 'id3']
      }
    }
  ],
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {}
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
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
 * @desc Fetch a batch of records for caching via their IDs
 * @return { RequestHandler }
 */
function getActivity(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (req.authContext.roles.length === 0) return res.status(401).json({ message: 'No Role for user' });
    const idList: string[] = JSON.parse(req.query.idList as string);
    let connection: PoolClient;

    try {
      connection = await getDBConnection();
      const resObj: Record<PropertyKey, any> = {};

      const sqlStatement: SQLStatement = getActivitiesByIdsSQL(idList);
      (await connection.query(sqlStatement.text, sqlStatement.values)).rows.forEach(async (a) => {
        resObj[a.activity_id] = { ...a, ...a.activity_payload };
        delete resObj[a.activity_id].activity_payload;
        if (a?.media_keys?.length > 0) {
          try {
            const response = await Promise.all(a?.media_keys?.map(async (key: string) => getFileFromS3(key)));
            resObj[a.activity_id].media = getMediaItemsList(response, a.media_keys);
          } catch (error) {
            defaultLog.error({
              label: NAMESPACE,
              error: error,
              message: 'Error occured while fetching media from bucket',
              req: req.query
            });
          }
        }
      });
      for (const id of idList) {
        const sql = getActivityHistorySQL(id);
        resObj[id].activity_history = (await connection.query(sql.text, sql.values)).rows;
      }
      return res.status(200).json(resObj);
    } catch (error) {
      defaultLog.debug({ label: NAMESPACE, error: error, body: req.body, method: 'GET' });
      return res.status(500).json({
        message: 'Unable to fetch ids in list.',
        request: req.query,
        error: JSON.stringify(error),
        namespace: NAMESPACE,
        code: 500
      });
    } finally {
      connection?.release();
    }
  };
}

export { GET };
