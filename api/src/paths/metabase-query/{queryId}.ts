import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SEARCH_LIMIT_MAX, SECURITY_ON } from 'constants/misc';
import { getLogger } from 'utils/logger';
import { closeMetabaseSession, getMetabaseSession, METABASE_TIMEOUT, METABASE_URL } from 'utils/metabase-session';

const defaultLog = getLogger('metabase-query');

const GET: Operation = [getMetabaseQueryResults()];

GET.apiDoc = {
  description: 'Fetches all activity and point of interest ids from an existing Metabase query.',
  tags: ['metabase'],
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
        return res.status(400).json({
          message: 'Bad request - missing queryId',
          request: req.params,
          namespace: 'metabase-query/{queryId}',
          code: 400
        });
      }

      const session = await getMetabaseSession();

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
        return res.status(404).json({
          message: 'No results',
          namespace: 'metabase-query/{queryId}',
          code: 404
        });
      }

      // extract just the ids from results, so we can re-fetch from the db using our own security layers
      return res.status(200).json({
        message: 'Got results',
        request: req.params,
        namespace: 'metabase-query/{queryId}',
        code: 200,
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
      return res.status(500).json({
        message: 'Error getting metabase query results',
        error: error,
        namespace: 'metabase-query/{queryId}',
        code: 500
      });
    }
  };
}

export default { GET };
