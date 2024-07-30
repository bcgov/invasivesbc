import { createHash } from 'crypto';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { streamActivitiesResult } from 'utils/iapp-json-utils';
import { getDBConnection } from 'database/db';
import { ActivitySearchCriteria } from 'models/activity';
import {
  deleteActivitiesSQL,
  getActivitiesSQL,
  getLinkedMonitoringRecordsFromTreatmentSQL
} from 'queries/activity-queries';
import { getLogger } from 'utils/logger';
import { InvasivesRequest } from 'utils/auth-utils';
import cacheService from 'utils/cache/cache-service';
import { versionedKey } from 'utils/cache/cache-utils';
import { ActivityType } from 'sharedAPI';

const defaultLog = getLogger('activity');
const CACHENAME = 'Activities - Fat';

export const GET: Operation = [getActivitiesBySearchFilterCriteria()];

export const DELETE: Operation = [deleteActivitiesByIds()];

GET.apiDoc = {
  description: 'Fetches all activities based on search criteria.',
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
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
                rows: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      // Don't specify exact object properties, as it will vary, and is not currently enforced anyways
                      // Eventually this could be updated to be a oneOf list, similar to the Post request below.
                    }
                  }
                },
                count: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    },
    304: {
      $ref: '#/components/responses/304'
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

DELETE.apiDoc = {
  description: 'Soft-deletes all activities based on a list of ids.',
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Delete activities',
    content: {
      'application/json': {
        schema: {
          description: 'Delete activities',
          type: 'object',
          properties: {
            ids: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Count of modified activities',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                count: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    },
    304: {
      $ref: '#/components/responses/304'
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
 * Fetches all activity records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getActivitiesBySearchFilterCriteria(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const criteria = JSON.parse(<string>req.query['query']);

    defaultLog.debug({ label: 'activity', message: 'getActivitiesBySearchFilterCriteria', body: criteria });
    //defaultLog.debug({ label: 'activity', message: 'checkAuthContextInActivities', body: req.authContext });

    const roleName = (req as any).authContext.roles[0]?.role_name;
    const sanitizedSearchCriteria = new ActivitySearchCriteria(criteria);
    // sanitizedSearchCriteria.created_by = [req.authContext.user['preferred_username']];
    const isAuth = req.authContext?.user;
    const user_role = (req as any).authContext?.roles?.[0]?.role_id;
    if (user_role) {
      const user_roles = Array.from({ length: user_role }, (_, i) => i + 1);
      sanitizedSearchCriteria.user_roles = user_roles;
    }

    if (!isAuth || !roleName || roleName.includes('animal')) {
      //if (!isAuth) {
      sanitizedSearchCriteria.hideTreatmentsAndMonitoring = true;
    } else {
      sanitizedSearchCriteria.hideTreatmentsAndMonitoring = false;
    }
    if (!isAuth) {
      sanitizedSearchCriteria.created_by = [];
      sanitizedSearchCriteria.updated_by = [];
    }

    const connection = await getDBConnection();
    if (!connection) {
      defaultLog.error({ label: 'activity', message: 'getActivitiesBySearchFilterCriteria', body: criteria });
      return res
        .status(503)
        .json({ message: 'Database connection unavailable', request: criteria, namespace: 'activities', code: 503 });
    }

    // we'll send it later, overriding cache headers as appropriate
    const responseCacheHeaders = {};
    let ETag = null;
    // server-side cache
    const cache = cacheService.getCache(CACHENAME);

    if (!sanitizedSearchCriteria.isCSV) {
      // check the cache tag to see if, perhaps, the user already has the latest
      try {
        const cacheQueryResult = await connection.query(
          `select updated_at
           from cache_versions
           where cache_name = $1`,
          ['activity']
        );
        const cacheVersion = cacheQueryResult.rows[0].updated_at;

        // because we have parameters and user roles, the actual resource cache tag is
        // tuple: (cacheVersion, parameters, roleName)
        // hash it for brevity and to obscure the real modification date

        const cacheTagStr = versionedKey(`${CACHENAME} ${cacheVersion} ${JSON.stringify(criteria)} ${roleName}`);

        ETag = createHash('sha1').update(cacheTagStr).digest('hex');

        // ok, see if we got a conditional request
        const ifNoneMatch = req.header('If-None-Match');
        if (ifNoneMatch && ifNoneMatch === ETag) {
          // great, we can shortcut this request.
          connection.release();
          return res.status(304).send({}); //not-modified
        }

        // we computed ok, so make sure we send it
        responseCacheHeaders['ETag'] = ETag;
        responseCacheHeaders['Cache-Control'] = 'must-revalidate, max-age=0';

        // check server-side cache
        const cachedResult = await cache.get(ETag);
        if (cachedResult) {
          // hit! send this one and save some db traffic
          connection.release();
          return res.status(200).set(responseCacheHeaders).json(cachedResult);
        }
      } catch (e) {
        const message = e === undefined ? 'undefined' : e.message;
        defaultLog.warn({
          message:
            'caught an error while checking cache. this is odd but continuing with request as though no cache present.',
          error: message
        });
      }
    }

    try {
      if (sanitizedSearchCriteria.isCSV) {
        res.status(200);
        await streamActivitiesResult(sanitizedSearchCriteria, res);
      } else {
        const sqlStatement: SQLStatement = getActivitiesSQL(sanitizedSearchCriteria, false, isAuth);

        if (!sqlStatement) {
          return res.status(500).json({
            message: 'Unable to generate SQL statement',
            request: criteria,
            namespace: 'activities',
            code: 500
          });
        }

        // needs to be mutable
        const response = await connection.query(sqlStatement.text, sqlStatement.values);
        if (!isAuth) {
          if (response.rows.length > 0) {
            // remove sensitive data from json obj
            for (const i in response.rows) {
              response.rows[i].activity_payload.created_by = null;
              response.rows[i].activity_payload.updated_by = null;
              response.rows[i].activity_payload.reviewed_by = null;
              response.rows[i].activity_payload.user_role = [];
              if (response.rows[i].activity_payload.form_data.activity_type_data) {
                response.rows[i].activity_payload.form_data.activity_type_data.activity_persons = [];
              }
            }
          }
        }

        const responseBody = {
          message: 'Got activities by search filter criteria',
          request: criteria,
          result: response.rows,
          count: response.rowCount,
          namespace: 'activities',
          code: 200
        };

        if (ETag !== null && responseBody.result.length < 200) {
          // save for later;
          await cache.put(ETag, responseBody);
        }

        return res.status(200).set(responseCacheHeaders).json(responseBody);
      }
    } catch (error) {
      defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Error getting activities by search filter criteria',
        error,
        namespace: 'activities',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

/**
 * Soft-deletes all activity records based on a list of ids.
 * @return {RequestHandler}
 */
function deleteActivitiesByIds(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const connection = await getDBConnection();
    try {
      defaultLog.debug({ label: 'activity', message: '[deleteActivitiesByIds]', body: req.body });

      const isMasterAdmin = (req as any).authContext.roles.some((role: Record<string, any>) => role.role_id === 18);
      const preferred_username = req.authContext.friendlyUsername;
      const { ids } = req.body;

      if (ids.length === 0) {
        return res.status(400).json({
          message: 'No ids provided',
          request: req.body,
          namespace: 'activities',
          code: 400
        });
      }

      const sanitizedSearchCriteria = new ActivitySearchCriteria({ keycloakToken: req.keycloakToken });
      sanitizedSearchCriteria.activity_ids = ids;
      sanitizedSearchCriteria.hideTreatmentsAndMonitoring = false;

      const sqlStatement: SQLStatement = getActivitiesSQL(sanitizedSearchCriteria, false);
      const deleteSQLStatement: SQLStatement = deleteActivitiesSQL(ids, req);
      if (!connection) {
        return res.status(503).json({
          message: 'Database connection unavailable',
          request: req.body,
          namespace: 'activities',
          code: 503
        });
      }
      if (!sqlStatement || !deleteSQLStatement) {
        return res.status(500).json({
          message: 'Unable to generate SQL Statement',
          request: req.body,
          namespace: 'activities',
          code: 500
        });
      }

      const recordsToDelete = await connection.query(sqlStatement.text, sqlStatement.values);
      // Identify Treatment Records and check for any matching IDs, exit early if any exist.
      const recordsWithTreatments = recordsToDelete.rows.filter(
        (entry) => entry?.activity_type === ActivityType.Treatment
      );
      for (const record of recordsWithTreatments) {
        const sql = getLinkedMonitoringRecordsFromTreatmentSQL(record.activity_id);
        const results = await connection.query(sql);
        if (results.rowCount > 0) {
          return res.status(403).json({
            message: `Cannot delete ${ActivityType.Treatment} record with linked ${ActivityType.Monitoring} record(s)`,
            request: `${record.activity_id} contains linked ${ActivityType.Monitoring} record(s)`,
            status: 403,
            namespace: 'activities'
          });
        }
      }

      const userCreatedEntries = recordsToDelete.rows.every(
        (entry) => entry?.activity_payload?.created_by === preferred_username
      );

      if (recordsToDelete.rowCount === 0) {
        return res.status(404).json({
          message: "No ID's found matching request",
          request: req.body,
          namespace: 'activities',
          code: 404
        });
      }
      if (recordsToDelete.rowCount !== ids.length) {
        return res.status(404).json({
          message: 'A record matching a supplied id was not found',
          request: req.body,
          namespace: 'activities',
          code: 404
        });
      }

      if (isMasterAdmin || userCreatedEntries) {
        const response = await connection.query(deleteSQLStatement.text, deleteSQLStatement.values);
        return res.status(200).json({
          message: 'Deleted activities by ids',
          request: req.body,
          result: response.rows,
          count: response.rowCount,
          namespace: 'activities',
          code: 200
        });
      }
      /* Future Specific-Role Handling Logic applied here */
      return res.status(401).json({
        message: 'Unauthorized Access',
        request: req.body,
        namespace: 'activities',
        code: 401
      });
    } catch (ex) {
      defaultLog.error({
        label: 'activity',
        message: '[deleteActivitiesByIds]',
        body: ex
      });
      return res.status(500);
    } finally {
      connection.release();
    }
  };
}
