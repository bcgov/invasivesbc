import { SQL, SQLStatement } from 'sql-template-strings';
import { InvasivesRequest } from 'utils/auth-utils';
import { getLogger } from '../utils/logger';
import { ActivityPostRequestBody, ActivitySearchCriteria } from './../models/activity';

/**
 * SQL query to insert a new activity, and return the inserted record.
 *
 * @param {ActivityPostRequestBody} activity
 * @returns {SQLStatement} sql query object
 */
export const postActivitySQL = (activity: ActivityPostRequestBody): SQLStatement => {
  if (!activity) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO activity_incoming_data (
      activity_id,
      activity_type,
      activity_subtype,
      created_timestamp,
      received_timestamp,
      created_by,
      updated_by,
      created_by_with_guid,
      updated_by_with_guid,
      sync_status,
      form_status,
      review_status,
      reviewed_by,
      reviewed_at,
      activity_payload,
      geog,
      media_keys,
      species_positive,
      species_negative,
      species_treated,
      jurisdiction
    ) VALUES (
      ${activity.activity_id},
      ${activity.activity_type},
      ${activity.activity_subtype},
      ${activity.created_timestamp},
      ${activity.received_timestamp},
      ${activity.created_by},
      ${activity.updated_by},
      ${activity.created_by_with_guid},
      ${activity.updated_by_with_guid},
      ${activity.sync_status},
      ${activity.form_status},
      ${activity.review_status},
      ${activity.reviewed_by},
      ${activity.reviewed_at},
      ${activity.activityPostBody}
  `;

  if (activity.geoJSONFeature && activity.geoJSONFeature.length) {
    // Note: this is only saving the `geometry` part of the feature, and not any assocaited `properties`.
    const geometry = JSON.stringify(activity.geoJSONFeature[0].geometry);

    sqlStatement.append(SQL`
      ,public.geography(
        public.ST_Force2D(
          public.ST_SetSRID(
            public.ST_GeomFromGeoJSON(${geometry}),
            4326
          )
        )
      )
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  if (activity.media_keys?.length) {
    sqlStatement.append(SQL`
      ,${activity.media_keys}
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  if (activity.species_positive?.length && activity.species_positive[0] !== null) {
    sqlStatement.append(SQL`
      ,replace(replace(${activity.species_positive}::text, '{', '['), '}', ']')::jsonb
    `);
  } else {
    sqlStatement.append(SQL`
      ,'null'
    `);
  }

  if (activity.species_negative?.length && activity.species_negative[0] !== null) {
    sqlStatement.append(SQL`
      ,replace(replace(${activity.species_negative}::text, '{', '['), '}', ']')::jsonb
    `);
  } else {
    sqlStatement.append(SQL`
      ,'null'
    `);
  }

  if (activity.species_treated?.length && activity.species_treated[0] !== null) {
    sqlStatement.append(SQL`
      ,replace(replace(${activity.species_treated}::text, '{', '['), '}', ']')::jsonb
    `);
  } else {
    sqlStatement.append(SQL`
      ,'null'
    `);
  }

  if (activity.jurisdiction?.length && activity.jurisdiction[0] !== null) {
    sqlStatement.append(SQL` ,ARRAY [${activity.jurisdiction[0]}`);
    for (let i = 1; i < activity.jurisdiction.length; i++) {
      sqlStatement.append(SQL`, ${activity.jurisdiction[i]}`);
    }
    sqlStatement.append(SQL`]`);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  sqlStatement.append(SQL`
    )
    RETURNING
      activity_id;
  `);
  return sqlStatement;
};

export interface IPutActivitySQL {
  createSQL: SQLStatement;
}

/**
 * SQL queries to update an existing activity record and mark it as `deleted` and to create a new activity record.
 *
 * @param {ActivityPostRequestBody} activity
 * @return {*}  {IPutActivitySQL} array of sql query objects
 */
export const putActivitySQL = (activity: ActivityPostRequestBody): IPutActivitySQL => {
  if (!activity) {
    return null;
  }

  // create new activity record
  const createSQLStatement: SQLStatement = postActivitySQL(activity);

  return { createSQL: createSQLStatement };
};

const defaultLog = getLogger('activity-queries');

/**
 * column names SQL SELECT string formatted and joined.
 *
 * @param {columnNames} string[]
 * @returns {string} SQL query string
 */
const getColumnNamesSQL = (columnNames: string[]): string => {
  const newColumnNames = columnNames.map((name) => 'a.' + name);
  defaultLog.info({message: 'columnNames POST Sanitize', columnNames, newColumnNames} );
  return ` ${newColumnNames.join(', ')}`;
};

/**
 * SQL query to fetch activity records based on search criteria.
 *
 * @param {ActivitySearchCriteria} searchCriteria
 * @param {lean} lean - if true, return a lean object
 * @returns {SQLStatement} sql query object
 */
//NOSONA
export const getActivitiesSQL = (
  searchCriteria: ActivitySearchCriteria,
  lean: boolean,
  isAuth: boolean = false
): SQLStatement => {
  const sqlStatement: SQLStatement = SQL``;

  if (searchCriteria.search_feature_server_id) {
    sqlStatement.append(
      SQL`WITH multi_polygon_cte AS (SELECT st_subdivide(geog::geometry, 255)::geography as geog from invasivesbc.admin_defined_shapes where id = ${searchCriteria.search_feature_server_id}) `
    );
  } else if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`WITH multi_polygon_cte AS (SELECT  st_subdivide(ST_Collect(ST_GeomFromGeoJSON(array_features->>'geometry')), 255)::geography as geog
    FROM (
      SELECT json_array_elements(${searchCriteria.search_feature}::json->'features') AS array_features
    ) AS anything) `);
  }

  if (searchCriteria.isCSV === false) {
    sqlStatement.append(SQL`SELECT`);

    let columnNames =
      searchCriteria.column_names && searchCriteria.column_names?.length > 0 ? searchCriteria.column_names : [];

    if (!isAuth && columnNames.length > 0) {
      //columns_names were requested for either activities full or lean
      // remove restricted column_names if NOT auth
      const blockedColumns = ['created_by', 'updated_by', 'reviewed_by'];
      let indexOf;
      for (const column of blockedColumns) {
        indexOf = columnNames?.indexOf(column);
        if (indexOf !== undefined) {
          columnNames.splice(indexOf, 1);
        }
      }
    }
    // Build lean object
    if (lean) {
      if (columnNames.length > 0) {
        // do we even allow columnNames request to lean???
        // do we remove payload or is it not included as lean???
        sqlStatement.append(getColumnNamesSQL(columnNames));
        // we need to remove data if lean is allowed to return activity payload
      } else {
        // column names are empty, use default output
        sqlStatement.append(SQL`
        jsonb_build_object (
          'type', 'Feature',
          'properties', json_build_object(
            'id', a.activity_id,
            'type', activity_type,
            'subtype', activity_subtype,
            'created', created_timestamp,
            'bec', biogeoclimatic_zones,
            'riso', regional_invasive_species_organization_areas,
            'ipma', invasive_plant_management_areas,
            'own', ownership,
            'regionalDist', regional_districts,
            'flnroDist', flnro_districts,
            'motiDist', moti_districts,
            'elev', elevation,
            'wellProx', well_proximity,
            'species_positive', species_positive,
            'species_negative', species_negative,
            'species_treated', species_treated,
            'jurisdiction', a.activity_payload::json->'form_data'->'activity_data'->'jurisdictions',
            'reported_area', a.activity_payload::json->'form_data'->'activity_data'->'reported_area',
            'short_id', a.activity_payload::json->'short_id'
            ),
            'geometry', public.st_asGeoJSON(geog)::jsonb
            ) as "geojson"
            `);
      }
    } else {
      if (searchCriteria.activity_id_only) {
        // empty column_names just in case they are loaded and will stop append later
        columnNames = [];
        sqlStatement.append(SQL` a.activity_id`);
      } else {
        if (columnNames?.length == 0) {
          if (isAuth) {
            // if no column_names specified, select all
            sqlStatement.append(SQL` *`);
          } else {
            // NO columnames and we are also NOT authenticated
            // set default sanitized column names, public list, allow list
            columnNames = [
              'activity_incoming_data_id',
              'activity_id',
              '"version"',
              'activity_type',
              'activity_subtype',
              'created_timestamp',
              'received_timestamp',
              'deleted_timestamp',
              'geom',
              'geog',
              'media_keys',
              'activity_payload',
              'biogeoclimatic_zones',
              'regional_invasive_species_organization_areas',
              'invasive_plant_management_areas',
              'ownership',
              'regional_districts',
              'flnro_districts',
              'moti_districts',
              'elevation',
              'well_proximity',
              'utm_zone',
              'utm_northing',
              'utm_easting',
              'albers_northing',
              'albers_easting',
              'form_status',
              'sync_status',
              'review_status',
              'reviewed_at',
              'species_positive',
              'species_negative',
              'jurisdiction',
              'species_treated',
              'species_positive_full',
              'species_negative_full',
              'species_treated_full',
              'agency',
              'jurisdiction_display',
              'short_id'
            ];
          }
          // sqlStatement.append(SQL` a.activity_incoming_data_id, a.activity_id, a."version", a.activity_type, a.activity_subtype, a.created_timestamp, a.received_timestamp, a.deleted_timestamp, a.geom, a.geog, a.media_keys, a.activity_payload, a.biogeoclimatic_zones, a.regional_invasive_species_organization_areas, a.invasive_plant_management_areas, a.ownership, a.regional_districts, a.flnro_districts, a.moti_districts, a.elevation, a.well_proximity, a.utm_zone, a.utm_northing, a.utm_easting, a.albers_northing, a.albers_easting, a.form_status, a.sync_status, a.review_status, a.reviewed_at, a.species_positive, a.species_negative, a.jurisdiction, a.species_treated, a.species_positive_full, a.species_negative_full, a.species_treated_full, a.agency, a.jurisdiction_display, a.short_id`);
        }
        if (columnNames.length > 0) {
          sqlStatement.append(getColumnNamesSQL(columnNames));
        }
      }

      // include current positive species
      sqlStatement.append(SQL`, EXISTS(SELECT 1 FROM current_positive_observations cpo WHERE cpo.activity_incoming_data_id = a.activity_incoming_data_id) AS has_current_positive, 
      (SELECT string_agg(invasive_plant, ', ') FROM current_positive_observations cpo WHERE cpo.activity_incoming_data_id = a.activity_incoming_data_id) AS current_positive_species`);

      // include current negative observations
      sqlStatement.append(SQL`, EXISTS(SELECT 1 FROM current_negative_observations cno WHERE cno.activity_incoming_data_id = a.activity_incoming_data_id) AS has_current_negative, 
      (SELECT string_agg(invasive_plant, ', ') FROM current_negative_observations cno WHERE cno.activity_incoming_data_id = a.activity_incoming_data_id) AS current_negative_species`);

      // include the total count of results that would be returned if the limit and offset constraints weren't applied
      sqlStatement.append(SQL`, COUNT(*) OVER() AS total_rows_count`);
    }
  } else {
    sqlStatement.append('SELECT extract.* ');
  }

  sqlStatement.append(
    SQL` FROM activity_incoming_data a inner join activity_current b on a.activity_incoming_data_id = b.incoming_data_id `
  );

  if (searchCriteria.search_feature || searchCriteria.search_feature_server_id) {
    sqlStatement.append(SQL`
      join multi_polygon_cte c on public.ST_INTERSECTS2(
        a.geog,
        c.geog
      )
    `);
  }

  if (searchCriteria.isCSV) {
    switch (searchCriteria.CSVType) {
      case 'terrestrial_plant_observation':
        sqlStatement.append(
          'join observation_terrestrial_plant_summary extract ON extract.activity_id = b.activity_id '
        );
      case 'aquatic_plant_observation':
        sqlStatement.append('join observation_aquatic_plant_summary extract ON extract.activity_id = b.activity_id ');
      default:
        sqlStatement.append(
          'join observation_terrestrial_plant_summary extract ON extract.activity_id = b.activity_id '
        );
    }
  }

  sqlStatement.append(SQL` where 1 = 1`);

  if (searchCriteria.activity_type && searchCriteria.activity_type.length) {
    sqlStatement.append(SQL` AND activity_type IN (`);

    // add the first activity type, which does not get a comma prefix
    sqlStatement.append(SQL`${searchCriteria.activity_type[0]}`);

    for (let idx = 1; idx < searchCriteria.activity_type.length; idx++) {
      // add all subsequent activity types, which do get a comma prefix
      sqlStatement.append(SQL`, ${searchCriteria.activity_type[idx]}`);
    }

    sqlStatement.append(SQL`)`);
  }

  if (searchCriteria.user_roles && searchCriteria.user_roles.length > 0) {
    // const roles = searchCriteria.user_roles.map((role: any) => parseInt(role.role_id));
    // sqlStatement.append(
    //   SQL` AND ${searchCriteria.user_roles} && ARRAY(select jsonb_array_elements_text(activity_payload->'user_role'))::int[]`
    // );
    sqlStatement.append(
      SQL` AND
      (
        SELECT max(x) AS max_role_id FROM (
          SELECT UNNEST (
            ARRAY (
              SELECT jsonb_array_elements_text(activity_payload->'user_role'))::int[]) AS x,
                activity_incoming_data_id
              FROM activity_incoming_data
          ) AS max_role
          WHERE a.activity_incoming_data_id = max_role.activity_incoming_data_id
          GROUP BY activity_incoming_data_id
        ) = ANY( ${searchCriteria.user_roles} )
      `
    );
  }

  // subtype and subtype full are a bit mismatched in places, this will search both:
  if (searchCriteria.activity_subtype && searchCriteria.activity_subtype.length) {
    sqlStatement.append(SQL` AND (activity_subtype_full IN (`);

    // add the first activity subtype, which does not get a comma prefix
    sqlStatement.append(SQL`${searchCriteria.activity_subtype[0]}`);

    for (let idx = 1; idx < searchCriteria.activity_subtype.length; idx++) {
      // add all subsequent activity subtypes, which do get a comma prefix
      sqlStatement.append(SQL`, ${searchCriteria.activity_subtype[idx]}`);
    }

    sqlStatement.append(SQL`) OR (activity_subtype in (`);
    // add the first activity subtype, which does not get a comma prefix
    sqlStatement.append(SQL`${searchCriteria.activity_subtype[0]}`);

    for (let idx = 1; idx < searchCriteria.activity_subtype.length; idx++) {
      // add all subsequent activity subtypes, which do get a comma prefix
      sqlStatement.append(SQL`, ${searchCriteria.activity_subtype[idx]}`);
    }
    sqlStatement.append(SQL`))) `);
  }

  if (searchCriteria.grid_filters) {
    const gridFilters = searchCriteria.grid_filters;
    //TBD if there's a legit reason to need this, client just shouldn't send if api doesn't need??
    //if (gridFilters.enabled) {
    if (true) {
      if (gridFilters.short_id) {
        sqlStatement.append(SQL` AND LOWER(a.activity_payload ->> 'short_id') LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.short_id})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.type) {
        sqlStatement.append(SQL` AND LOWER(a.activity_type)::text LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.type})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.subtype) {
        sqlStatement.append(SQL` AND LOWER(a.activity_subtype_full::text) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.subtype})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.received_timestamp) {
        sqlStatement.append(
          SQL` AND LOWER(to_char(a.received_timestamp at time zone 'UTC' at time zone 'America/Vancouver', 'Dy, Mon DD YYYY HH24:MI:SS')::text) LIKE '%'||`
        );
        sqlStatement.append(SQL`LOWER(${gridFilters.received_timestamp})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.jurisdiction) {
        sqlStatement.append(SQL` AND LOWER(a.jurisdiction_display) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.jurisdiction})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.species_positive) {
        sqlStatement.append(SQL` AND LOWER(a.species_positive_full) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.species_positive})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.project_code) {
        sqlStatement.append(SQL` AND  LOWER( (a.activity_payload::json->'form_data'->'activity_data'-> 'project_code'::text)::text ) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.project_code})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.species_negative) {
        sqlStatement.append(SQL` AND LOWER(a.species_negative_full) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.species_negative})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.species_treated) {
        sqlStatement.append(SQL` AND LOWER(a.species_treated_full) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.species_treated})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (isAuth && gridFilters.created_by) {
        sqlStatement.append(SQL` AND LOWER(a.created_by)::text LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.created_by})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (isAuth && gridFilters.updated_by) {
        sqlStatement.append(SQL` AND LOWER(a.updated_by)::text LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.updated_by})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.agency) {
        sqlStatement.append(SQL` AND LOWER(a.agency) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.agency})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.regional_invasive_species_organization_areas) {
        sqlStatement.append(SQL` AND LOWER(a.regional_invasive_species_organization_areas) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.regional_invasive_species_organization_areas})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.regional_districts) {
        sqlStatement.append(SQL` AND LOWER(a.regional_districts) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.regional_districts})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.biogeoclimatic_zones) {
        sqlStatement.append(SQL` AND LOWER(a.biogeoclimatic_zones) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.biogeoclimatic_zones})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.elevation) {
        sqlStatement.append(SQL` AND a.elevation::text LIKE '%'||`);
        sqlStatement.append(SQL`${gridFilters.elevation}`);
        sqlStatement.append(SQL`||'%'`);
      }
    }
  }

  if (isAuth && searchCriteria.created_by && searchCriteria.created_by.length) {
    sqlStatement.append(SQL` AND created_by IN (`);
    sqlStatement.append(SQL`${searchCriteria.created_by[0]}`);
    for (let idx = 1; idx < searchCriteria.created_by.length; idx++) {
      sqlStatement.append(SQL`, ${searchCriteria.created_by[idx]}`);
    }
    sqlStatement.append(SQL`)`);
  }

  if (searchCriteria.form_status && searchCriteria.form_status.length) {
    sqlStatement.append(SQL` AND form_status IN (`);
    sqlStatement.append(SQL`${searchCriteria.form_status[0]}`);
    for (let idx = 1; idx < searchCriteria.form_status.length; idx++) {
      sqlStatement.append(SQL`, ${searchCriteria.form_status[idx]}`);
    }
    sqlStatement.append(SQL`)`);
  }

  if (searchCriteria.linked_id) {
    sqlStatement.append(
      SQL` AND activity_payload::json #>> '{form_data, activity_type_data, linked_id}' = ${searchCriteria.linked_id}`
    );
  }

  if (searchCriteria.date_range_start) {
    sqlStatement.append(SQL` AND received_timestamp >= ${searchCriteria.date_range_start}::DATE`);
  }

  if (searchCriteria.date_range_end) {
    sqlStatement.append(SQL` AND received_timestamp <= ${searchCriteria.date_range_end}::DATE`);
  }

  if (searchCriteria.activity_ids && searchCriteria.activity_ids.length) {
    sqlStatement.append(SQL` AND a.activity_id IN (`);
    sqlStatement.append(SQL`${searchCriteria.activity_ids[0]}`);
    for (let idx = 1; idx < searchCriteria.activity_ids.length; idx++) {
      sqlStatement.append(SQL`, ${searchCriteria.activity_ids[idx]}`);
    }
    sqlStatement.append(SQL`)`);
  }

  // search intersects with some species codes
  if (searchCriteria.species_positive && searchCriteria.species_positive.length) {
    sqlStatement.append(SQL` AND ARRAY[`);
    sqlStatement.append(SQL`${searchCriteria.species_positive[0]}`);
    for (let idx = 1; idx < searchCriteria.species_positive.length; idx++)
      sqlStatement.append(SQL`, ${searchCriteria.species_positive[idx]}`);
    sqlStatement.append(SQL`]::varchar[] && jsonb_array_to_text_array(species_positive)::varchar[]`);
  }

  // search intersects with some species codes
  if (searchCriteria.species_negative && searchCriteria.species_negative.length) {
    sqlStatement.append(SQL` AND ARRAY[`);
    sqlStatement.append(SQL`${searchCriteria.species_negative[0]}`);
    for (let idx = 1; idx < searchCriteria.species_negative.length; idx++)
      sqlStatement.append(SQL`, ${searchCriteria.species_negative[idx]}`);
    sqlStatement.append(SQL`]::varchar[] && jsonb_array_to_text_array(species_negative)::varchar[]`);
  }

  // search intersects with jurisdiction codes
  if (searchCriteria.jurisdiction && searchCriteria.jurisdiction.length) {
    sqlStatement.append(SQL` AND ARRAY[`);
    sqlStatement.append(SQL`${searchCriteria.jurisdiction[0]}`);
    for (let idx = 1; idx < searchCriteria.jurisdiction.length; idx++)
      sqlStatement.append(SQL`, ${searchCriteria.jurisdiction[idx]}`);
    sqlStatement.append(SQL`]::varchar[] && a.jurisdiction`);
  }

  if (searchCriteria.hideTreatmentsAndMonitoring) {
    sqlStatement.append(SQL` AND activity_type NOT IN ('Monitoring', 'Treatment', 'Biocontrol')`);
  }

  if (searchCriteria.order && searchCriteria.order?.length > 0) {
    const columnMap = {
      short_id: 'short_id', //needs a migration because of the payload stuff
      type: 'activity_type',
      subtype: 'activity_subtype_full', //also in payload stuff (activity_type is too but different) ((with subtype update, activity_subtype is also different now))
      received_timestamp: 'received_timestamp',
      jurisdiction: 'jurisdiction_display',
      species_positive: 'species_positive_full',
      species_negative: 'species_negative_full',
      species_treated: 'species_treated_full',
      created_by: 'created_by',
      updated_by: 'updated_by',
      agency: 'agency',
      regional_invasive_species_organization_areas: 'regional_invasive_species_organization_areas',
      regional_districts: 'regional_districts',
      biogeoclimatic_zones: 'biogeoclimatic_zones',
      elevation: 'elevation'
    };
    const order = searchCriteria.order.map((column) => {
      return `${columnMap[column['columnKey']]} ${column['direction']}`;
    });
    sqlStatement.append(` ORDER BY ${order.join(', ')}`);
    //THIS PART OF THE QUERY IS NOT ESCAPED!!! This was due to incompatibility with ORDER BY and SQL``
  }

  if (searchCriteria.limit) {
    sqlStatement.append(SQL` LIMIT ${searchCriteria.limit}`);
  }

  if (searchCriteria.page && searchCriteria.limit) {
    sqlStatement.append(SQL` OFFSET ${searchCriteria.page * searchCriteria.limit}`);
  }

  sqlStatement.append(SQL`;`);
  const defaultLog = getLogger('activities');
  defaultLog.info({
    label: 'activities',
    message: 'sql',
    body: sqlStatement.sql
  });
  defaultLog.info({
    label: 'activities',
    message: 'values',
    body: sqlStatement.values
  });
  defaultLog.info({
    label: 'activities',
    message: 'text',
    body: sqlStatement.text
  });
  defaultLog.info({
    label: 'activities',
    message: 'jsonstr',
    body: JSON.stringify(sqlStatement)
  });

  return sqlStatement;
};

