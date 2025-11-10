import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getIAPPSQLv2, sanitizeIAPPFilterObject } from '../iapp';
import { ALL_ROLES } from 'constants/misc';
import { InvasivesRequest } from 'utils/auth-utils';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import OpenAPISpec from 'utils/OpenAPISpec';
import QueryHandler from 'utils/endpoints/QueryHandler';

const NAMESPACE = 'IAPP-bbox';

const logger = new LoggerHandler(NAMESPACE);
const POST: Operation = [postHandler()];

new OpenAPISpec('Fetch bounding box based on search criteria', [NAMESPACE])
  .security(ALL_ROLES)
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
      if (!req.body?.filterObjects?.[0]) {
        return res.status(400).send('Missing filter object');
      }
      const filterObject = sanitizeIAPPFilterObject(req.body.filterObjects[0], req);
      filterObject.boundingBoxOnly = true;

      const response = await db.query(getIAPPSQLv2(filterObject));

      logger.debug('[postHandler]', { body: req.body, response: response?.values });
      if (response.rowCount === 0) {
        return res.status(404).send('No Results');
      }
      return res.status(200).json(response.rows[0]);
    } catch (e) {
      logger.error(e, NAMESPACE);
      return res.sendStatus(500);
    }
  };
}

export { POST };
