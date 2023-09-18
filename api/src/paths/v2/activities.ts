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
  else {
    sanitizedSearchCriteria.serverSideNamedFilters.hideEditedByFields = false;
  }

  let selectColumns = [];

  if (filterObject?.selectColumns?.length > 0) {
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
        /* NOTE: any payload columns need this: */
        case 'project_code':
          if(!selectColumns.includes('activity_payload')){
            selectColumns.push('activity_payload');
          }
          break;
        case 'activity_date':
          if(!selectColumns.includes('activity_payload')){
            selectColumns.push('activity_payload');
          }
          break;
        default:
          // probably not acceptable to allow this, but it's here for now
          selectColumns.push(column);
          break;
      }
    });
  }

  //sanitize limit
  let limit = 20;
  if (filterObject?.limit && !isNaN(filterObject.limit)) {
    limit = filterObject.limit;
  }

  //compute offset by page and limit
  let offset = 0;
  if (filterObject?.page && filterObject?.limit) {
    offset = filterObject.page * filterObject.limit;
  }


  sanitizedSearchCriteria.limit = limit;
  sanitizedSearchCriteria.offset = offset;

  sanitizedSearchCriteria.selectColumns = selectColumns;

  let sanitizedTableFilters = [];

  if (filterObject?.tableFilters?.length > 0) {
    filterObject.tableFilters.forEach((filter) => {
      switch (filter.field) {
        case 'created_by':
          if (!sanitizedSearchCriteria.serverSideNamedFilters.hideEditedByFields) {
            sanitizedTableFilters.push(filter);
          }
          break;
        case 'updated_by':
          if (!sanitizedSearchCriteria.serverSideNamedFilters.hideEditedByFields) {
            sanitizedTableFilters.push(filter);
          }
          break;
        default:
          sanitizedTableFilters.push(filter);
          break;
      }
    });
  }



  sanitizedSearchCriteria.clientReqTableFilters = sanitizedTableFilters;
  defaultLog.debug({
    label: 'getActivitiesBySearchFilterCriteria',
    message: 'sanitizedObject',
    body: sanitizedSearchCriteria
  });

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
  sqlStatement = offSetStatement(sqlStatement, filterObject)

  defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'sql', body: sqlStatement });
  return sqlStatement;
}

function initialWithStatement(sqlStatement: SQLStatement) {
  const withStatement = sqlStatement.append(
    `with not_deleted_activities as (SELECT a.* FROM invasivesbc.activity_incoming_data a inner join invasivesbc.activity_current b on 
      a.activity_incoming_data_id = b.incoming_data_id )   `
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
        invasivesbc.current_positive_observations cpo
    GROUP BY
        cpo.activity_incoming_data_id
),
CurrentNegativeObservations AS (
    SELECT
        cno.activity_incoming_data_id,
        string_agg(cno.invasive_plant, ', ') AS current_negative_species
    FROM
        invasivesbc.current_negative_observations cno
    GROUP BY
        cno.activity_incoming_data_id),
activities as (
    select not_deleted_activities.*, CurrentPositiveObservations.current_positive_species, CurrentNegativeObservations.current_negative_species, 
    case when CurrentPositiveObservations.current_positive_species is null then false else true end as has_current_positive,
    case when CurrentNegativeObservations.current_negative_species is null then false else true end as has_current_negative  
    from not_deleted_activities
    left join CurrentPositiveObservations on CurrentPositiveObservations.activity_incoming_data_id = not_deleted_activities.activity_incoming_data_id
    left join CurrentNegativeObservations on CurrentNegativeObservations.activity_incoming_data_id = not_deleted_activities.activity_incoming_data_id
) `);
  return cte;
}

function selectStatement(sqlStatement: SQLStatement, filterObject: any) {
  if (filterObject.selectColumns) {
    const select = sqlStatement.append(`select ${filterObject.selectColumns.map((column) => `activities.${column}`).join(',')} `);
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
  if (filterObject.serverSideNamedFilters.hideTreatmentsAndMonitoring) {
    where.append(`and activities.activity_type not in ('Treatment','Monitoring') `);
  }

  filterObject.clientReqTableFilters.forEach((filter) => {
    switch (filter.field) {
      case 'activity_id':
        where.append(`and activities.activity_id ${filter.operator === 'CONTAINS'? 'like': 'not like'} '%${filter.filter}%' `);
        break;
      case 'short_id':
        where.append(`and activities.short_id ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'activity_type':
        where.append(`and activities.activity_type ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'activity_subtype':
        where.append(`and activities.activity_subtype ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'activity_date':
          where.append(`and substring((activities.activity_payload::json->'form_data'->'activity_data'->'activity_date_time'::text)::text, 2, 10) ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `)
        break;
      case 'project_code':
        where.append(
          `and (activities.activity_payload::json->'form_data'->'activity_data'->'project_code'::text)::text ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `
        );
        break;
      case 'jurisdiction_display':
        where.append(`and activities.jurisdiction_display ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'species_positive_full':
        where.append(`and activities.species_positive_full ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'species_negative_full':
        where.append(`and activities.species_negative_full ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'has_current_positive':
        where.append(`and activities.current_positive_species ${filter.operator === 'CONTAINS'? 'is not': 'is'} null `);
        break;
      case 'has_current_negative':
        where.append(`and activities.current_negative_species  ${filter.operator === 'CONTAINS'? 'is not': 'is'} null `);
        break;
      case 'current_positive_species':
        where.append(`and activities.current_positive_species ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'current_negative_species':
        where.append(`and activities.current_negative_species  ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'species_treated_full':
        where.append(`and activities.species_treated_full ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'created_by':
        where.append(`and activities.created_by ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'updated_by':
        where.append(`and activities.updated_by ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'agency':
        where.append(`and activities.agency ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'regional_invasive_species_organization_areas':
        where.append(`and activities.regional_invasive_species_organization_areas ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'regional_districts':
        where.append(`and activities.regional_districts ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'biogeoclimatic_zones':
        where.append(`and activities.biogeoclimatic_zones ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'elevation':
        where.append(`and activities.elevation ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      case 'batch_id':
        where.append(`and activities.batch_id::text ${filter.operator === 'CONTAINS'? 'like': 'not like'}  '%${filter.filter}%' `);
        break;
      default:
        break;
    }
  });

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
  const limit = sqlStatement.append(` limit ${filterObject.limit}`);
  return limit;
}

function offSetStatement(sqlStatement: SQLStatement, filterObject: any) {
  const offset = sqlStatement.append(` offset ${filterObject.offset};`);
  return offset;
}
