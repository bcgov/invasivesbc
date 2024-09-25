import SQL, { SQLStatement } from 'sql-template-strings';
import { escapeLiteral } from 'pg';
import { validActivitySortColumns } from 'sharedAPI/src/misc/sortColumns';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('activities-v2-queries');

function sanitizeActivityFilterObject(filterObject: any, req: any) {
  const sanitizedSearchCriteria = {
    serverSideNamedFilters: {},
    selectColumns: [],
    clientReqTableFilters: [],
    ids_to_filter: []
  } as any;

  defaultLog.debug({
    label: 'sanitizeActivityFilterObject',
    message: 'sql',
    body: JSON.stringify(filterObject, null, 2)
  });
  if (req.params.x) {
    sanitizedSearchCriteria.vt_request = true;
    sanitizedSearchCriteria.x = req.params.x;
    sanitizedSearchCriteria.y = req.params.y;
    sanitizedSearchCriteria.z = req.params.z;
  }

  const roleName = (req as any).authContext.roles[0]?.role_name;
  //const sanitizedSearchCriteria = new ActivitySearchCriteria(criteria);
  // sanitizedSearchCriteria.created_by = [req.authContext.user['preferred_username']];
  const isAuth = req.authContext?.user !== null ? true : false;
  const user_role = (req as any).authContext?.roles?.[0]?.role_id;
  if (user_role) {
    const user_roles = Array.from({ length: user_role }, (_, i) => i + 1);
    sanitizedSearchCriteria.user_roles = user_roles;
  }

  const ROLES_THAT_SHOULD_SEE_ALL_DRAFT_ACTIVITIES = [
    /*
    Expected behaviour for now is nobody sees anyone else's drafts, but if the requirement flip flops we can use this:
    'administrator_plants',
    'administrator_animals',
    'master_administrator'*/
  ];

  // see if the user has ANY of those roles above (does not need to be the first/primary role)
  let intersectingRoles = [];
  if (req.authContext.roles) {
    intersectingRoles = ROLES_THAT_SHOULD_SEE_ALL_DRAFT_ACTIVITIES.filter((v) =>
      (req as any).authContext.roles.find((z) => z['role_name'] == v)
    );
  }

  if (intersectingRoles.length > 0) {
    sanitizedSearchCriteria.restrictVisibleDraftActivities = false;
  } else {
    sanitizedSearchCriteria.restrictVisibleDraftActivities = true;
  }

  if (!isAuth || !roleName || roleName.includes('animal')) {
    sanitizedSearchCriteria.serverSideNamedFilters.hideTreatmentsAndMonitoring = true;
  } else {
    sanitizedSearchCriteria.serverSideNamedFilters.hideTreatmentsAndMonitoring = false;
  }
  if (
    !isAuth ||
    !roleName ||
    !(roleName.includes('mussel_inspection_officer') || roleName.includes('master_administrator'))
  ) {
    sanitizedSearchCriteria.serverSideNamedFilters.hideMusselsInspections = true;
  } else {
    sanitizedSearchCriteria.serverSideNamedFilters.hideMusselsInspections = false;
  }
  if (!isAuth) {
    sanitizedSearchCriteria.serverSideNamedFilters.hideEditedByFields = true;
  } else {
    sanitizedSearchCriteria.serverSideNamedFilters.hideEditedByFields = false;
  }
  if (
    !isAuth ||
    !roleName ||
    !req.authContext?.roles.some((role: Record<string, any>) =>
      ['biocontrol_user', 'master_administrator'].includes(role.role_name)
    )
  ) {
    sanitizedSearchCriteria.serverSideNamedFilters.hideBiocontrolReleases = true;
  }
  sanitizedSearchCriteria.preferredUsername = req.authContext?.user?.preferred_username;

  let id_list_valid = true;
  try {
    for (let i = 0; i < filterObject?.ids_to_filter?.length - 1; i++) {
      if (typeof filterObject?.ids_to_filter[i] !== 'string' || filterObject.ids_to_filter[i].length !== 36) {
        id_list_valid = false;
        break;
      }
    }
  } catch (e) {
    defaultLog.debug({ label: 'id_list_valid', message: 'error', body: e });
    id_list_valid = false;
  }

  if (id_list_valid && filterObject?.ids_to_filter?.length > 0) {
    sanitizedSearchCriteria.ids_to_filter = filterObject.ids_to_filter;
  } else if (filterObject?.ids_to_filter?.length > 0 && !id_list_valid) {
    throw new Error('Invalid id list');
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

    if (filterObject.selectColumns.includes('count')) {
      selectColumns = ['count(*) as count'];
    }
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

  const sanitizedTableFilters = [];
  //sanitize serverFilterGeometries
  const serverFilterGeometries = [];

  //sanitize clientFilterGeometries
  const clientFilterGeometries = [];

  if (filterObject?.tableFilters?.length > 0) {
    filterObject.tableFilters.forEach((filter) => {
      if (filter.filter === '') return;
      switch (filter.filterType) {
        case 'tableFilter':
          switch (filter.field) {
            case 'form_status':
              if (filter.filter === 'Draft') {
                // create a new filter for created by using current user id:
                sanitizedTableFilters.push({
                  field: 'created_by',
                  operator2: 'and',
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

  const validOrderByColumns = validActivitySortColumns;

  if (
    !filterObject?.vt_request &&
    filterObject.selectColumns.length > 1 &&
    filterObject?.sortColumn &&
    filterObject?.sortOrder &&
    validOrderByColumns.includes(filterObject.sortColumn)
  ) {
    sanitizedSearchCriteria.orderBy = filterObject.sortColumn;
    sanitizedSearchCriteria.orderByType = filterObject.sortOrder;
  }

  sanitizedSearchCriteria.serverFilterGeometries = serverFilterGeometries;
  sanitizedSearchCriteria.clientFilterGeometries = clientFilterGeometries;
  sanitizedSearchCriteria.clientReqTableFilters = sanitizedTableFilters;
  //todo actually validate:
  sanitizedSearchCriteria.isCSV = filterObject?.isCSV;
  sanitizedSearchCriteria.CSVType = filterObject?.CSVType;

  // may be explicitly set to true by calling function
  sanitizedSearchCriteria.boundingBoxOnly = false;

  defaultLog.debug({
    label: 'getActivitiesBySearchFilterCriteria',
    message: 'sanitizedObject',
    body: JSON.stringify(sanitizedSearchCriteria, null, 2)
  });

  return sanitizedSearchCriteria;
}

function getActivitiesSQLv2(filterObject: any) {
  defaultLog.debug({
    label: 'getActivitiesBySearchFilterCriteria',
    message: 'sql',
    body: JSON.stringify(filterObject, null, 2)
  });
  try {
    let sqlStatement: SQLStatement = SQL``;
    sqlStatement = initialWithStatement(sqlStatement);
    sqlStatement = additionalCTEStatements(sqlStatement, filterObject);
    sqlStatement = selectStatement(sqlStatement, filterObject);
    sqlStatement = fromStatement(sqlStatement, filterObject);
    sqlStatement = whereStatement(sqlStatement, filterObject);
    sqlStatement = groupByStatement(sqlStatement, filterObject);
    if (filterObject.vt_request) {
      sqlStatement.append(` ) SELECT ST_AsMVT(mvtgeom.*, 'data', 4096, 'geom', 'feature_id') as data from mvtgeom;`);
    } else if (filterObject.boundingBoxOnly) {
      sqlStatement.append(`) SELECT ST_AsText(ST_Extent(geometry(geog))) as bbox;`);
    } else {
      sqlStatement = orderByStatement(sqlStatement, filterObject);
      sqlStatement = limitStatement(sqlStatement, filterObject);
      sqlStatement = offSetStatement(sqlStatement, filterObject);
    }

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
  //  const cte = sqlStatement.append(`  with placeHolder as (select 1),  `);
  const cte = sqlStatement.append(`  with CurrentPositiveObservations AS (SELECT cpo.activity_incoming_data_id,
                                                                                 string_agg(cpo.invasive_plant, ', ') AS current_positive_species
                                                                          FROM invasivesbc.current_positive_observations_materialized cpo
                                                                          GROUP BY cpo.activity_incoming_data_id),
                                          CurrentNegativeObservations AS (SELECT cno.activity_incoming_data_id,
                                                                                 string_agg(cno.invasive_plant, ', ') AS current_negative_species
                                                                          FROM invasivesbc.current_negative_observations_materialized cno
                                                                          GROUP BY cno.activity_incoming_data_id),
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

  /*
  sqlStatement.append(`
activities as (
    select a.*, current_positive_observations_aggregated_invasive_plant.current_positive_species, current_negative_observations_aggregated_invasive_plant.current_negative_species,
    case when current_positive_observations_aggregated_invasive_plant.current_positive_species is null then false else true end as has_current_positive,
    case when current_negative_observations_aggregated_invasive_plant.current_negative_species is null then false else true end as has_current_negative,
    activity_date_for_filters.activity_date_for_filter as activity_date,
    project_code_for_filters.project_code_for_filter as project_code
    `);
    */
  sqlStatement.append(`
  activities as (
  select a.*, CurrentPositiveObservations.current_positive_species, CurrentNegativeObservations.current_negative_species,
  case when CurrentPositiveObservations.current_positive_species is null then false else true end as has_current_positive,
  case when CurrentNegativeObservations.current_negative_species is null then false else true end as has_current_negative,
    activity_date_for_filters.activity_date_for_filter as activity_date,
    project_code_for_filters.project_code_for_filter as project_code
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

  /*sqlStatement.append(`
    from activity_incoming_data a
    left join current_negative_observations_aggregated_invasive_plant on current_negative_observations_aggregated_invasive_plant.activity_incoming_data_id = a.activity_incoming_data_id
    left join current_positive_observations_aggregated_invasive_plant on current_positive_observations_aggregated_invasive_plant.activity_incoming_data_id = a.activity_incoming_data_id
    left join activity_date_for_filters on activity_date_for_filters.activity_incoming_data_id = a.activity_incoming_data_id
    left join project_code_for_filters on project_code_for_filters.activity_incoming_data_id = a.activity_incoming_data_id
    `);
    */
  sqlStatement.append(`
    from activity_incoming_data a
    left join CurrentPositiveObservations on CurrentPositiveObservations.activity_incoming_data_id = a.activity_incoming_data_id
    left join CurrentNegativeObservations on CurrentNegativeObservations.activity_incoming_data_id = a.activity_incoming_data_id
    left join activity_date_for_filters on activity_date_for_filters.activity_incoming_data_id = a.activity_incoming_data_id
    left join project_code_for_filters on project_code_for_filters.activity_incoming_data_id = a.activity_incoming_data_id
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
  if (filterObject.vt_request) {
    sqlStatement.append(`
    , mvtgeom AS
    (  select case when ${filterObject.z} < 15 then ST_AsMVTGeom(ST_Transform(centroid, 3857),
                                            ST_TileEnvelope(${filterObject.z}, ${filterObject.x}, ${filterObject.y}), extent => 4096,
                                            buffer => 64)
              else ST_AsMVTGeom(ST_Transform(geog::geometry, 3857),
                                            ST_TileEnvelope(${filterObject.z}, ${filterObject.x}, ${filterObject.y}), extent => 4096,
                                            buffer => 64)
                                            end AS geom,
                               activity_incoming_data_id                    as feature_id,
                               activity_id                    ,
                               short_id,
                               map_symbol,
                               activity_type as type,
                               activity_subtype from activities  where ST_Transform(geog::geometry, 3857) && ST_TileEnvelope(${filterObject.z}, ${filterObject.x}, ${filterObject.y})
     `);
  } else {
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
  return sqlStatement;
}

function fromStatement(sqlStatement: SQLStatement, filterObject: any) {
  let from = filterObject.vt_request ? sqlStatement.append(' ') : sqlStatement.append(`from activities  `);
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
  const tableAlias = filterObject.isCSV ? 'b' : 'activities';
  const where = filterObject.vt_request
    ? sqlStatement.append(`and 1=1 and (${tableAlias}.iscurrent = true  `)
    : sqlStatement.append(`where 1=1 and (${tableAlias}.iscurrent = true  `);

  if (filterObject.serverSideNamedFilters.hideTreatmentsAndMonitoring) {
    where.append(`and ${tableAlias}.activity_type not in ('Treatment','Monitoring') `);
  }

  if (filterObject.serverSideNamedFilters.hideTreatmentsAndMonitoring) {
    where.append(`and ${tableAlias}.activity_type not in ('Treatment','Monitoring') `);
  }
  if (filterObject.serverSideNamedFilters.hideMusselsInspections) {
    where.append(
      `and ${tableAlias}.activity_subtype not in ('Activity_Observation_Mussels', 'Activity_Officer_Shift')`
    );
  }

  // check if there is a filter for drafts:
  let isDraftFilter = false;
  filterObject.clientReqTableFilters.forEach((filter) => {
    if (filter.field === 'form_status' && filter.filter === 'Draft') {
      isDraftFilter = true;
    }
  });
  if (filterObject.preferredUsername && isDraftFilter) {
    where.append(
      `and (${tableAlias}.created_by=${escapeLiteral(
        filterObject.preferredUsername
      )} and ${tableAlias}.form_status <> 'Submitted') `
    );
  } else {
    where.append(` and ( ${tableAlias}.form_status = 'Submitted') `);
  }

  where.append(`) and ( 1 = 1 `);

  filterObject.clientReqTableFilters.forEach((filter) => {
    switch (filter.field) {
      /*case 'form_status':
        where.append(`AND LOWER(${tableAlias}.form_status) = LOWER('${filter.filter}') `);
        break;*/
      case 'activity_id':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.activity_id) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          } LOWER('%${filter.filter}%') `
        );
        break;
      case 'short_id':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.short_id) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'activity_type':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.activity_type) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'activity_subtype':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.activity_subtype) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'activity_date':
        where.append(
          //`and substring((${tableAlias}.activity_payload::json->'form_data'->'activity_data'->'activity_date_time'::text)::text, 2, 10) ${
          `${filter.operator2} activity_date ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  '%${
            filter.filter
          }%' `
        );
        break;
      case 'project_code':
        where.append(
          //`and LOWER((${tableAlias}.activity_payload::json->'form_data'->'activity_data'->'project_code'::text)::text) ${
          `${filter.operator2} LOWER(${tableAlias}.project_code) ${filter.operator === 'CONTAINS' ? 'like' : 'not like'}  LOWER('%${
            filter.filter
          }%') `
        );
        break;
      case 'jurisdiction_display':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.jurisdiction_display) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'invasive_plant':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.invasive_plant) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'species_positive_full':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.species_positive_full) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'species_negative_full':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.species_negative_full) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'has_current_positive':
        where.append(
          `${filter.operator2} ${tableAlias}.current_positive_species ${
            filter.operator === 'CONTAINS' ? 'is not' : 'is'
          } null `
        );
        break;
      case 'has_current_negative':
        where.append(
          `${filter.operator2} ${tableAlias}.current_negative_species  ${
            filter.operator === 'CONTAINS' ? 'is not' : 'is'
          } null `
        );
        break;
      case 'current_positive_species':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.current_positive_species) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'current_negative_species':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.current_negative_species)  ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'species_treated_full':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.species_treated_full) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'species_biocontrol_full':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.species_biocontrol_full) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'created_by':
        if (filter.operator === 'CONTAINS') {
          where.append(
            `${filter.operator2} LOWER(${tableAlias}.created_by) ${
              filter.operator === 'CONTAINS' ? 'like' : 'not like'
            }  LOWER('%${filter.filter}%') `
          );
        } else if (filter.operator === 'EQUALS') {
          where.append(`${filter.operator2} LOWER(${tableAlias}.created_by) = LOWER('${filter.filter}') `);
        }
        break;
      case 'updated_by':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.updated_by) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'agency':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.agency) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'regional_invasive_species_organization_areas':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.regional_invasive_species_organization_areas) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'regional_districts':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.regional_districts) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'invasive_plant_management_areas':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.invasive_plant_management_areas) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'biogeoclimatic_zones':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.biogeoclimatic_zones) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'elevation':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.elevation) ${
            filter.operator === 'CONTAINS' ? 'like' : 'not like'
          }  LOWER('%${filter.filter}%') `
        );
        break;
      case 'batch_id':
        where.append(
          `${filter.operator2} LOWER(${tableAlias}.batch_id::text) ${
            filter.operator === 'CONTAINS' ? '=' : '!='
          }  LOWER('${filter.filter}') `
        );
        break;
      default:
        break;
    }
  });
  where.append(` ) `);

  if (filterObject.ids_to_filter && filterObject.ids_to_filter.length > 0) {
    where.append(
      ` and ${tableAlias}.activity_id in (${filterObject.ids_to_filter.map((id) => "'" + id + "'").join(',')}) `
    );
  }
  if (filterObject.serverSideNamedFilters.hideBiocontrolReleases) {
    where.append(
      ` AND (
          ${tableAlias}.species_biocontrol_full is null
          OR
          ${tableAlias}.species_biocontrol_full not in (
            SELECT agent_code_description
            FROM invasivesbc.private_biocontrol_agents
            )
          ) `
    );
  }

  return where;
}

function groupByStatement(sqlStatement: SQLStatement, filterObject: any) {
  const groupBy = sqlStatement.append(``);
  return groupBy;
}

function orderByStatement(sqlStatement: SQLStatement, filterObject: any) {
  const orderBy = filterObject.orderBy
    ? sqlStatement.append(
        ` order by ${filterObject.orderBy} ${filterObject.orderByType}  NULLS ${
          filterObject.ordeByType === 'DESC' ? 'FIRST ' : 'LAST'
        } `
      )
    : sqlStatement.append(` `);
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

export { sanitizeActivityFilterObject, getActivitiesSQLv2 };
