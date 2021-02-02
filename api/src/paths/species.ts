'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getLogger } from '../utils/logger';
import { cached } from '../utils/utils';
import { CacheKeys } from '../constants/misc';
import { getAllCodeEntities, IAllCodeEntities } from '../utils/code-utils';

const defaultLog = getLogger('media');

/**
 * GET api/species?key=123;key=456;key=789
 */
export const GET: Operation = [getSpeciesDetails()];

GET.apiDoc = {
  description: 'Fetches one or more species based on their keys.',
  tags: ['species'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'key',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Array of species.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                // Don't specify exact response, as it will vary, and is not currently enforced anyways
                // Eventually this could be updated to be a oneOf list, similar to the Post request below.
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

function getSpeciesDetails(): RequestHandler {
  return async (req, res, next) => {
    const keys = req.query.key as string[];

    if (!keys || !keys.length) {
      // No code keys found, skipping get code details step
      return next();
    }

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    let species: any;

    try {
      const allCodeEntities: IAllCodeEntities = await cached(CacheKeys.ALL_CODE_CATEGORIES, 3600000, () =>
        getAllCodeEntities()
      )();

      if (!allCodeEntities) {
        return req;
      }

      species = allCodeEntities.codes.filter(
        item => (item['code_header_id'] === 28 || item['code_header_id'] === 29) &&
        keys.includes(item['code_name'])
      );
    } catch (error) {
      defaultLog.debug({ label: 'getActivity', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }

    return res.status(200).json(species);
  };
}
