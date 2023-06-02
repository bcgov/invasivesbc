'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../database/db';
import { getLogger } from '../utils/logger';
import { CacheKeys } from '../constants/misc';
import { getAllCodeEntities, IAllCodeEntities } from '../utils/code-utils';
import { retrieveGetDoc } from '../docs/getDoc';
import cacheService from "../utils/cache/cache-service";
import CacheService from "../utils/cache/cache-service";

const defaultLog = getLogger('species');

/**
 * GET api/species?key=123;key=456;key=789
 */
export const GET: Operation = [getSpeciesDetails()];

GET.apiDoc = {
  tags: ['species'],
  description: 'Fetches one or more species based on their keys.',
  ...retrieveGetDoc('Array of species.')
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
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'species',
        code: 503
      });
    }

    let species: any;

    try {
      const cache = cacheService.getCache(CacheKeys.ALL_CODE_CATEGORIES);
      let allCodeEntities: IAllCodeEntities = await cache.get(CacheKeys.ALL_CODE_CATEGORIES);
      if (allCodeEntities === null) {
        allCodeEntities = await getAllCodeEntities();
        await cache.put(CacheKeys.ALL_CODE_CATEGORIES, allCodeEntities);
      }

      if (!allCodeEntities) {
        return req;
      }

      /*
        Only return the plant and animal species (code header id values of 28 and 29)
      */
      species = allCodeEntities.codes.filter(
        (item) => (item['code_header_id'] === 28 || item['code_header_id'] === 29) && keys.includes(item['code_name'])
      );

      return res.status(200).json({
        message: 'Successfully retrieved species.',
        request: req.body,
        result: species,
        count: species.length,
        namespace: 'species',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'getSpecies', message: 'error', error });
      return res.status(500).json({
        message: 'Unable to fetch species.',
        request: req.body,
        error: error,
        namespace: 'species',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
