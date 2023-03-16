'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../database/db';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';
import { cached } from '../utils/utils';
import { CacheKeys } from '../constants/misc';
import { getAllCodeEntities, IAllCodeEntities } from '../utils/code-utils';
import { retrieveGetDoc } from '../docs/getDoc';

const namespace = 'species';

/**
 * GET api/species?key=123;key=456;key=789
 */
export const GET: Operation = [getSpeciesDetails()];

GET.apiDoc = {
  tags: [namespace],
  description: 'Fetches one or more species based on their keys.',
  ...retrieveGetDoc('Array of species.')
};

function getSpeciesDetails(): RequestHandler {
  return async (req, res, next) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);
    const keys = req.query.key as string[];

    if (!keys || !keys.length) {
      // No code keys found, skipping get code details step
      return next();
    }

    const connection = await getDBConnection();

    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace,
        code: 503
      });
    }

    let species: any;

    try {
      const allCodeEntities: IAllCodeEntities = await cached(CacheKeys.ALL_CODE_CATEGORIES, 3600000, () =>
        getAllCodeEntities()
      )();
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,allCodeEntities);
      logData()(namespace,logMetrics.SQL_PARAMS,keys);

      if (!allCodeEntities) {
        logErr()(namespace,`No Code Entities cached, return request\n${req?.body}`);
        return req;
      }

      /*
        Only return the plant and animal species (code header id values of 28 and 29)
      */
      species = allCodeEntities.codes.filter(
        (item) => (item['code_header_id'] === 28 || item['code_header_id'] === 29) && keys.includes(item['code_name'])
      );
      logData()(namespace,logMetrics.SQL_RESULTS,species);
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);

      return res.status(200).json({
        message: 'Successfully retrieved species.',
        request: req.body,
        result: species,
        count: species.length,
        namespace,
        code: 200
      });
    } catch (error) {
      logErr()(namespace,`Error getting species\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Unable to fetch species.',
        request: req.body,
        error: error,
        namespace,
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
