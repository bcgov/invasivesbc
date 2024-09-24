import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getLogger } from 'utils/logger';
import { getActivitiesSQLv2, sanitizeActivityFilterObject } from './v2/activities';
import SQL, { SQLStatement } from 'sql-template-strings';
import { getDBConnection } from 'database/db';

const defaultLog = getLogger('recordset-bbox');
export const POST: Operation = [postHandler()];

POST.apiDoc = {
  description: 'Fetch bounding box based on search criteria',
  tags: ['recordset-bbox'],
  security: SECURITY_ON ? [{ Bearer: ALL_ROLES }] : [],
  requestBody: {
    description: 'Recordset search filter criteria',
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
      description: 'Bounding box response object',
      content: {
        'application/json': {
          schema: {
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

function postHandler(): RequestHandler {
  return async (req, res, next) => {
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        namespace: 'recordset-bbox',
        code: 503
      });
    }
    try {
      if (req.body?.filterObjects?.[0]) {
        const activitiesSql: SQLStatement = getActivitiesSQLv2(
          sanitizeActivityFilterObject(req.body.filterObjects[0], req)
        );
        let newSQL: SQLStatement = SQL` WITH userQuery AS ( `;

        newSQL.append(activitiesSql.text.replaceAll(/;/g, '').replace('activity_id', 'geog'));
        newSQL.append(` )
          SELECT ST_AsText(ST_Extent(geometry(geog))) as bbox
          FROM userQuery
          WHERE geog IS not null;
        `);
        const response = await connection.query(newSQL.text, newSQL.values);
        // const response = await connection.query(activitiesSql.text, activitiesSql.values);
        res.status(200).json(response);
      } else {
        return res.status(400).json({
          message: 'Missing filter Objects from request',
          request: req.body,
          namespace: 'recordset-bbox',
          code: 400
        });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: 'Server Error occured',
        request: req.body,
        namespace: 'recordset-bbox',
        code: 500,
        error: e
      });
    } finally {
      connection.release();
    }
  };
}
