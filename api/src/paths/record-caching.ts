import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getDBConnection } from 'database/db';
import { getActivityHistorySQL, getCacheActivitiesSQL } from 'queries/activity-queries';
import { getFileFromS3 } from 'utils/file-utils';
import { getLogger } from 'utils/logger';
import { getMediaItemsList } from 'paths/media';
import { PoolClient } from 'pg';
import { InvasivesRequest } from 'utils/auth-utils';
import { getSitesBasedOnSearchCriteriaSQL } from 'queries/iapp-queries';
import { mapSitesRowsToJSON } from 'utils/iapp-json-utils';
import { PointOfInterestSearchCriteria } from 'models/point-of-interest';
import { getIAPPSQLv2, sanitizeIAPPFilterObject } from './v2/iapp';
import getSelectColumnsByRecordSetType from 'sharedAPI/src/getSelectColumnsByRecordSetType';

const NAMESPACE = 'record-caching';
const defaultLog = getLogger(NAMESPACE);

const GET: Operation = [getActivity()];

GET.apiDoc = {
  description: 'Fetches a single activity based on its primary key.',
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'List of Ids to fetch',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            recordIds: {
              description: 'Ids to fetch',
              type: 'array',
              items: {
                type: 'string'
              }
            },
            recordType: {
              description: 'Type of records to fetch (Activity, IAPP)',
              type: 'string'
            }
          }
        }
      }
    }
  },
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
    if (!req.query.recordIds || !req.query.recordType) return res.status(400).send('Bad request, missing query params');

    const recordIds: string[] = JSON.parse(req.query.recordIds as string);
    const recordType = req.query.recordType;
    let connection: PoolClient;

    try {
      connection = await getDBConnection();
      const resObj: Record<PropertyKey, any> = {};

      if (recordType === 'Activity') {
        const sqlStatement: SQLStatement = getCacheActivitiesSQL(recordIds);
        (await connection.query(sqlStatement.text, sqlStatement.values)).rows.forEach(async (a) => {
          resObj[a.activity_id] = { ...a, ...a.activity_payload };
          delete resObj[a.activity_id].activity_payload;
          if (a?.media_keys?.length > 0) {
            try {
              const response = await Promise.all(a?.media_keys?.map(async (key: string) => getFileFromS3(key)));
              resObj[a.activity_id].media = getMediaItemsList(response, a.media_keys);
            } catch (error) {
              defaultLog.error({
                label: NAMESPACE,
                error: error,
                message: 'Error occured while fetching media from bucket',
                body: req.body.idList
              });
            }
          }
        });
        for (const id of recordIds) {
          const sql = getActivityHistorySQL(id);
          resObj[id].activity_history = (await connection.query(sql.text, sql.values)).rows;
        }
        return res.status(200).json(resObj);
      } else if (recordType === 'IAPP') {
        const filterObject = { ids_to_filter: recordIds, selectColumns: getSelectColumnsByRecordSetType('IAPP') };
        const sql = getIAPPSQLv2(sanitizeIAPPFilterObject(filterObject, req));
        const search = new PointOfInterestSearchCriteria({ point_of_interest_ids: recordIds });
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
      }
      return res.status(400).json({
        message: 'Bad Request. Record type not supported or missing',
        namespace: NAMESPACE
      });
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
