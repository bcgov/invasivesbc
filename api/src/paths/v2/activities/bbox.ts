import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getLogger } from 'utils/logger';
import { getActivitiesSQLv2, sanitizeActivityFilterObject } from 'queries/activities-v2-queries';
import { getDBConnection } from 'database/db';

const NAMESPACE = 'bbox';

const defaultLog = getLogger(NAMESPACE);
export const POST: Operation = [postHandler()];

POST.apiDoc = {
  description: 'Fetch bounding box based on search criteria',
  tags: [NAMESPACE],
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
            type: 'object',
            properties: {
              bbox: {
                type: 'string',
                description: 'Bounding box for the given filters'
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
 * @desc Create Bounding box based on the filter properties for a given recordset
 */
function postHandler(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable',
        namespace: NAMESPACE,
        code: 503
      });
    }
    try {
      defaultLog.debug({ label: NAMESPACE, message: 'postHandler', body: req.body });
      if (req.body?.filterObjects?.[0]) {
        const filterObject = sanitizeActivityFilterObject(req.body.filterObjects[0], req);
        filterObject.boundingBoxOnly = true;
        const activitiesSql: SQLStatement = getActivitiesSQLv2(filterObject);
        const response = await connection.query(activitiesSql.text, activitiesSql.values);

        if (response.rowCount > 0) {
          return res.status(200).json(response.rows[0]);
        } else {
          return res.status(404).json({
            message: 'No Results',
            request: req.body,
            namespace: NAMESPACE,
            code: 404
          });
        }
      } else {
        return res.status(400).json({
          message: 'Missing filter Objects from request',
          request: req.body,
          namespace: NAMESPACE,
          code: 400
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
      connection.release();
    }
  };
}
