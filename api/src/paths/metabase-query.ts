'use strict';

import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON, SEARCH_LIMIT_MAX } from '../constants/misc';
// import { getLogger } from '../utils/logger';
import {
  closeMetabaseSession,
  getMetabaseSession,
  METABASE_COLLECTION_ID,
  METABASE_TIMEOUT, METABASE_URL
} from '../utils/metabase-session';

const namespace = 'metabase-query';

export const POST: Operation = [createMetabaseQuery()];
export const GET: Operation = [getMetabaseQueryOptions()];

POST.apiDoc = {
  description: 'Creates new Metabase queries for a list of activities and points of interest.',
  tags: ['metabase'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Lists of Activity IDs and Point of Interest IDs.',
    content: {
      'application/json': {
        schema: {
          properties: {
            name: {
              type: 'string'
            },
            description: {
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
  },
  responses: {
    200: {
      description: 'Ids and names of new Metabase queries created',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              activity_query_id: {
                type: 'number'
              },
              activity_query_name: {
                type: 'string'
              },
              point_of_interest_query_id: {
                type: 'number'
              },
              point_of_interest_query_name: {
                type: 'string'
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

GET.apiDoc = {
  description: 'Fetches all Metabase queries (collections/cards/questions) available to the user.',
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
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'List of Metabase collections.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string'
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
 * Creates a new Metabase Query, given a list of activity and point-of-interest ids
 *
 * @return {RequestHandler}
 */
function createMetabaseQuery(): RequestHandler {
  //NOSONAR
  return async (req, res) => {
    // defaultLog.debug({ label: 'metabase', message: 'createMetabaseQuery', body: req.body });

    try {
      let { activity_ids, point_of_interest_ids } = req?.body;
      const { name, description } = req?.body;
      let activitesResponse, poiResponse;

      if (!activity_ids && !point_of_interest_ids) {
        return res.status(400).json({
          message: 'Missing activity_ids and point_of_interest_ids',
          namespace,
          code: 400
        });
      }

      // sanitize and remove duplicates from the lists, just in case:
      activity_ids = activity_ids && activity_ids.length ? Array.from(new Set(activity_ids)) : [];
      point_of_interest_ids =
        point_of_interest_ids && point_of_interest_ids.length ? Array.from(new Set(point_of_interest_ids)) : [];

      const session = await getMetabaseSession();

      const todaysDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
      const METABASE_DATABASE_ID = 2;
      const ACTIVITIES_METABASE_SOURCE_TABLE_ID = 11; // find via GET api/table
      const ACTIVITIES_METABASE_QUERY_FIELD_ID = 42;
      const ACTIVITIES_METABASE_DELETED_DATE_FIELD_ID = 49;
      const POI_METABASE_SOURCE_TABLE_ID = 21; // find via GET api/table
      const POI_METABASE_QUERY_FIELD_ID = 215;

      const request: AxiosRequestConfig = {
        method: 'post',
        url: `${METABASE_URL}/api/card`,
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': session
        },
        data: {
          'description value': description
            ? description
            : `Custom InvasivesBC Query, created at time: ${todaysDateTime}`,
          dataset_query: {
            type: 'query',
            database: METABASE_DATABASE_ID
          },
          display: 'table',
          visualization_settings: {
            'table.pivot_column': 'QUANTITY',
            'table.cell_column': 'SUBTOTAL'
          },
          collection_position: 1,
          result_metadata: null,
          metadata_checksum: null,
          collection_id: isNaN(METABASE_COLLECTION_ID) ? null : Number(METABASE_COLLECTION_ID)
        },
        timeout: METABASE_TIMEOUT
      };

      if (activity_ids && activity_ids.length) {
        const activitiesRequest: AxiosRequestConfig = {
          ...request,
          data: {
            ...request.data,
            name: name ? name : `Custom InvasivesBC Activities List - ${todaysDateTime}`,
            dataset_query: {
              ...request.data.dataset_query,
              query: {
                'source-table': ACTIVITIES_METABASE_SOURCE_TABLE_ID,
                filter: [
                  'and',
                  [
                    // row is IN (...activity_ids)
                    '=',
                    ['field-id', ACTIVITIES_METABASE_QUERY_FIELD_ID],
                    ...activity_ids
                  ],
                  [
                    // row deleted_date IS NULL
                    'is-null',
                    ['field-id', ACTIVITIES_METABASE_DELETED_DATE_FIELD_ID]
                  ]
                ],
                limit: SEARCH_LIMIT_MAX
              }
            }
          }
        };

        activitesResponse = await axios(activitiesRequest);

        if (!activitesResponse || !activitesResponse.data) {
          return res.status(500).json({
            message: 'Failed to create activities query',
            namespace,
            code: 500
          });
        }
      }

      if (point_of_interest_ids && point_of_interest_ids.length) {
        const poiRequest: AxiosRequestConfig = {
          ...request,
          data: {
            ...request.data,
            name: name ? name : `Custom InvasivesBC Points of Interest List - ${todaysDateTime}`,
            dataset_query: {
              ...request.data.dataset_query,
              query: {
                'source-table': POI_METABASE_SOURCE_TABLE_ID,
                filter: [
                  'and',
                  [
                    // row is IN (...point_of_interest_ids)
                    '=',
                    ['field-id', POI_METABASE_QUERY_FIELD_ID],
                    ...point_of_interest_ids
                    // note: points of interest has no deleted_date at the base level at this time
                  ]
                ],
                limit: SEARCH_LIMIT_MAX
              }
            }
          }
        };
        poiResponse = await axios(poiRequest);

        if (!poiResponse || !poiResponse.data) {
          return res.status(500).json({
            message: 'Failed to create points of interest query',
            namespace,
            code: 500
          });
        }
      }

      return res.status(200).json({
        message: 'Successfully created query',
        namespace,
        code: 200,
        activity_query_id: activitesResponse?.data?.id,
        activity_query_name: activitesResponse?.data?.name,
        point_of_interest_query_id: poiResponse?.data?.id,
        point_of_interest_query_name: poiResponse?.data?.name
      });
    } catch (error) {
      // reset session on error (just in case):
      closeMetabaseSession();
      // defaultLog.debug({ label: 'createMetabaseQuery', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to create query',
        error: error,
        namespace,
        code: 500
      });
    }
  };
}

/**
 * Fetches all activity and point of interest ids present in a given Metabase Query, identified by query id.
 *
 * @return {RequestHandler}
 */
function getMetabaseQueryOptions(): RequestHandler {
  return async (req, res) => {
    // defaultLog.debug({ label: 'metabase', message: 'getMetabaseQueryOptions', body: req.body });

    try {
      const session = await getMetabaseSession();

      const response = await axios({
        method: 'get',
        url: METABASE_URL + `/api/collection/${METABASE_COLLECTION_ID}/items`,
        headers: {
          'X-Metabase-Session': session
        },
        params: {
          model: 'card'
        },
        timeout: METABASE_TIMEOUT
      });

      if (!response || !response.data) {
        return res.status(500).json({
          message: 'Failed to get query options',
          namespace,
          code: 500
        });
      }

      // extract just the ids from results, so we can re-fetch from the db using our own security layers
      return res.status(200).json({
        options: response.data
          .filter((collection) => collection.model === 'card')
          .map((collection) => ({
            id: collection.id,
            name: collection.name,
            description: collection.description
          }))
      });
    } catch (error) {
      // reset session on error (just in case):
      closeMetabaseSession();
      // defaultLog.debug({ label: 'getMetabaseQueryOptions', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to get query options',
        error: error,
        namespace,
        code: 500
      });
    }
  };
}