/**
 * SQL query to fetch a single activity record based on its `activity_id` and `deleted_timestamp` fields.
 *
 * Note: An activity record with a non-null `deleted_timestamp` indicates it has either been deleted or is an out-dated
 * version.  The latest version should have a null `deleted_timestamp`.
 *
 * @param {string} activityId
 * @returns {SQLStatement} sql query object
 */
export const getActivitySQL = (activityId: string): SQLStatement => {
  return SQL`
    SELECT a.* FROM activity_incoming_data a
    join activity_current b on a.activity_incoming_data_id = b.incoming_data_id
    WHERE a.activity_id = ${activityId}
  `;
};

/**
 * SQL query to fetch a grid cells that overlap with given geometry from either large grid or small grid;
 *
 * @param {string} geometry
 * @param {string} largeGrid
 * @returns {SQLStatement} sql query object
 */
export const getOverlappingBCGridCellsSQL = (
  geometry: string,
  isGridLarge: string,
  grid_item_ids: number[]
): SQLStatement => {
  switch (isGridLarge) {
    case '1':
      return SQL`
        SELECT id, public.st_asGeoJSON(geo) as geo
            FROM invasivesbc.bc_large_grid
            WHERE public.ST_INTERSECTS(
              geo,
              public.geography(
                public.ST_Force2D(
                  public.ST_SetSRID(
                    public.ST_GeomFromGeoJSON(${geometry}),
                    4326
                  )
                )
              )
            );
      `;
      break;
    case '0':
      if (grid_item_ids.length < 1) {
        throw 'Error: looking for small grid items but the large grid item id array wasn\'t provided';
      } else {
        return SQL`
        SELECT id, public.st_asGeoJSON(geo) as geo, large_grid_item_id
            FROM invasivesbc.bc_small_grid
            WHERE large_grid_item_id = ANY (${grid_item_ids}) AND public.ST_INTERSECTS(
              geo,
              public.geography(
                public.ST_Force2D(
                  public.ST_SetSRID(
                    public.ST_GeomFromGeoJSON(${geometry}),
                    4326
                  )
                )
              )
            );
        `;
      }
      break;
  }
};
/**
 * SQL queries to soft-delete activity records, marking them as `deleted`.
 *
 * @param {string} activityIds
 * @return {SQLStatement} sql query object
 */
