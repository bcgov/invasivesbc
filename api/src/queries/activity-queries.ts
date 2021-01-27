import { SQL, SQLStatement } from 'sql-template-strings';
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
      activity_payload,
      geog,
      media_keys
    ) VALUES (
      ${activity.activity_id},
      ${activity.activity_type},
      ${activity.activity_subtype},
      ${activity.created_timestamp},
      ${activity.received_timestamp},
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
      ,${activity.mediaKeys}
    `);
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
  updateSQL: SQLStatement;
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

  // update existing activity record
  const updateSQLStatement: SQLStatement = SQL`
    UPDATE activity_incoming_data
    SET deleted_timestamp = ${new Date().toISOString()}
    WHERE activity_id = ${activity.activity_id}
    AND deleted_timestamp IS NULL;
  `;

  // create new activity record
  const createSQLStatement: SQLStatement = postActivitySQL(activity);

  return { updateSQL: updateSQLStatement, createSQL: createSQLStatement };
};

/**
 * SQL query to fetch activity records based on search criteria.
 *
 * @param {ActivitySearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */
export const getActivitiesSQL = (searchCriteria: ActivitySearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT`;

  if (searchCriteria.column_names && searchCriteria.column_names.length) {
    // do not include the `SQL` template string prefix, as column names can not be parameterized
    sqlStatement.append(` ${searchCriteria.column_names.join(', ')}`);
  } else {
    // if no column_names specified, select all
    sqlStatement.append(SQL` *`);
  }

  // include the total count of results that would be returned if the limit and offset constraints weren't applied
  sqlStatement.append(SQL`, COUNT(*) OVER() AS total_rows_count`);

  sqlStatement.append(SQL` FROM activity_incoming_data WHERE 1 = 1`);

  // don't include deleted or out-dated records
  sqlStatement.append(SQL` AND deleted_timestamp IS NULL`);

  if (searchCriteria.activity_subtype && searchCriteria.activity_type.length) {
    sqlStatement.append(SQL` AND activity_type IN (`);

    // add the first activity type, which does not get a comma prefix
    sqlStatement.append(SQL`${searchCriteria.activity_type[0]}`);

    for (let idx = 1; idx < searchCriteria.activity_type.length; idx++) {
      // add all subsequent activity types, which do get a comma prefix
      sqlStatement.append(SQL`, ${searchCriteria.activity_type[idx]}`);
    }

    sqlStatement.append(SQL`)`);
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

  if (searchCriteria.date_range_start) {
    sqlStatement.append(SQL` AND received_timestamp >= ${searchCriteria.date_range_start}::DATE`);
  }

  if (searchCriteria.date_range_end) {
    sqlStatement.append(SQL` AND received_timestamp <= ${searchCriteria.date_range_end}::DATE`);
  }

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`
      AND public.ST_INTERSECTS(
        geog,
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
              public.ST_GeomFromGeoJSON(${searchCriteria.search_feature.geometry}),
              4326
            )
          )
        )
      )
    `);
  }

  if (searchCriteria.sort_by) {
    // do not include the `SQL` template string prefix, as column names and sort direction can not be parameterized
    sqlStatement.append(` ORDER BY ${searchCriteria.sort_by} ${searchCriteria.sort_direction}`);
  }

  if (searchCriteria.limit) {
    sqlStatement.append(SQL` LIMIT ${searchCriteria.limit}`);
  }

  if (searchCriteria.page && searchCriteria.limit) {
    sqlStatement.append(SQL` OFFSET ${searchCriteria.page * searchCriteria.limit}`);
  }

  sqlStatement.append(SQL`;`);

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
    SELECT * FROM activity_incoming_data
    WHERE activity_id = ${activityId}
    AND deleted_timestamp IS NULL;
  `;
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
