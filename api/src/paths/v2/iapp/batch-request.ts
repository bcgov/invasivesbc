import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import getSelectColumnsByRecordSetType from 'sharedAPI/src/getSelectColumnsByRecordSetType';
import { getIAPPSQLv2, sanitizeIAPPFilterObject } from 'paths/v2/iapp';
import { ALL_ROLES } from 'constants/misc';
import { InvasivesRequest } from 'utils/auth-utils';
import { getSitesBasedOnSearchCriteriaSQL } from 'queries/iapp-queries';
import { mapSitesRowsToJSON } from 'utils/iapp-json-utils';
import { PointOfInterestSearchCriteria } from 'models/point-of-interest';
import OpenAPISpec from 'utils/OpenAPISpec';
import QueryHandler from 'utils/endpoints/QueryHandler';
import LoggerHandler from 'utils/endpoints/LoggerHandler';

const logger = new LoggerHandler('/v2/iapp/batch-request');
const GET: Operation = [getActivity()];
new OpenAPISpec('Returns multiple IAPP records for device caching in Table/Record format', ['iapp'])
  .security(ALL_ROLES)
  .parameters({
    in: 'query',
    name: 'idList',
    required: true,
    description: 'A list of IDs to retrieve items for.',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'string'
          },
          example: ['id1', 'id2', 'id3']
        }
      }
    }
  })
  .response(200, {
    description: 'Activity get response object array.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {}
        }
      }
    }
  })
  .build(GET);

/**
 * @desc Fetch a batch of records for caching via their IDs
 * @return { RequestHandler }
 */
function getActivity(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const idList: string[] = JSON.parse(req.query.idList as string);
    const db = new QueryHandler({ maintain: true });

    try {
      const resObj: Record<PropertyKey, any> = {};
      const filterObject = { ids_to_filter: idList, selectColumns: getSelectColumnsByRecordSetType('IAPP') };
      const sql = getIAPPSQLv2(sanitizeIAPPFilterObject(filterObject, req));
      const search = new PointOfInterestSearchCriteria({ point_of_interest_ids: idList }, req);
      const baseIappRecordSQL = getSitesBasedOnSearchCriteriaSQL(search);
      const [iappRecordResult, iappTableResult] = await Promise.all([
        mapSitesRowsToJSON(await db.query(baseIappRecordSQL), search),
        await db.query(sql)
      ]);
      for (const result of iappTableResult.rows) {
        resObj[result.site_id] = { row: result };
      }
      for (const result of iappRecordResult) {
        resObj[result.site_id].record = result;
      }
      return res.status(200).json(resObj);
    } catch (e) {
      logger.error(e);
      return res.status(500).send('Unable to fetch ids in list.');
    } finally {
      db?.close();
    }
  };
}

export { GET };
