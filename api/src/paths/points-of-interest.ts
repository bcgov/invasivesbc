'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { streamIAPPResult } from '../utils/iapp-json-utils';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import { getPointsOfInterestSQL, getSpeciesMapSQL } from '../queries/point-of-interest-queries';
import { getLogger } from '../utils/logger';
import { versionedKey } from '../utils/cache/cache-utils';
import { createHash } from 'crypto';

const defaultLog = getLogger('point-of-interest');

export const GET: Operation = [getPointsOfInterestBySearchFilterCriteria()];

GET.apiDoc = {
  description: 'Fetches all points of interest based on search criteria.',
  tags: ['point-of-interest'],
  security: SECURITY_ON
    ? [
      {
        Bearer: ALL_ROLES
      }
    ]
    : [],
  responses: {
    200: {
      description: 'Point Of Interest get response object array.',
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

export const isIAPPrelated = (PointOfInterestSearchCriteria: any) => {
  return PointOfInterestSearchCriteria.isIAPP;
};

/**
 * Fetches all point-of-interest records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getPointsOfInterestBySearchFilterCriteria(): RequestHandler {
  return async (req, res) => {

    const criteria = JSON.parse(<string>req.query['query']);

    defaultLog.debug({
      label: 'point-of-interest',
      message: 'getPointsOfInterestBySearchFilterCriteria',
      body: criteria
    });

    // get proper names from mapping table
    if (criteria.species_positive) {
      const positiveNames = await getMappedFilterRows(criteria.species_positive);
      if (positiveNames) {
        criteria.species_positive = positiveNames;
      }
    }

    if (criteria.species_negative) {
      const negativeNames = await getMappedFilterRows(criteria.species_negative);
      if (negativeNames) {
        criteria.species_negative = negativeNames;
      }
    }

    const sanitizedSearchCriteria = new PointOfInterestSearchCriteria(criteria);
    defaultLog.debug({ message: 'sanitizedSearchCriteria', sanitizedSearchCriteria });

    const responseCacheHeaders = {};
    let ETag = null;
    // check the cache tag to see if, perhaps, the user already has the latest

    // do not check cache for CSV files
    if (!(isIAPPrelated(sanitizedSearchCriteria) && sanitizedSearchCriteria.isCSV)) {
      const cacheCheckConnection = await getDBConnection();

      try {
        const cacheQueryResult = await cacheCheckConnection.query(
          `select updated_at
           from cache_versions
           where cache_name = $1`,
          [isIAPPrelated(sanitizedSearchCriteria) ? 'iapp_site_summary' : 'activity']
        );
        const cacheVersion = cacheQueryResult.rows[0].updated_at;

        // because we have parameters and user roles, the actual resource cache tag is
        // tuple: (cacheVersion, parameters)
        // hash it for brevity and to obscure the real modification date

        const cacheTagStr = versionedKey(`POI ${cacheVersion} ${JSON.stringify(sanitizedSearchCriteria)}`);

        ETag = createHash('sha1').update(cacheTagStr).digest('hex');

        // ok, see if we got a conditional request
        const ifNoneMatch = req.header('If-None-Match');
        if (ifNoneMatch && ifNoneMatch == ETag) {
          // great, we can shortcut this request.
          return res.status(304).send({}); //not-modified
        }

        // we computed ok, so make sure we send it
        responseCacheHeaders['ETag'] = ETag;
        responseCacheHeaders['Cache-Control'] = 'must-revalidate, max-age=0';

        res.set(responseCacheHeaders);

      } finally {
        cacheCheckConnection.release();
      }
    }

    if (isIAPPrelated(sanitizedSearchCriteria)) {
      res.status(200);
      await streamIAPPResult(sanitizedSearchCriteria, res);
    } else {
      const connection = await getDBConnection();



      if (!connection) {
        return res.status(503).json({
          message: 'Database connection unavailable.',
          request: criteria,
          namespace: 'points-of-interest',
          code: 503
        });
      }

      try {
        const sqlStatement: SQLStatement = getPointsOfInterestSQL(sanitizedSearchCriteria);

        if (!sqlStatement) {
          return res.status(500).json({
            message: 'Failed to build SQL statement',
            request: criteria,
            namespace: 'points-of-interest',
            code: 500
          });
        }

        const responseIAPP = await connection.query(sqlStatement.text, sqlStatement.values);

        // parse the rows from the response
        const rows = { rows: (responseIAPP && responseIAPP.rows) || [] };

        // parse the count from the response
        const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};

        const responseBody = {
          message: 'Got points of interest by search filter criteria',
          request: criteria,
          result: rows,
          count: count,
          namespace: 'points-of-interest',
          code: 200
        };

        return res.status(200).json(responseBody);

      } catch (error) {
        const message = error.message || error;
        defaultLog.debug({ label: 'getPointsOfInterestBySearchFilterCriteria', message: 'error', error: message });
        return res.status(500).json({
          message: 'Failed to get points of interest by search filter criteria',
          request: criteria,
          error: error,
          namespace: 'points-of-interest',
          code: 500
        });
      } finally {
        connection.release();
      }
    }
  };
}

async function getMappedFilterRows(codeArray) {
  const sqlStatement: SQLStatement = getSpeciesMapSQL(codeArray);

  if (!sqlStatement) {
    return [];
  }

  const connection = await getDBConnection();

  if (!connection) {
    return [];
  }

  const nameResponse = await connection.query(sqlStatement.text, sqlStatement.values);
  const speciesNameRows = { rows: (nameResponse && nameResponse.rows) || [] };
  const speciesNames = speciesNameRows.rows.map((row) => {
    return row.iapp_name;
  });

  connection.release();

  return speciesNames;
}
