import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ACTIVATED_ROLES } from 'constants/misc';
import { getActivitiesSQLv2, sanitizeActivityFilterObject } from 'queries/activities-v2-queries';
import { InvasivesRequest } from 'utils/auth-utils';
import OpenAPISpec from 'utils/OpenAPISpec';
import QueryHandler from 'utils/endpoints/QueryHandler';
import LoggerHandler from 'utils/endpoints/LoggerHandler';

const NAMESPACE = 'bbox';

const logger = new LoggerHandler(NAMESPACE);
const POST: Operation = [postHandler()];
new OpenAPISpec('Fetch bounding box based on search criteria', [NAMESPACE])
  .security(ACTIVATED_ROLES)
  .requestBody({
    description: 'Recordset search filter criteria',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  })
  .response(200, {
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
  })
  .build(POST);

/**
 * @desc Create Bounding box based on the filter properties for a given recordset
 */
function postHandler(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const db = new QueryHandler();

    try {
      logger.verbose('[postHandler]', { body: req.body });
      if (!req.body?.filterObjects?.[0]) {
        return res.status(400).send('No filter object provided');
      }

      const filterObject = sanitizeActivityFilterObject(req.body.filterObjects[0], req);
      filterObject.boundingBoxOnly = true;
      const response = await db.query(getActivitiesSQLv2(filterObject));
      if (response.rowCount > 0) {
        return res.status(200).json(response.rows[0]);
      }

      return res.status(404).send('No results for bbox.');
    } catch (e) {
      logger.error(e, NAMESPACE);
      return res.sendStatus(500);
    }
  };
}

export { POST };
