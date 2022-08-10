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

  if (activity.mediaKeys) {
    sqlStatement.append(SQL`
      ${activity.mediaKeys},
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  if (activity.species_positive?.length) {
    sqlStatement.append(SQL`
      ,replace(replace(${activity.species_positive}::text, '{', '['), '}', ']')::jsonb
    `);
  } else {
    sqlStatement.append(SQL`
      ,'null'
    `);
  }

  if (activity.species_negative?.length) {
    sqlStatement.append(SQL`
      ,replace(replace(${activity.species_negative}::text, '{', '['), '}', ']')::jsonb
    `);
  } else {
    sqlStatement.append(SQL`
      ,'null'
    `);
  }

  if (activity.species_treated?.length) {
    sqlStatement.append(SQL`
      ,replace(replace(${activity.species_treated}::text, '{', '['), '}', ']')::jsonb
    `);
  } else {
    sqlStatement.append(SQL`
      ,'null'
    `);
  }

  // if (activity.jurisdiction?.length) {
  //   sqlStatement.append(SQL`
  //     ,replace(replace(${activity.jurisdiction}::text, '{', '['), '}', ']')::jsonb
  //   `);
  // } else {
  sqlStatement.append(SQL`
      ,null
    `);
  // }

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

/**
 * SQL query to fetch activity records based on search criteria.
 *
 * @param {ActivitySearchCriteria} searchCriteria
 * @param {lean} lean - if true, return a lean object
 * @returns {SQLStatement} sql query object
 */
//NOSONAR
export const getActivitiesSQL = (searchCriteria: ActivitySearchCriteria, lean: boolean): SQLStatement => {
  const sqlStatement: SQLStatement = SQL``;

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`WITH multi_polygon_cte AS (SELECT (ST_Collect(ST_GeomFromGeoJSON(array_features->>'geometry')))::geography as geog
    FROM (
      SELECT json_array_elements(${searchCriteria.search_feature}::json->'features') AS array_features
    ) AS anything) `);
  }

  sqlStatement.append(SQL`SELECT`);
    
  // Build lean object
  if (lean) {
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
  } else {

    if (searchCriteria.column_names && searchCriteria.column_names.length) {
      // do not include the `SQL` template string prefix, as column names can not be parameterized
      const newColumnNames = searchCriteria.column_names.map((name) => {
        return 'a.' + name;
      });
      sqlStatement.append(` ${newColumnNames.join(', ')}`);
    } else {
      if (searchCriteria.column_names && searchCriteria.column_names.length) {
        // do not include the `SQL` template string prefix, as column names can not be parameterized
        const newColumnNames = searchCriteria.column_names.map((name) => {
          return 'a.' + name;
        });
        sqlStatement.append(` ${newColumnNames.join(', ')}`);
      } else {
        // if no column_names specified, select all
        sqlStatement.append(SQL` *`);
      }
    }

    // include the total count of results that would be returned if the limit and offset constraints weren't applied
    sqlStatement.append(SQL`, COUNT(*) OVER() AS total_rows_count`);

  }

  sqlStatement.append(
    SQL` FROM activity_incoming_data a inner join activity_current b on a.activity_incoming_data_id = b.incoming_data_id WHERE 1 = 1`
  );

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
    const roles = searchCriteria.user_roles.map((role: any) => parseInt(role.role_id));
    sqlStatement.append(
      SQL` AND ${roles} @> ARRAY(select array_agg(x)::int[] || array[]::int[] from jsonb_array_elements_text(activity_payload->'user_role') t(x))`
    );
  }

  if (searchCriteria.activity_subtype && searchCriteria.activity_subtype.length) {
    sqlStatement.append(SQL` AND activity_subtype IN (`);

    // add the first activity subtype, which does not get a comma prefix
    sqlStatement.append(SQL`${searchCriteria.activity_subtype[0]}`);

    for (let idx = 1; idx < searchCriteria.activity_subtype.length; idx++) {
      // add all subsequent activity subtypes, which do get a comma prefix
      sqlStatement.append(SQL`, ${searchCriteria.activity_subtype[idx]}`);
    }

    sqlStatement.append(SQL`)`);
  }
  console.log('$$$$ BEFORE IF GRID FILTERS STATEMENT, ', searchCriteria);
  if (searchCriteria.grid_filters) {
    console.log('$$$$ GRID FILTERS $$$$');
    console.log(searchCriteria.grid_filters);
    const gridFilters = searchCriteria.grid_filters;
    if (gridFilters.enabled) {
      if (gridFilters.short_id) {
        // DONE (Sammy) + confirmed + case ins
        sqlStatement.append(SQL` AND LOWER(a.activity_payload ->> 'short_id') LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.short_id})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.type) {
        // DONE (Sammy) + confirmed + case ins
        sqlStatement.append(SQL` AND LOWER(a.activity_type)::text LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.type})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.subtype) {
        // DONE (Sammy) + confirmed + case ins
        sqlStatement.append(SQL` AND LOWER(a.activity_subtype::text) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.subtype})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.received_timestamp) {
        // DONE
        console.log('\n[RECEIVED TIMESTAMP]: ', gridFilters.received_timestamp, '\n');
        sqlStatement.append(SQL` AND LOWER(to_char(a.received_timestamp at time zone 'UTC' at time zone 'America/Vancouver', 'Dy, Mon DD YYYY HH24:MI:SS')::text) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.received_timestamp})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.jurisdiction) {
        // Note: "Jurisdiction" property of activity_payload is not the source of truth for jurisdiction.
        // See: activity_payload.form_data.activity_data.jurisdictions for the source of truth.
        // @@@@@@@@@!!    needs a restructure to include it within the activity incoming data   @@@@@@
        console.log('\n[JURISDICTION]: ', gridFilters.jurisdiction, '\n');
      }
      if (gridFilters.species_positive) {
        // DONE
        console.log('\n[SPECIES POSITIVE]: ', gridFilters.species_positive, '\n');
        sqlStatement.append(SQL` AND LOWER(a.species_positive_full) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.species_positive})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.species_negative) {
        // DONE
        console.log('\n[SPECIES NEGATIVE]: ', gridFilters.species_negative, '\n');
        sqlStatement.append(SQL` AND LOWER(a.species_negative_full) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.species_negative})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.species_treated) {
        // DONE
        console.log('\n[SPECIES TREATED]: ', gridFilters.species_treated, '\n');
        sqlStatement.append(SQL` AND LOWER(a.species_treated_full) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.species_treated})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.created_by) {
        // DONE (Sammy) + confirmed + case ins
        sqlStatement.append(SQL` AND LOWER(a.created_by)::text LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.created_by})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.updated_by) {
        // DONE + confirmed + case ins
        sqlStatement.append(SQL` AND LOWER(a.updated_by)::text LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.updated_by})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.agency) {
        // DONE (Sammy) + confirmed
        console.log('\n[INVASIVE SPECIES AGENCY CODE]: ', gridFilters.agency, '\n');
        sqlStatement.append(
          SQL` AND LOWER(a.activity_payload::jsonb->'form_data'->'activity_data'->>'invasive_species_agency_code') LIKE '%'||`
        );
        sqlStatement.append(SQL`LOWER(${gridFilters.agency})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.regional_invasive_species_organization_areas) {
        // DONE
        console.log(
          '\n[REGIONAL INVASIVE SPECIES ORGANIZATION AREAS]: ',
          gridFilters.regional_invasive_species_organization_areas,
          '\n'
        );
        sqlStatement.append(
          SQL` AND LOWER(a.regional_invasive_species_organization_areas) LIKE '%'||`
        );
        sqlStatement.append(SQL`LOWER(${gridFilters.regional_invasive_species_organization_areas})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.regional_districts) {
        // DONE
        console.log('\n[REGIONAL DISTRICTS]: ', gridFilters.regional_districts, '\n');
        sqlStatement.append(SQL` AND LOWER(a.regional_districts) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.regional_districts})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.biogeoclimatic_zones) {
        // DONE
        console.log('\n[BIOGEOCLIMATIC ZONES]: ', gridFilters.biogeoclimatic_zones, '\n');
        sqlStatement.append(SQL` AND LOWER(a.biogeoclimatic_zones) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.biogeoclimatic_zones})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.elevation) {
        // DONE + case ins unnecessary 
        sqlStatement.append(SQL` AND a.elevation::text LIKE '%'||`);
        sqlStatement.append(SQL`${gridFilters.elevation}`);
        sqlStatement.append(SQL`||'%'`);
      }
    }
  }

  if (searchCriteria.created_by && searchCriteria.created_by.length) {
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
    sqlStatement.append(SQL`]::varchar[] && species_positive`);
  }

  // search intersects with some species codes
  if (searchCriteria.species_negative && searchCriteria.species_negative.length) {
    sqlStatement.append(SQL` AND ARRAY[`);
    sqlStatement.append(SQL`${searchCriteria.species_negative[0]}`);
    for (let idx = 1; idx < searchCriteria.species_negative.length; idx++)
      sqlStatement.append(SQL`, ${searchCriteria.species_negative[idx]}`);
    sqlStatement.append(SQL`]::varchar[] && species_negative`);
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

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`
      AND public.ST_INTERSECTS(
        a.geog,
        (SELECT geog FROM multi_polygon_cte)
      )
    `);
  }

  if (searchCriteria.order?.length) {
    sqlStatement.append(SQL` ORDER BY ${searchCriteria.order.join(', ')}`);
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
