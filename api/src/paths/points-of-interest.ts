'use strict';

import { RequestHandler, response } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { getIAPPsites } from '../utils/iapp-json-utils';
import { ALL_ROLES, SEARCH_LIMIT_MAX, SEARCH_LIMIT_DEFAULT, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getPointsOfInterestSQL, getSpeciesMapSQL } from '../queries/point-of-interest-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('point-of-interest');

export const POST: Operation = [getPointsOfInterestBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all ponts of interest based on search criteria.',
  tags: ['point-of-interest'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
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
              ...(geoJSON_Feature_Schema as any)
            },
            species_positive: {
              type: 'array',
              description:
                'A list of Terrestrial or Aquatic plant species codes to search for.  Results will match any in the list.',
              items: {
                type: 'string'
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
    defaultLog.debug({
      label: 'point-of-interest',
      message: 'getPointsOfInterestBySearchFilterCriteria',
      body: req.body
    });

    // get proper names from mapping table
    if (req.body.species_positive) {
      const positiveNames = await getMappedFilterRows(req.body.species_positive);
      defaultLog.info(positiveNames);
      if (positiveNames) {
        req.body.species_positive = positiveNames;
      }
    }
    if (req.body.species_negative) {
      const negativeNames = await getMappedFilterRows(req.body.species_negative);
      defaultLog.info(negativeNames);
      if (negativeNames) {
        req.body.species_negative = negativeNames;
      }
    }

    const sanitizedSearchCriteria = new PointOfInterestSearchCriteria(req.body);
    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'points-of-interest',
        code: 503
      });
    }

    try {
      if (isIAPPrelated(sanitizedSearchCriteria)) {
        const responseSurveyExtract = await getIAPPsites(sanitizedSearchCriteria);

        return res.status(200).json({ message: 'Got IAPP sites', result: responseSurveyExtract, code: 200 });
      } else {
        const sqlStatement: SQLStatement = getPointsOfInterestSQL(sanitizedSearchCriteria);

        if (!sqlStatement) {
          return res.status(500).json({
            message: 'Failed to build SQL statement',
            request: req.body,
            namespace: 'points-of-interest',
            code: 500
          });
        }

        const responseIAPP = await connection.query(sqlStatement.text, sqlStatement.values);

        // parse the rows from the response
        const rows = { rows: (responseIAPP && responseIAPP.rows) || [] };

        // parse the count from the response
        const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};

        return res.status(200).json({
          message: 'Got points of interest by search filter criteria',
          request: req.body,
          result: rows,
          count: count,
          namespace: 'points-of-interest',
          code: 200
        });
      }
    } catch (error) {
      defaultLog.debug({ label: 'getPointsOfInterestBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to get points of interest by search filter criteria',
        request: req.body,
        error: error,
        namespace: 'points-of-interest',
        code: 500
      });
    } finally {
      connection.release();
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