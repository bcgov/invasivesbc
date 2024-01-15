import { SECURITY_ON, ALL_ROLES } from '../../constants/misc';
import { createHash } from 'crypto';
import { getDBConnection } from '../../database/db';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getuid } from 'process';
import SQL, { SQLStatement } from 'sql-template-strings';
import { InvasivesRequest } from 'utils/auth-utils';
import { getLogger } from '../../utils/logger';
import { streamActivitiesResult } from '../../utils/iapp-json-utils';

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
  } else {
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
          if (!selectColumns.includes('activity_payload')) {
            selectColumns.push('activity_payload');
          }
          break;
        case 'activity_date':
          if (!selectColumns.includes('activity_payload')) {
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
  //sanitize serverFilterGeometries
  let serverFilterGeometries = [];

  //sanitize clientFilterGeometries
  let clientFilterGeometries = [];

  if (filterObject?.tableFilters?.length > 0) {
    filterObject.tableFilters.forEach((filter) => {
      if(filter.filter === '') return;
      switch (filter.filterType) {
        case 'tableFilter':
          switch (filter.field) {
            case 'form_status':
              if (filter.filter === 'Draft') {
                // create a new filter for created by using current user id:
                sanitizedTableFilters.push({
                  field: 'created_by',
                  filter: req.authContext.user['preferred_username'],
                  filterType: 'tableFilter',
                  operator: 'EQUALS'
                });
                sanitizedTableFilters.push(filter);
              } else {
                sanitizedTableFilters.push(filter);
              }
              break;
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
          break;
        case 'spatialFilterDrawn':
          if (filter.filter) {
            clientFilterGeometries.push(filter?.geojson?.geometry);
          }
          break;
        case 'spatialFilterUploaded':
          if (!isNaN(parseInt(filter?.filter))) {
            serverFilterGeometries.push(parseInt(filter.filter));
          }
          break;
        default:
          break;
      }
    });
  }
  // check for form status in filters:
  const formStatusFilter = sanitizedTableFilters.find((filter) => filter.field === 'form_status');
  if (!formStatusFilter) {
    sanitizedTableFilters.push({
      field: 'form_status',
      filter: 'Submitted',
      filterType: 'tableFilter'
    });
  }

  sanitizedSearchCriteria.serverFilterGeometries = serverFilterGeometries;
  sanitizedSearchCriteria.clientFilterGeometries = clientFilterGeometries;
  sanitizedSearchCriteria.clientReqTableFilters = sanitizedTableFilters;
  //todo actually validate:
  sanitizedSearchCriteria.isCSV = filterObject?.isCSV;
  sanitizedSearchCriteria.CSVType = filterObject?.CSVType;
  defaultLog.debug({
    label: 'getActivitiesBySearchFilterCriteria',
    message: 'sanitizedObject',
    body: JSON.stringify(sanitizedSearchCriteria, null, 2)
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

      if (filterObject.isCSV && filterObject.CSVType) {
        res.status(200);
        await streamActivitiesResult(filterObject, res, sql);
      } else {
        const response = await connection.query(sql.text, sql.values);

        return res.status(200).json({
          message: 'fetched activities by criteria',
          request: req.body,
          result: response.rows,
          count: response.rowCount,
          namespace: 'activities',
          code: 200
        });
      }
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
  try {
    let sqlStatement: SQLStatement = SQL``;
    sqlStatement = initialWithStatement(sqlStatement);
    sqlStatement = additionalCTEStatements(sqlStatement, filterObject);
    sqlStatement = selectStatement(sqlStatement, filterObject);
    sqlStatement = fromStatement(sqlStatement, filterObject);
    sqlStatement = whereStatement(sqlStatement, filterObject);
    sqlStatement = groupByStatement(sqlStatement, filterObject);
    sqlStatement = orderByStatement(sqlStatement, filterObject);
    sqlStatement = limitStatement(sqlStatement, filterObject);
    sqlStatement = offSetStatement(sqlStatement, filterObject);

    defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'sql', body: sqlStatement });
    return sqlStatement;
  } catch (e) {
    defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'error', body: e.message });
    throw e;
  }
}

function initialWithStatement(sqlStatement: SQLStatement) {
  /*const withStatement = sqlStatement.append(
    `with not_deleted_activities as (SELECT a.* FROM invasivesbc.activity_incoming_data a  
      where a.iscurrent = true
      )   `
  );*/
  return sqlStatement;
}

