'use strict';

import axios from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON, SEARCH_LIMIT_MAX } from '../../constants/misc';
import { getLogger } from '../../utils/logger';
import { closeMetabaseSession, getMetabaseSession, METABASE_TIMEOUT, METABASE_URL } from '../../utils/metabase-session';
import { getDBConnection } from '../../database/db';
import { SQL } from 'sql-template-strings';

const defaultLog = getLogger('vector-layer');

export const GET: Operation = [getVectorLayerRequest()];

GET.apiDoc = {
  description: 'Get detail about a map vector layer generation request',
  tags: ['vector-layer'],
  security: [],
  parameters: [
    {
      in: 'path',
      name: 'id',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Vector layer details',
      content: {
        'application/json': {
          schema: {
            type: 'object'
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
function getVectorLayerRequest(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'vector-layer/{id}',
        code: 503
      });
    }

    try {
      const id = req?.params?.id;

      if (!id) {
        return res.status(400).json({
          message: 'Bad request - missing id',
          request: req.params,
          namespace: 'vector-layer/{id}',
          code: 400
        });
      }

      const result = await connection.query(
        SQL`SELECT created,
                   status,
                   vector_generation_request_id as id,
                   object_key
            from vector_generation_request
            where vector_generation_request_id = $1`,
        [id]
      );

      if (result.rowCount !== 1) {
        return res.status(404).json({
          message: 'Bad request - nonexistent id',
          request: req.params,
          namespace: 'vector-layer/{id}',
          code: 400
        });
      }

      return res.status(200).json({
        message: 'OK',
        result: result.rows[0],
        namespace: 'vector-layer/{id}',
        code: 200
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Error getting vector layer',
        error: error,
        namespace: 'vector-layer/{id}',
        code: 500
      });
    }
  };
}
