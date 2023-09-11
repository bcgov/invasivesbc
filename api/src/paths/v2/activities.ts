import { SECURITY_ON, ALL_ROLES } from '../../constants/misc';
import { createHash } from 'crypto';
import { getDBConnection } from '../../database/db';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getuid } from 'process';
import SQL, { SQLStatement } from 'sql-template-strings';
import { InvasivesRequest } from 'utils/auth-utils';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('activity');
const CACHENAME = 'Activities v2 - Fat';

export const POST: Operation = [getActivitiesBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all activities based on search criteria.',
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Activities Request Object',
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
    304: {
      $ref: '#/components/responses/304'
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

function sanitizeActivityFilterObject(filterObject: any, req: any) {
  let sanitizedSearchCriteria = {
    serverSideNamedFilters: {},
    selectColumns: [],
    clientReqTableFilters: []
  } as any;

  const roleName = (req as any).authContext.roles[0]?.role_name;
  //const sanitizedSearchCriteria = new ActivitySearchCriteria(criteria);
  // sanitizedSearchCriteria.created_by = [req.authContext.user['preferred_username']];
  const isAuth = req.authContext?.user !== null ? true : false;
  const user_role = (req as any).authContext?.roles?.[0]?.role_id;
  if (user_role) {
    const user_roles = Array.from({ length: user_role }, (_, i) => i + 1);
    sanitizedSearchCriteria.user_roles = user_roles;
  }
  if (!isAuth || !roleName || roleName.includes('animal')) {
    sanitizedSearchCriteria.serverSideNamedFilters.hideTreatmentsAndMonitoring = true;
  } else {
    sanitizedSearchCriteria.serverSideNamedFilters.hideTreatmentsAndMonitoring = false;
  }
  if (!isAuth) {
    sanitizedSearchCriteria.serverSideNamedFilters.hideEditedByFields = true;
  }

  let selectColumns = [];

  if (filterObject?.selectColumns) {
    filterObject.selectColumns.forEach((column) => {
      switch (column) {
        case 'created_by':
          if (!sanitizedSearchCriteria.serverSideNamedFilters.hideEditedByFields) {
            selectColumns.push(column);
          }
          break;
        case 'updated_by':
          if (!sanitizedSearchCriteria.serverSideNamedFilters.hideEditedByFields) {
            selectColumns.push(column);
          }
          break;
        default:
          selectColumns.push(column);
          break;
      }
    });
  }

  return sanitizedSearchCriteria;
}

/**
 * Fetches all activity records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getActivitiesBySearchFilterCriteria(): RequestHandler {
  const reqID = getuid();
  return async (req: InvasivesRequest, res) => {
    const rawBodyCriteria = req.body['filterObjects'];
    const filterObject = sanitizeActivityFilterObject(rawBodyCriteria?.[0], req);
    defaultLog.debug({ label: 'v2/activity', message: 'getActivitiesBySearchFilterCriteria v2', body: '' });

    let connection;
    let sql;

    try {
      connection = await getDBConnection();
      if (!connection) {
        defaultLog.error({
          label: 'v2/activity',
          message: 'getActivitiesBySearchFilterCriteria',
          body: 'reqID:' + reqID + ' - ' + 'Database connection unavailable'
        });
        return res.status(503).json({ message: 'Database connection unavailable', namespace: 'activities', code: 503 });
      }

      sql = getActivitiesSQLv2(filterObject);
      const response = await connection.query(sql.text, sql.values);

      return res.status(200).json({
        message: 'fetched activities by criteria',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'activities',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Error getting activities by search filter criteria',
        error,
        namespace: 'v2/activities',
        code: 500
      });
    } finally {
      connection?.release();
    }
  };
}

function getActivitiesSQLv2(filterObject: any) {
  let sqlStatement: SQLStatement = SQL``;
  sqlStatement = initialWithStatement(sqlStatement);
  sqlStatement = additionalCTEStatements(sqlStatement, filterObject);
  sqlStatement = selectStatement(sqlStatement, filterObject);
  sqlStatement = fromStatement(sqlStatement, filterObject);
  sqlStatement = whereStatement(sqlStatement, filterObject);
  sqlStatement = groupByStatement(sqlStatement, filterObject);
  sqlStatement = orderByStatement(sqlStatement, filterObject);
  sqlStatement = limitStatement(sqlStatement, filterObject);

  return sqlStatement;
}

function initialWithStatement(sqlStatement: SQLStatement) {
  const withStatement = sqlStatement.append(
    `with activities as (SELECT * FROM invasivesbc.activity_incoming_data where deleted_timestamp is null)   `
  );
  return withStatement;
}

function additionalCTEStatements(sqlStatement: SQLStatement, filterObject: any) {
  //todo: only do this when applicable
  const cte = sqlStatement.append(`  , CurrentPositiveObservations AS (
    SELECT
        cpo.activity_incoming_data_id,
        string_agg(cpo.invasive_plant, ', ') AS current_positive_species
    FROM
        current_positive_observations cpo
    GROUP BY
        cpo.activity_incoming_data_id
),
CurrentNegativeObservations AS (
    SELECT
        cno.activity_incoming_data_id,
        string_agg(cno.invasive_plant, ', ') AS current_negative_species
    FROM
        current_negative_observations cno
    GROUP BY
        cno.activity_incoming_data_id) `);
  return cte;
}

function selectStatement(sqlStatement: SQLStatement, filterObject: any) {
  if (filterObject.selectColumns) {
    const select = sqlStatement.append(`select ${filterObject.selectColumns.join(',')} `);
    return select;
  } else {
    const select = sqlStatement.append(`select * `);
    return select;
  }
}

function fromStatement(sqlStatement: SQLStatement, filterObject: any) {
  const from = sqlStatement.append(`from activities `);
  return from;
}

function whereStatement(sqlStatement: SQLStatement, filterObject: any) {
  const where = sqlStatement.append(`where 1=1 `);
  return where;
}

function groupByStatement(sqlStatement: SQLStatement, filterObject: any) {
  const groupBy = sqlStatement.append(``);
  return groupBy;
}

function orderByStatement(sqlStatement: SQLStatement, filterObject: any) {
  const orderBy = sqlStatement.append(``);
  return orderBy;
}

function limitStatement(sqlStatement: SQLStatement, filterObject: any) {
  const limit = sqlStatement.append(`limit 20;`);
  return limit;
}