function additionalCTEStatements(sqlStatement: SQLStatement, filterObject: any) {
  //todo: only do this when applicable
  const cte = sqlStatement.append(`  with CurrentPositiveObservations AS (
    SELECT
        cpo.activity_incoming_data_id,
        string_agg(cpo.invasive_plant, ', ') AS current_positive_species
    FROM
        invasivesbc.current_positive_observations_materialized cpo
    GROUP BY
        cpo.activity_incoming_data_id
),
CurrentNegativeObservations AS (
    SELECT
        cno.activity_incoming_data_id,
        string_agg(cno.invasive_plant, ', ') AS current_negative_species
    FROM
        invasivesbc.current_negative_observations_materialized cno
    GROUP BY
        cno.activity_incoming_data_id),
`);

  if (filterObject?.serverFilterGeometries?.length > 0) {
    sqlStatement.append(`
     
        serverFilterGeometryIDs as (
 
          select unnest(array[${filterObject?.serverFilterGeometries.join(',')}]) as id
         
          ),
         serverFilterGeometries AS (
         select a.id, title, st_subdivide(geog::geometry)::geography as geo
         from invasivesbc.admin_defined_shapes a
         inner join serverFilterGeometryIDs b on a.id = b.id
         ),
         
          serverFilterGeometriesIntersecting as (
         
         select a.activity_incoming_data_id, b.id
         from activity_incoming_data a
         inner join serverFilterGeometries b on st_intersects(a.geog, b.geo)
         where iscurrent=true
         group by a.activity_incoming_data_id, b.id
         
         
         ),
          serverFilterGeometriesIntersectingAll as (
         
         select a.activity_incoming_data_id, count(*)
         from activity_incoming_data a
         inner join serverFilterGeometriesIntersecting b on a.activity_incoming_data_id  = b.activity_incoming_data_id
         where iscurrent=true
         group by a.activity_incoming_data_id 
         
         having count(*) = (select count(*) from serverFilterGeometryIDs)
         ),
         `);
  }
  if (filterObject?.clientFilterGeometries?.length > 0) {
    sqlStatement.append(`
         clientFilterGeometries AS (
             SELECT
                 unnest(array[${filterObject.clientFilterGeometries
                   .map((geometry) => `st_setsrid(st_geomfromgeojson('${JSON.stringify(geometry)}'), 4326)`)
                   .join(',')}]) AS geojson
         ),
         
          clientFilterGeometriesIntersecting as (
         
         select a.activity_incoming_data_id 
         from activity_incoming_data a
         inner join clientFilterGeometries on st_intersects(a.geog, geojson)
         where iscurrent=true
         
         ),
          clientFilterGeometriesIntersectingAll as (
         
         select a.activity_incoming_data_id, count(*)
         from activity_incoming_data a
         inner join clientFilterGeometriesIntersecting b on a.activity_incoming_data_id  = b.activity_incoming_data_id
         where iscurrent=true
         group by a.activity_incoming_data_id 
         
         having count(*) = (select count(*) from clientFilterGeometries)
         ),
         `);
  }

  sqlStatement.append(`
activities as (
    select a.*, CurrentPositiveObservations.current_positive_species, CurrentNegativeObservations.current_negative_species, 
    case when CurrentPositiveObservations.current_positive_species is null then false else true end as has_current_positive,
    case when CurrentNegativeObservations.current_negative_species is null then false else true end as has_current_negative  
    `);

  /*if (filterObject?.serverFilterGeometries?.length > 0) {
    sqlStatement.append(`
    ,case when ServerBoundariesToIntersect.geog is null then false else true end as intersects_server_boundary
    `);
  }
  if (filterObject?.clientFilterGeometries?.length > 0) {
    sqlStatement.append(`
    ,case when ClientBoundariesToIntersect.geog is null then false else true end as intersects_client_boundary
    `);
  }*/

  sqlStatement.append(`
    from activity_incoming_data a
    left join CurrentPositiveObservations on CurrentPositiveObservations.activity_incoming_data_id = a.activity_incoming_data_id
    left join CurrentNegativeObservations on CurrentNegativeObservations.activity_incoming_data_id = a.activity_incoming_data_id

    `);

  if (filterObject?.serverFilterGeometries?.length > 0) {
    sqlStatement.append(`
      inner join serverFilterGeometriesIntersectingAll c on a.activity_incoming_data_id = c.activity_incoming_data_id
      `);
  }

  if (filterObject?.clientFilterGeometries?.length > 0) {
    sqlStatement.append(`
      inner join clientFilterGeometriesIntersectingAll d on a.activity_incoming_data_id = d.activity_incoming_data_id
      `);
  }

  sqlStatement.append(`
    )  `);

  defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'sql', body: sqlStatement });

  return cte;
}

function selectStatement(sqlStatement: SQLStatement, filterObject: any) {
  if (filterObject.selectColumns) {
    if (filterObject.isCSV) {
      const select = sqlStatement.append(SQL` select extract.* `);
      return select;
    } else {
      const select = sqlStatement.append(
        `select ${filterObject.selectColumns.map((column) => `activities.${column}`).join(',')} `
      );
      return select;
    }
  } else {
    const select = sqlStatement.append(`select * `);
    return select;
  }
}

