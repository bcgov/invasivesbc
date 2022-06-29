'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { getIAPPsites, getSpeciesCodesFromIAPPDescriptionList, getSpeciesRef } from '../utils/iapp-json-utils';
import { SEARCH_LIMIT_MAX, SEARCH_LIMIT_DEFAULT } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getPointsOfInterestLeanSQL } from '../queries/point-of-interest-queries';

import { getLogger } from '../utils/logger';
import { isIAPPrelated } from './points-of-interest';
import { getIappExtractFromDB, getSitesBasedOnSearchCriteriaSQL } from '../queries/iapp-queries';

const defaultLog = getLogger('point-of-interest');

export const POST: Operation = [getPointsOfInterestBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all ponts of interest based on search criteria.',
  tags: ['point-of-interest'],
  requestBody: {
    description: 'Points Of Interest search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            page: {
              type: 'number',
              default: 0,
              minimum: 0
            },
            limit: {
              type: 'number',
              default: SEARCH_LIMIT_DEFAULT,
              minimum: 0,
              maximum: SEARCH_LIMIT_MAX
            },
            point_of_interest_type: {
              type: 'string'
            },
            point_of_interest_subtype: {
              type: 'string'
            },
            iappType: {
              type: 'string'
            },
            date_range_start: {
              type: 'string',
              description: 'Date range start, in YYYY-MM-DD format. Defaults time to start of day.',
              example: '2020-07-30'
            },
            date_range_end: {
              type: 'string',
              description: 'Date range end, in YYYY-MM-DD format. Defaults time to end of day.',
              example: '2020-08-30'
            },
            point_of_interest_ids: {
              type: 'array',
              description: 'A list of ids to limit results to',
              items: {
                type: 'string'
              }
            },
            search_feature: {
              type: 'object',
              description: 'Shape feature collection to filter by',
              properties: {
                type: {
                  type: 'string'
                },
                features: {
                  type: 'array',
                  items: {
                    ...(geoJSON_Feature_Schema as any)
                  }
                }
              }
            },
            order: {
              type: 'array',
              description: 'A list of columns to order by. (for DESC, use "columname DESC")',
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
    defaultLog.debug({
      label: 'point-of-interest-lean',
      message: 'getPointsOfInterestBySearchFilterCriteria',
      body: req.body
    });
    const sanitizedSearchCriteria = new PointOfInterestSearchCriteria(req.body);
    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        request: req.body,
        namespace: 'points-of-interest-lean',
        code: 503
      });
    }

    try {
      if (isIAPPrelated(sanitizedSearchCriteria)) {
        const sqlStatement: SQLStatement = getSitesBasedOnSearchCriteriaSQL(sanitizedSearchCriteria);
        if (!sqlStatement) {
          return res.status(500).json({
            message: 'Unable to generate SQL statement',
            request: req.body,
            namespace: 'points-of-interest-lean',
            code: 500
          });
        }

        const response = await connection.query(sqlStatement.text, sqlStatement.values);

        const speciesRef = await getSpeciesRef();

        const returnVal = response.rows.map((row) => {
          const newGeoJSON = row.geojson.geometry;
          const species_on_site = getSpeciesCodesFromIAPPDescriptionList(row.all_species_on_site, speciesRef);

          return {
            type: 'Feature',
            geometry: {
              ...newGeoJSON
            },
            properties: {
              ...row.geojson.properties,
              site_id: row.site_id,
              species_on_site: species_on_site
            }
          };
        });

        return res.status(200).json({
          message: 'Got points of interest by search filter criteria',
          request: req.body,
          result: returnVal,
          count: returnVal.length,
          namespace: 'points-of-interest-lean',
          code: 200
        });
      } else {
        const sqlStatement: SQLStatement = getPointsOfInterestLeanSQL(sanitizedSearchCriteria);

        if (!sqlStatement) {
          return res.status(400).json({
            message: 'Unable to generate SQL statement',
            request: req.body,
            namespace: 'points-of-interest-lean',
            code: 400
          });
        }

        const response = await connection.query(sqlStatement.text, sqlStatement.values);

        return res.status(200).json({
          message: 'Got points of interest by search filter criteria',
          request: req.body,
          result: response.rows,
          count: response.rows.length,
          namespace: 'points-of-interest-lean',
          code: 200
        });
      }
    } catch (error) {
      defaultLog.debug({ label: 'getPointsOfInterestBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Error getting points of interest by search filter criteria',
        request: req.body,
        error: error,
        namespace: 'points-of-interest-lean',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
