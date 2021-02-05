'use strict';

import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SEARCH_LIMIT_MAX, SEARCH_LIMIT_DEFAULT } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { ActivitySearchCriteria } from '../models/activity';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getActivitiesSQL, deleteActivitiesSQL } from '../queries/activity-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('activity');

const METABASE_URL: string = process.env.METABASE_URL || 'https://metabase-7068ad-dev.apps.silver.devops.gov.bc.ca';
const METABASE_USER: string = process.env.METABASE_USER || 'hello';
const METABASE_PASS: string = process.env.METABASE_PASS || 'world';

export const POST: Operation = [getMetabaseQueryResults()];

POST.apiDoc = {
  description: 'Fetches all activity and point of interest ids from an existing Metabase query.',
  tags: ['metabase'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Metabase Search filter.',
    content: {
      'application/json': {
        schema: {
          properties: {
            metabaseQueryId: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Metabase response array of ids.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                activity_ids: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                point_of_interest_ids: {
                  type: 'array',
                  items: {
                    type: 'string'
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
 * Fetches all activity and point of interest ids present in a given Metabase Query, identified by query id.
 *
 * @return {RequestHandler}
 */
function getMetabaseQueryResults(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'metabase', message: 'getMetabaseQueryResults', body: req.body });

    try {
      const queryId = req?.body?.metabaseQueryId;

      if (!queryId) {
        throw {
          status: 400,
          message: 'Metabase query id required'
        };
      }

      const metabaseSession = await axios({
        method: 'post',
        url: METABASE_URL + `/api/session`,
        data: {
          username: METABASE_USER,
          password: METABASE_PASS
        },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        timeout: 10000
      });

      if (!metabaseSession.data.id) {
        throw {
          status: 503,
          message: 'Failed to establish metabase session'
        };
      }

      const sessionId = metabaseSession.data.id;
      const response = await axios({
        method: 'post',
        url: METABASE_URL + `/api/card/${queryId}/query/json`,
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': sessionId,
          'Access-Control-Allow-Origin': '*'
        },
        timeout: 10000
      });

      if (!response || !response.data || !response.data.length) {
        throw {
          status: 400,
          message: 'Failed to find metabase query with id ' + queryId
        };
      }

      /*
      // Notes for Version 2: filter data can be found here:
      const response2 = await axios({
        method: 'post',
        url: METABASE_URL + `/api/card/${queryId}/query`,
        headers: {
          'X-Metabase-Session': sessionId,
          'Access-Control-Allow-Origin': '*'
        },
        timeout: 10000
      });
      console.log(response2.data.json_query.query.filter);
      */

      // extract just the ids from results, so we can re-fetch from the db using our own security layers
      return res.status(200).json({
        activity_ids: response.data
          .map((row) => row['Activity ID'])
          .filter((row) => row)
          .splice(0, SEARCH_LIMIT_MAX),
        point_of_interest_ids: response.data
          .map((row) => row['Point Of Interest ID'])
          .filter((row) => row)
          .map((row) => '' + row)
          .splice(0, SEARCH_LIMIT_MAX)
      });
    } catch (error) {
      defaultLog.debug({ label: 'getMetabaseQueryResults', message: 'error', error });
      throw error;
    }
  };
}
