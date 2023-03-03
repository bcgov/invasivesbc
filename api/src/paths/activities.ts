'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SEARCH_LIMIT_MAX, SEARCH_LIMIT_DEFAULT, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { ActivitySearchCriteria } from '../models/activity';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getActivitiesSQL, deleteActivitiesSQL } from '../queries/activity-queries';
import { getLogger } from '../utils/logger';
import { InvasivesRequest } from '../utils/auth-utils';
import { createHash } from 'crypto';
import cacheService, { versionedKey } from '../utils/cache-service';

const defaultLog = getLogger('activity');

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
  parameters: [
    {
      in: 'query',
      name: 'id',
      required: true
    }
  ],
  requestBody: {
    description: 'Activities search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
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

    const roleName = (req as any).authContext.roles[0]?.role_name;
    const sanitizedSearchCriteria = new ActivitySearchCriteria(criteria);
    // sanitizedSearchCriteria.created_by = [req.authContext.user['preferred_username']];
    const isAuth = req.authContext?.user !== null ? true:  false;




    if (!isAuth || !roleName || roleName.includes('animal')) {
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
    const cache = cacheService.getCache('activity');

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

      const cacheTagStr = versionedKey(`${cacheVersion} ${JSON.stringify(criteria)} ${roleName}`);

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
      const cachedResult = cache.get(ETag);
      if (cachedResult) {
        // hit! send this one and save some db traffic
        connection.release();
        return res.status(200).set(responseCacheHeaders).json(cachedResult);
      }
    } catch (e) {
      console.log(
        'caught an error while checking cache. this is odd but continuing with request as though no cache present.'
      );
    }

    try {
      const sqlStatement: SQLStatement = getActivitiesSQL(sanitizedSearchCriteria, false, isAuth);

      if (!sqlStatement) {
        return res
          .status(500)
          .json({ message: 'Unable to generate SQL statement', request: criteria, namespace: 'activities', code: 500 });
      }

      // needs to be mutable
      let response = await connection.query(sqlStatement.text, sqlStatement.values);
      if (!isAuth) {
        if (response.rows.length > 0) {
          // remove sensitive data from json obj
          for (var i in response.rows) {
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

      if (ETag !== null) {
        // save for later;
        cache.put(ETag, responseBody);
      }

      return res.status(200).set(responseCacheHeaders).json(responseBody);
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
 *
 * @return {RequestHandler}
 */
function deleteActivitiesByIds(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    defaultLog.debug({ label: 'activity', message: 'deleteActivitiesByIds', body: req.body });

    const sanitizedSearchCriteria = new ActivitySearchCriteria({
      keycloakToken: req.keycloakToken
    });

    const isAdmin = (req as any)?.authContext?.roles[0]?.role_id === 18 ? true : false; // Determines if user can delete other peoples records
    const preferred_username = req.authContext.preferredUsername;
    const ids = Object.values(req.query.id) as string[];
    sanitizedSearchCriteria.activity_ids = ids;

    const connection = await getDBConnection();
    if (!connection) {
      return res
        .status(503)
        .json({ message: 'Database connection unavailable', request: req.body, namespace: 'activities', code: 503 });
    }

    if (isAdmin === false) {
      const sqlStatement = getActivitiesSQL(sanitizedSearchCriteria, false);

      if (!sqlStatement) {
        return res
          .status(500)
          .json({ message: 'Unable to generate SQL statement', request: req.body, namespace: 'activities', code: 500 });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      if (response.rows.length > 0) {
        response.rows.forEach((row, i) => {
          if (row.activity_payload.created_by_with_guid !== preferred_username) {
            return res.status(401).json({
              message: 'Invalid request, user is not authorized to delete this record', // better message
              request: req.body,
              namespace: 'activities',
              code: 401
            });
          }
        });
      }
    }

    if (!ids || !ids.length) {
      return res
        .status(400)
        .json({ message: 'Invalid request, no ids provided', request: req.body, namespace: 'activities', code: 400 });
    }

    try {
      const sqlStatement: SQLStatement = deleteActivitiesSQL(ids);

      if (!sqlStatement) {
        return res
          .status(500)
          .json({ message: 'Unable to generate SQL statement', request: req.body, namespace: 'activities', code: 500 });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'Deleted activities by ids',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'activities',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'deleteActivitiesByIds', message: 'error', error });
      return res
        .status(500)
        .json({ message: 'Error deleting activities by ids', error, namespace: 'activities', code: 500 });
    } finally {
      connection.release();
    }
  };
}
