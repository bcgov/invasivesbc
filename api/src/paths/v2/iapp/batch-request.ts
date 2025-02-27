import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { getLogger } from 'utils/logger';
import { PoolClient } from 'pg';
import { InvasivesRequest } from 'utils/auth-utils';
import { getSitesBasedOnSearchCriteriaSQL } from 'queries/iapp-queries';
import { mapSitesRowsToJSON } from 'utils/iapp-json-utils';
import { PointOfInterestSearchCriteria } from 'models/point-of-interest';

import getSelectColumnsByRecordSetType from 'sharedAPI/src/getSelectColumnsByRecordSetType';
import { getIAPPSQLv2, sanitizeIAPPFilterObject } from '../iapp';

const NAMESPACE = '/v2/iapp/batch-request';
const defaultLog = getLogger(NAMESPACE);

const GET: Operation = [getActivity()];

GET.apiDoc = {
  description: 'Returns multiple IAPP Records for device caching in Table/Record format',
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  parameters: [
    {
      in: 'query',
      name: 'idList',
      required: true,
      description: 'A list of IDs to retrieve items for.',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['id1', 'id2', 'id3']
      }
    }
  ],
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {}
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
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
 * @desc Fetch a batch of records for caching via their IDs
 * @return { RequestHandler }
 */
function getActivity(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (req.authContext.roles.length === 0) return res.status(401).json({ message: 'No Role for user' });
    const idList: string[] = JSON.parse(req.query.idList as string);
    let connection: PoolClient;

    try {
      connection = await getDBConnection();
      const resObj: Record<PropertyKey, any> = {};
      const filterObject = { ids_to_filter: idList, selectColumns: getSelectColumnsByRecordSetType('IAPP') };
      const sql = getIAPPSQLv2(sanitizeIAPPFilterObject(filterObject, req));
      const search = new PointOfInterestSearchCriteria({ point_of_interest_ids: idList });
      const baseIappRecordSQL = getSitesBasedOnSearchCriteriaSQL(search);
      const [iappRecordResult, iappTableResult] = await Promise.all([
        mapSitesRowsToJSON(await connection.query(baseIappRecordSQL.text, baseIappRecordSQL.values), search),
        connection.query(sql.text, sql.values)
      ]);
      for (const result of iappTableResult.rows) {
        resObj[result.site_id] = { row: result };
      }
      for (const result of iappRecordResult) {
        resObj[result.site_id].record = result;
      }
      return res.status(200).json(resObj);
    } catch (error) {
      defaultLog.debug({ label: NAMESPACE, error: error, body: req.body });
      return res.status(500).json({
        message: 'Unable to fetch ids in list.',
        request: req.body,
        error: JSON.stringify(error),
        namespace: NAMESPACE,
        code: 500
      });
    } finally {
      connection?.release();
    }
  };
}

export { GET };
