import { Operation } from 'express-openapi';
import { RequestHandler, Response } from 'express';
import { streamActivitiesResult } from 'utils/iapp-json-utils';
import { ALL_ROLES } from 'constants/misc';
import { InvasivesRequest } from 'utils/auth-utils';
import { getActivitiesSQLv2, sanitizeActivityFilterObject } from 'queries/activities-v2-queries';
import OpenAPISpec from 'utils/OpenAPISpec';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import verifyUserRole from 'utils/validateRole';
import QueryHandler from 'utils/endpoints/QueryHandler';

const logger = new LoggerHandler('activity');
const POST: Operation = [getActivitiesBySearchFilterCriteria()];

new OpenAPISpec('Fetches all activities based on search criteria.', ['activity'])
  .security(ALL_ROLES)
  .requestBody({
    description: 'Activities Request Object',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  })
  .response(200, {
    description: 'Activity get response object array.',
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
                  properties: {}
                }
              }
            }
          }
        }
      }
    }
  })
  .build(POST);

/**
 * @desc Fetches all activity records based on request search filter criteria.
 */
function getActivitiesBySearchFilterCriteria(): RequestHandler {
  return async (req: InvasivesRequest, res: Response) => {
    if (!verifyUserRole(POST.apiDoc, req)) return res.sendStatus(401);

    try {
      const rawBodyCriteria = req.body['filterObjects'];
      const filterObject = sanitizeActivityFilterObject(rawBodyCriteria?.[0], req);
      const sql = getActivitiesSQLv2(filterObject);
      if (filterObject.isCSV && filterObject.CSVType) {
        await streamActivitiesResult(filterObject, res, sql);
      } else {
        const response = await new QueryHandler().query(sql);
        return res.status(200).json({ result: response.rows });
      }
    } catch (e) {
      logger.error(e, '[getActivitiesBySearchFilterCriteria]');
      return res.status(500).send('Error getting activities by search filter criteria');
    }
  };
}

export { POST };
