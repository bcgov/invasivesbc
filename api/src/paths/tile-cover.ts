import { RequestHandler } from 'express';
import { PoolClient } from 'pg';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { getLogger } from 'utils/logger';
import { InvasivesRequest } from 'utils/auth-utils';
import { getDBConnection } from 'database/db';
import { ACTIVATED_ROLES, SECURITY_ON } from 'constants/misc';

import { getAreaOfInterestTileCoordinates, getTilesForCells } from 'queries/area-of-interest-queries';

const NAMESPACE = 'tile-cover';
const defaultLog = getLogger(NAMESPACE);
const POST: Operation = [getTiles()];

POST.apiDoc = {
  description: 'Fetches a tiles.',
  tags: [NAMESPACE],
  security: SECURITY_ON
    ? [
        {
          Bearer: ACTIVATED_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'GeoJSON Polygon defining the area of interest',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            maxZoom: {
              type: 'number'
            },
            bounds: {
              type: 'object',
              properties: {
                minLatitude: {
                  type: 'number'
                },
                maxLatitude: {
                  type: 'number'
                },
                minLongitude: {
                  type: 'number'
                },
                maxLongitude: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    }
  },

  responses: {
    200: {
      description: 'Tile Cover POST response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {}
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

function getTiles(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (req.authContext.roles.length === 0) {
      return res.status(401).json({ message: 'No Role for user' });
    }
    const { bounds, maxZoom } = req.body ?? {};
    if (!(bounds && typeof maxZoom === 'number')) {
      return res.status(400).json({ message: 'Provide bounds and maxZoom' });
    }

    let connection: PoolClient | undefined;
    try {
      connection = await getDBConnection();

      const sqlStatement: SQLStatement = getAreaOfInterestTileCoordinates(bounds, maxZoom); // to load the bc_sheet_tiles' z/x/y coordinates
      // const sqlStatement: SQLStatement = getTilesForCells(bounds, maxZoom); // pmtiles_manifest already has min and max zoom defined, so maxzoom isnt used in the query atm

      if (!sqlStatement) {
        return res.status(400).json({
          message: 'Invalid request',
          request: req.body,
          namespace: NAMESPACE,
          code: 400
        });
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      if (response.rows.length > 0) {
        return res.status(200).json({
          message: 'Found tiles',
          code: 200,
          namespace: NAMESPACE,
          result: response.rows
        });
      } else {
        return res.status(200).json({
          message: 'No Tiles found',
          result: [],
          namespace: NAMESPACE,
          code: 200
        });
      }
    } catch (error) {
      defaultLog.debug({
        label: NAMESPACE,
        message: 'error',
        error
      });
      return res.status(500).json({
        message: 'Server Error occured',
        request: req.body,
        namespace: NAMESPACE,
        code: 500,
        error
      });
    } finally {
      connection?.release();
    }
  };
}

export { POST };
