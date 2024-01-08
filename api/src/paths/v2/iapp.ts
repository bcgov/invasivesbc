import { SECURITY_ON, ALL_ROLES } from '../../constants/misc';
import { createHash } from 'crypto';
import { getDBConnection } from '../../database/db';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getuid } from 'process';
import SQL, { SQLStatement } from 'sql-template-strings';
import { InvasivesRequest } from 'utils/auth-utils';
import { getLogger } from '../../utils/logger';
import { streamIAPPResult } from '../../utils/iapp-json-utils';
import { filter } from 'lodash';

const defaultLog = getLogger('IAPP');
const CACHENAME = 'IAPPv2 - Fat';

export const POST: Operation = [getIAPPSitesBySearchFilterCriteria()];

POST.apiDoc = {
  description: 'Fetches all sites based on search criteria.',
  tags: ['IAPP'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'IAPP Request Object',
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
      description: 'IAPP get response object array.',
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

function sanitizeIAPPFilterObject(filterObject: any, req: any) {
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
  const acceptableColumns = [
    'site_id',
    'site_paper_file_id',
    'jurisdictions_flattened',
    'min_survey',
    'all_species_on_site',
    'max_survey',
    'agencies',
    'biological_agent',
    'has_biological_treatments',
    'has_chemical_treatments',
    'has_mechanical_treatments',
    'has_biological_dispersals',
    'monitored',
    'regional_district',
    'regional_invasive_species_organization',
    'invasive_plant_management_area',
    'geojson'
  ];

  if (filterObject?.selectColumns?.length > 0) {
    filterObject.selectColumns.forEach((column) => {
      if (acceptableColumns.includes(column)) {
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
          default:
            // probably not acceptable to allow this, but it's here for now
            selectColumns.push(column);
            break;
        }
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
      switch (filter.filterType) {
        case 'tableFilter':
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
          break;
        case 'spatialFilterDrawn':
          if (filter.filter) {
            clientFilterGeometries.push(filter.geojson);
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

  sanitizedSearchCriteria.serverFilterGeometries = serverFilterGeometries;
  sanitizedSearchCriteria.clientFilterGeometries = clientFilterGeometries;
  sanitizedSearchCriteria.clientReqTableFilters = sanitizedTableFilters;
  defaultLog.debug({
    label: 'getIAPPBySearchFilterCriteria',
    message: 'sanitizedObject',
    body: JSON.stringify(sanitizedSearchCriteria, null, 2)
  });


  if(filterObject?.CSVType)
  {
    sanitizedSearchCriteria.isCSV = true;
    sanitizedSearchCriteria.CSVType = filterObject.CSVType;
  }

  return sanitizedSearchCriteria;
}

/**
 * Fetches all activity records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getIAPPSitesBySearchFilterCriteria(): RequestHandler {
  const reqID = getuid();
  return async (req: InvasivesRequest, res) => {
    const rawBodyCriteria = req.body['filterObjects'];
    const filterObject = sanitizeIAPPFilterObject(rawBodyCriteria?.[0], req);
    defaultLog.debug({ label: 'v2/IAPP', message: 'getIAPPBySearchFilterCriteria v2', body: '' });

    let connection;
    let sql;

    try {
      connection = await getDBConnection();
      if (!connection) {
        defaultLog.error({
          label: 'v2/IAPP',
          message: 'getIAPPBySearchFilterCriteria',
          body: 'reqID:' + reqID + ' - ' + 'Database connection unavailable'
        });
        return res.status(503).json({ message: 'Database connection unavailable', namespace: 'IAPP', code: 503 });
      }

      sql = getIAPPSQLv2(filterObject);

      if(filterObject.isCSV)
      {
          await streamIAPPResult(filterObject, res, sql);
      }
      else
      {
      const response = await connection.query(sql.text, sql.values);

      return res.status(200).json({
        message: 'fetched sites by criteria',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'IAPP',
        code: 200
      });
    }} catch (error) {
      defaultLog.debug({ label: 'getIAPPBySearchFilterCriteria', message: 'error', error });
      return res.status(500).json({
        message: 'Error getting sites by search filter criteria',
        error,
        namespace: 'v2/IAPP',
        code: 500
      });
    } finally {
      connection?.release();
    }
  };
}

function getIAPPSQLv2(filterObject: any) {
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

    defaultLog.debug({ label: 'getIAPPBySearchFilterCriteria', message: 'sql', body: sqlStatement });
    return sqlStatement;
  } catch (e) {
    defaultLog.debug({ label: 'getIAPPBySearchFilterCriteria', message: 'error', body: e.message });
    throw e;
  }
}

function initialWithStatement(sqlStatement: SQLStatement) {
  const withStatement = sqlStatement.append(
    `with iapp_sites AS (
      SELECT a.site_id, a.geog
      FROM
      invasivesbc.iapp_spatial a ),  `
  );
  return withStatement;
}

function additionalCTEStatements(sqlStatement: SQLStatement, filterObject: any) {
  //todo: only do this when applicable

  if (filterObject?.serverFilterGeometries?.length > 0) {
    sqlStatement.append(`
     
        serverFilterGeometryIDs as (
 
          select unnest(array[${filterObject?.serverFilterGeometries.join(',')}]) as id
         
          ),
         serverFilterGeometries AS (
          select a.id, title, st_subdivide(a.geog::geometry, 255)::geography as geo
          from invasivesbc.admin_defined_shapes a
          inner join serverFilterGeometryIDs b on a.id = b.id
         ),
         
          serverFilterGeometriesIntersecting as (
         
            select a.site_id, b.id
            from invasivesbc.iapp_spatial a
            inner join serverFilterGeometries b on  st_intersects(a.geog, b.geo)
            group by a.site_id, b.id
         
         
         ),
          serverFilterGeometriesIntersectingAll as (
         
            select a.site_id, count(*)
            from invasivesbc.iapp_spatial a
            inner join serverFilterGeometriesIntersecting b on a.site_id  = b.site_id
            group by a.site_id

            having count(*) = (select count(*) from serverFilterGeometryIDs)
         ),
         `);
  }
  if (filterObject?.clientFilterGeometries?.length > 0) {
    sqlStatement.append(`
         clientFilterGeometries AS (
             SELECT
                 unnest(array[${filterObject.clientFilterGeometries
                   .map((geometry) => `st_setsrid(st_geomfromgeojson('${JSON.stringify(geometry?.geometry)}'), 4326)`)
                   .join(',')}]) AS geojson
         ),
         
          clientFilterGeometriesIntersecting as (
         
         select a.site_id 
         from iapp_sites a
         inner join clientFilterGeometries on st_intersects(a.geog, geojson)
         
         ),
          clientFilterGeometriesIntersectingAll as (
         
         select a.site_id, count(*)
         from iapp_sites a
         inner join clientFilterGeometriesIntersecting b on a.site_id  = b.site_id
         group by a.site_id 
         
         having count(*) = (select count(*) from clientFilterGeometries)
         ),
         `);
  }

  sqlStatement.append(`
sites as (
  select 
        
   array_to_string(b.jurisdictions, ', ') as jurisdictions_flattened,
  b.site_id,
  b.site_paper_file_id,
  b.min_survey,
  b.all_species_on_site,
  b.max_survey,
  b.agencies,
  b.biological_agent,
  b.has_biological_treatments,
  b.has_chemical_treatments,
  b.has_mechanical_treatments,
  b.has_biological_dispersals,
  b.monitored,
  b.regional_district,
  b.regional_invasive_species_organization,
  b.invasive_plant_management_area,
  b.geojson
  
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
  }
  */

  sqlStatement.append(`
    from iapp_sites a
    join invasivesbc.iapp_site_summary_and_geojson b on a.site_id = b.site_id`);


  if (filterObject?.serverFilterGeometries?.length > 0) {
    sqlStatement.append(`
      inner join serverFilterGeometriesIntersectingAll c on a.site_id = c.site_id
      `);
  }

  if (filterObject?.clientFilterGeometries?.length > 0) {
    sqlStatement.append(`
      inner join clientFilterGeometriesIntersectingAll d on a.site_id = d.site_id
      `);
  }

  sqlStatement.append(`
    )  `);

  defaultLog.debug({ label: 'getIAPPBySearchFilterCriteria', message: 'sql', body: sqlStatement });

  return sqlStatement;
}

function selectStatement(sqlStatement: SQLStatement, filterObject: any) {
  if(filterObject.isCSV)
  {
    const select = sqlStatement.append(`select pe.* `);
    return select;
  }
  if (filterObject.selectColumns) {
    const select = sqlStatement.append(
      `select ${filterObject.selectColumns.map((column) => `sites.${column}`).join(',')} `
    );
    return select;
  } else {
    const select = sqlStatement.append(`select * `);
    return select;
  }
}

function fromStatement(sqlStatement: SQLStatement, filterObject: any) {
  const from = sqlStatement.append(`from sites `);
  if (filterObject.isCSV) {
    switch (filterObject.CSVType) {
      case 'site_selection_extract':
        sqlStatement.append(SQL` INNER JOIN site_selection_extract pe ON sites.site_id = pe.site_id `);
        break;
      case 'survey_extract':
        sqlStatement.append(SQL` INNER JOIN survey_extract pe ON sites.site_id = pe.site_id`);
        break;
      case 'chemical_treatment_extract':
        sqlStatement.append(SQL` INNER JOIN chemical_treatment_extract pe ON sites.site_id = pe.site_id`);
        break;
      case 'mechanical_treatment_extract':
        sqlStatement.append(SQL` INNER JOIN mechanical_treatment_extract pe ON sites.site_id = pe.site_id`);
        break;
      case 'chemical_monitoring_extract':
        sqlStatement.append(SQL` INNER JOIN chemical_monitoring_extract pe ON sites.site_id = pe.site_id`);
        break;
      case 'mechanical_monitoring_extract':
        sqlStatement.append(SQL` INNER JOIN mechanical_monitoring_extract pe ON sites.site_id = pe.site_id`);
        break;
      case 'biological_treatment_extract':
        sqlStatement.append(SQL` INNER JOIN biological_treatment_extract pe ON sites.site_id = pe.site_id`);
        break;
      case 'biological_monitoring_extract':
        sqlStatement.append(SQL` INNER JOIN biological_monitoring_extract pe ON sites.site_id = pe.site_id`);
        break;
      case 'biological_dispersal_extract':
        sqlStatement.append(SQL` INNER JOIN biological_dispersal_extract pe ON sites.site_id = pe.site_id`);
        break;
      default:
        sqlStatement.append(SQL` INNER JOIN site_selection_extract pe ON sites.site_id = pe.site_id `);
        break;
    }}
  return from;
}

function whereStatement(sqlStatement: SQLStatement, filterObject: any) {
  const where = sqlStatement.append(`where 1=1 `);
  if (filterObject.serverSideNamedFilters.hideTreatmentsAndMonitoring) {
    //TODO do i need to hide any    where.append(`and iapp_sites.activity_type not in ('Treatment','Monitoring') `);
  }

  filterObject.clientReqTableFilters.forEach((filter) => {
    switch (filter.field) {
      case 'site_id':
        where.append(
          `and LOWER((sites.site_id::text)) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'} LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'site_paper_file_id':
        where.append(
          `and LOWER(sites.site_paper_file_id) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'jurisdictions_flattened':
        where.append(
          `and LOWER(sites.jurisdictions_flattened) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'min_survey':
        where.append(
          `and LOWER(sites.min_survey) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%' `
        );
        break;
      case 'all_species_on_site':
        where.append(
          `and LOWER(sites.all_species_on_site) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'max_survey':
        where.append(
          `and LOWER(sites.max_survey) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'agencies':
        where.append(
          `and LOWER(sites.agencies) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'biological_agent':
        where.append(
          `and LOWER(sites.biological_agent) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'has_biological_treatments':
        where.append(
          ` and LOWER(sites.has_biological_treatments) ${filter.operator === 'CONTAINS' ? 'is not' : 'is'} null `
        );
        break;
      case 'has_chemical_treatments':
        where.append(`and sites.has_chemical_treatments  ${filter.operator === 'CONTAINS' ? 'is not' : 'is'} null `);
        break;
      case 'has_mechanical_treatments':
        where.append(
          `and sites.has_mechanical_treatments ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  '%${
            filter.filter
          }%' `
        );
        break;
      case 'has_biological_dispersals':
        where.append(
          `and sites.has_biological_dispersals  ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  '%${
            filter.filter
          }%' `
        );
        break;
      case 'monitored':
        where.append(
          `and sites.monitored ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  '%${filter.filter}%' `
        );
        break;
      case 'regional_district':
        where.append(
          `and LOWER(sites.regional_district) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'regional_invasive_species_organization':
        where.append(
          `and LOWER(sites.regional_invasive_species_organization) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'invasive_plant_management_area':
        where.append(
          `and LOWER(sites.invasive_plant_management_area) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
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