function fromStatement(sqlStatement: SQLStatement, filterObject: any) {
  let from = sqlStatement.append(`from activities  `);
  if (filterObject.isCSV) {
    from = sqlStatement.append(` b `);
    switch (filterObject.CSVType) {
      case 'terrestrial_plant_observation':
        sqlStatement.append(
          'join observation_terrestrial_plant_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
      case 'aquatic_plant_observation':
        sqlStatement.append('join observation_aquatic_plant_summary extract ON extract.activity_id = b.activity_id ');
        break;
      case 'terrestrial_chemical_treatment':
        sqlStatement.append(
          'join treatment_chemical_terrestrial_plant_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
      case 'aquatic_chemical_treatment':
        sqlStatement.append(
          'join treatment_chemical_aquatic_plant_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
      case 'terrestrial_mechanical_treatment':
        sqlStatement.append(
          'join treatment_mechanical_terrestrial_plant_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
      case 'aquatic_mechanical_treatment':
        sqlStatement.append(
          'join treatment_mechanical_aquatic_plant_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
      case 'biocontrol_release':
        sqlStatement.append('join biocontrol_release_summary extract ON extract.activity_id = b.activity_id ');
        break;
      case 'biocontrol_collection':
        sqlStatement.append('join biocontrol_collection_summary extract ON extract.activity_id = b.activity_id ');
        break;
      case 'biocontrol_dispersal':
        sqlStatement.append(
          'join biocontrol_dispersal_monitoring_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
      case 'chemical_treatment_monitoring':
        sqlStatement.append(
          'join chemical_treatment_monitoring_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
      case 'mechanical_treatment_monitoring':
        sqlStatement.append(
          'join mechanical_treatment_monitoring_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
      case 'biocontrol_release_monitoring':
        sqlStatement.append(
          'join biocontrol_release_monitoring_summary extract ON extract.activity_id = b.activity_id '
        );
        break;

      default:
        sqlStatement.append(
          'join observation_terrestrial_plant_summary extract ON extract.activity_id = b.activity_id '
        );
        break;
    }
  }
  return from;
}

function whereStatement(sqlStatement: SQLStatement, filterObject: any) {
  const where = sqlStatement.append(`where 1=1 and activities.iscurrent = true  `);
  if (filterObject.serverSideNamedFilters.hideTreatmentsAndMonitoring) {
    where.append(`and activities.activity_type not in ('Treatment','Monitoring') `);
  }

  filterObject.clientReqTableFilters.forEach((filter) => {
    switch (filter.field) {
      case 'form_status':
        where.append(`and LOWER(activities.form_status) = LOWER('${filter.filter}') `);
        break;
      case 'activity_id':
        where.append(
          `and LOWER(activities.activity_id) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'} LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'short_id':
        where.append(
          `and LOWER(activities.short_id) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'activity_type':
        where.append(
          `and LOWER(activities.activity_type) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'activity_subtype':
        where.append(
          `and LOWER(activities.activity_subtype) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'activity_date':
        where.append(
          `and substring((activities.activity_payload::json->'form_data'->'activity_data'->'activity_date_time'::text)::text, 2, 10) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  '%${filter.filter}%' `
        );
        break;
      case 'project_code':
        where.append(
          `and LOWER((activities.activity_payload::json->'form_data'->'activity_data'->'project_code'::text)::text) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'jurisdiction_display':
        where.append(
          `and LOWER(activities.jurisdiction_display) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'species_positive_full':
        where.append(
          `and LOWER(activities.species_positive_full) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'species_negative_full':
        where.append(
          `and LOWER(activities.species_negative_full) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'has_current_positive':
        where.append(
          `and activities.current_positive_species ${filter.operator === 'CONTAINS' ? 'is not' : 'is'} null `
        );
        break;
      case 'has_current_negative':
        where.append(
          `and activities.current_negative_species  ${filter.operator === 'CONTAINS' ? 'is not' : 'is'} null `
        );
        break;
      case 'current_positive_species':
        where.append(
          `and LOWER(activities.current_positive_species) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'current_negative_species':
        where.append(
          `and LOWER(activities.current_negative_species)  ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'species_treated_full':
        where.append(
          `and LOWER(activities.species_treated_full) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'species_biocontrol_full':
        where.append(
          `and LOWER(activities.species_biocontrol_full) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'created_by':
        if (filter.operator === 'CONTAINS') {
          where.append(
            `and LOWER(activities.created_by) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
              filter.filter
            }%') `
          );
        } else if (filter.operator === 'EQUALS') {
          where.append(`and LOWER(activities.created_by) = LOWER('${filter.filter}') `);
        }
        break;
      case 'updated_by':
        where.append(
          `and LOWER(activities.updated_by) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'agency':
        where.append(
          `and LOWER(activities.agency) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'regional_invasive_species_organization_areas':
        where.append(
          `and LOWER(activities.regional_invasive_species_organization_areas) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'regional_districts':
        where.append(
          `and LOWER(activities.regional_districts) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'invasive_plant_management_areas':
        where.append(
          `and LOWER(activities.invasive_plant_management_areas) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'biogeoclimatic_zones':
        where.append(
          `and LOWER(activities.biogeoclimatic_zones) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'elevation':
        where.append(
          `and LOWER(activities.elevation) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'batch_id':
        where.append(
          `and LOWER(activities.batch_id::text) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
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