export const deleteActivitiesSQL = (activityIds: Array<string>): SQLStatement => {
  if (!activityIds.length) {
    return null;
  }

  // update existing activity record
  const sqlStatement: SQLStatement = SQL`
    UPDATE activity_incoming_data
    SET deleted_timestamp = ${new Date().toISOString()}
    WHERE activity_id IN (${activityIds[0]}`;

  for (let i = 1; i < activityIds.length; i++) {
    sqlStatement.append(SQL`, ${activityIds[i]}`);
  }

  sqlStatement.append(SQL`)
    AND deleted_timestamp IS NULL;
  `);

  return sqlStatement;
};

/**
 * SQL query to un-delete activity records.
 *
 * @param {string} activityIds
 * @return {SQLStatement} sql query object
 */
export const undeleteActivitiesSQL = (activityIds: Array<string>): SQLStatement => {
  if (!activityIds.length) {
    return null;
  }

  // undelete the latest record of the given id
  const sqlStatement: SQLStatement = SQL`
    UPDATE activity_incoming_data
    SET deleted_timestamp = NULL
    WHERE
    activity_id in (${activityIds[0]}`;

  for (let i = 1; i < activityIds.length; i++) {
    sqlStatement.append(SQL`, ${activityIds[i]}`);
  }

  // this eliminates all older activity dates:
  sqlStatement.append(SQL`)
    AND activity_incoming_data_id IN
    (
      SELECT a1.activity_incoming_data_id
      FROM activity_incoming_data a1
      LEFT OUTER JOIN activity_incoming_data AS newer_matches
      ON a1.activity_id = newer_matches.activity_id
      AND a1.deleted_timestamp < newer_matches.deleted_timestamp
      WHERE a1.deleted_timestamp IS NOT NULL
      AND newer_matches.activity_id IS NULL
    );
  `);

  return sqlStatement;
};
