import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PoolClient } from 'pg';
import { getActivitiesSQLv2, sanitizeActivityFilterObject } from 'queries/activities-v2-queries';
import { InvasivesRequest } from 'utils/auth-utils';
import { getLogger } from 'utils/logger';

const NAMESPACE = '/v2/activities/cache-update-ids';
const defaultLog = getLogger(NAMESPACE);

const GET: Operation = [getUpdatedActivities()];

GET.apiDoc = {
  description: 'Returns list of Ids matching FilterObjects where date more recent than one supplied.',
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
      description: 'Date of last cache',
      example: '2025-03-04T15:20:22.765Z',
      in: 'query',
      name: 'lastUpdated',
      required: true,
      type: 'string'
    },
    {
      description: 'Recordset filter objects',
      in: 'query',
      name: 'filterObjects',
      required: true,
      type: 'string'
    }
  ],
  responses: {
    200: {
      description: 'Activity Ids with records more recent than cached.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'string',
              description: 'activity_id',
              example: 'a1b2a1b2-c3d4-e5f6-g7h8g7h8g7h8',
              pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
            }
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
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

function getUpdatedActivities(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (req.authContext.roles.length === 0) return res.status(401).json({ message: 'No Role for user' });

    let connection: PoolClient;
    try {
      connection = await getDBConnection();
      const filterObjects = JSON.parse(req.query.filterObjects as string);
      const { lastUpdated } = req.query;
      const sanitizedFilters = sanitizeActivityFilterObject(filterObjects?.[0], req);
      sanitizedFilters.timestamp = lastUpdated;
      sanitizedFilters.updateCache = true;

      const { text, values } = getActivitiesSQLv2(sanitizedFilters);
      const response = (await connection.query(text, values)).rows[0].ids ?? [];

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      defaultLog.debug({ label: NAMESPACE, error: error, body: req.body });
      return res.sendStatus(500).json({
        message: 'Unable to provide list of ids.',
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

export default { GET };
