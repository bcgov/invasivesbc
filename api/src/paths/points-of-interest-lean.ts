'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { getIAPPsites, getSpeciesCodesFromIAPPDescriptionList, getSpeciesRef } from '../utils/iapp-json-utils';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import { getPointsOfInterestLeanSQL } from '../queries/point-of-interest-queries';

import { getLogger } from '../utils/logger';
import cacheService from '../utils/cache-service';
import { createHash } from 'crypto';

const defaultLog = getLogger('point-of-interest');

export const GET: Operation = [getPointsOfInterestBySearchFilterCriteria()];

GET.apiDoc = {
  description: 'Fetches all ponts of interest based on search criteria.',
  tags: ['point-of-interest'],
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

/**
 * Fetches all point-of-interest records based on request search
 * filter criteria. The attributes and geometries are formatted
 * to match the GeoJSON specification.
 *
 * @return {RequestHandler}
 */
function getPointsOfInterestBySearchFilterCriteria(): RequestHandler {
  return async (req, res) => {
    const criteria = JSON.parse(<string>req.query['query']);

    defaultLog.debug({
      label: 'point-of-interest-lean',
      message: 'getPointsOfInterestBySearchFilterCriteria',
      body: criteria
    });
    const sanitizedSearchCriteria = new PointOfInterestSearchCriteria(criteria);
    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: criteria,
        namespace: 'points-of-interest-lean',
        code: 503
      });
    }

    // we'll send it later, overriding cache headers as appropriate
    const responseCacheHeaders = {};
    let ETag = null;
    // server-side cache
    const cache = cacheService.getCache('poi-lean');

    // check the cache tag to see if, perhaps, the user already has the latest
    try {
      const cacheQueryResult = await connection.query(`select updated_at from cache_versions where cache_name = $1`, [
        'iapp_site_summary'
      ]);
      const cacheVersion = cacheQueryResult.rows[0].updated_at;

      // because we have parameters and user roles, the actual resource cache tag is
      // tuple: (cacheVersion, parameters)
      // hash it for brevity and to obscure the real modification date

      const cacheTagStr = `${cacheVersion} ${JSON.stringify(criteria)}`;

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
      const sqlStatement: SQLStatement = getPointsOfInterestLeanSQL(sanitizedSearchCriteria);
      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Unable to generate SQL statement',
          request: criteria,
          namespace: 'points-of-interest-lean',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const speciesRef = await getSpeciesRef();

      const returnVal = response.rows.map((row) => {
        const newGeoJSON = row.geojson.geometry;
        const species_on_site = getSpeciesCodesFromIAPPDescriptionList(row.geojson.properties.species, speciesRef);

        return {
          type: 'Feature',
          geometry: {
            ...newGeoJSON
          },
          properties: {
            ...row.geojson.properties,
            site_id: row.geojson.properties.site_id,
            species_on_site: species_on_site
          }
        };
      });

      const responseBody = {
        message: 'Got points of interest by search filter criteria',
        request: criteria,
        result: returnVal,
        count: returnVal.length,
        namespace: 'points-of-interest-lean',
        code: 200
      };

      if (ETag !== null) {
        // save for later;
        cache.put(ETag, responseBody);
      }

      return res.status(200).set(responseCacheHeaders).json(responseBody);
    } catch (error) {
      defaultLog.debug({ label: 'getPointsOfInterestBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Error getting points of interest by search filter criteria',
        request: criteria,
        error: error,
        namespace: 'points-of-interest-lean',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
