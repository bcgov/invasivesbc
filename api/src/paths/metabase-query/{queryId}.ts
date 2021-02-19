'use strict';

import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SEARCH_LIMIT_MAX } from '../../constants/misc';
import { getLogger } from '../../utils/logger';
import {
  getMetabaseSession,
  closeMetabaseSession,
  METABASE_URL,
  METABASE_USER,
  METABASE_PASS,
  METABASE_TIMEOUT
} from '../metabase-query';

const defaultLog = getLogger('metabase-query/{queryId}');

export const GET: Operation = [getMetabaseQueryResults()];

GET.apiDoc = {
  description: 'Fetches all activity and point of interest ids from an existing Metabase query.',
  tags: ['metabase'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'queryId',
      required: true
    }
  ],
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
                name: {
                  type: 'string'
                },
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
    defaultLog.debug({ label: '{queryId}', message: 'getMetabaseQueryResults', body: req.params });

    try {
      const queryId = req?.params?.queryId;

      if (!queryId) {
        throw {
          status: 400,
          message: 'Metabase query id required'
        };
      }

      const session = await getMetabaseSession();
      console.log(session);

      const response = await axios({
        method: 'post',
        url: `${METABASE_URL}/api/card/${queryId}/query/json`,
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': session
        },
        timeout: METABASE_TIMEOUT
      });

      if (!response || !response.data || !response.data.length) {
        throw {
          status: 400,
          message: 'Failed to find metabase query with id ' + queryId
        };
      }

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
      // reset session on error (just in case):
      closeMetabaseSession();
      defaultLog.debug({ label: 'getMetabaseQueryResults', message: 'error', error });
      throw error;
    }
  };
}
