import { SQL, SQLStatement } from 'sql-template-strings';
import { ActivityPostRequestBody, ActivitySearchCriteria } from './../models/activity';

/**
 * SQL query to insert a new activity, and return the inserted record.
 *
 * @param {ActivityPostRequestBody} activityData
 * @returns {SQLStatement} sql query object
 */
export const postActivitySQL = (activityData: ActivityPostRequestBody): SQLStatement => {
  if (!activityData) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO activity_incoming_data (
      activity_type,
      activity_sub_type,
      received_timestamp,
      activity_payload,
      geog,
      media_keys
    ) VALUES (
      ${activityData.activity_type},
      ${activityData.activity_sub_type},
      ${activityData.date},
      ${activityData.activityPostBody}
  `;

  if (activityData.locationAndGeometry && activityData.locationAndGeometry['geometry']) {
    sqlStatement.append(`
      ,public.geography(
        public.ST_Force2D(
          public.ST_SetSRID(
            public.ST_GeomFromGeoJSON('${JSON.stringify(activityData.locationAndGeometry['geometry'])}')
            ,4326
          )
        )
      )
    `);
  } else {
    sqlStatement.append(`
      ,null
    `);
  }

  sqlStatement.append(`
      ,${activityData.mediaKeys}
    )
    RETURNING
      activity_incoming_data_id;
  `);

  return sqlStatement;
};

/**
 * SQL query to fetch activity records based on search criteria.
 *
 * @param {ActivitySearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */
export const getActivitiesSQL = (searchCriteria: ActivitySearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT * FROM activity_incoming_data`;

  if (searchCriteria.activity_type) {
    sqlStatement.append(SQL` WHERE activity_type = ${searchCriteria.activity_type}`);
  }

  if (searchCriteria.activity_sub_type) {
    sqlStatement.append(SQL` WHERE activity_sub_type = ${searchCriteria.activity_sub_type}`);
  }

  if (searchCriteria.date_range_start) {
    sqlStatement.append(SQL` WHERE received_timestamp >= ${searchCriteria.date_range_start}::date`);
  }

  if (searchCriteria.date_range_end) {
    sqlStatement.append(SQL` WHERE received_timestamp <= ${searchCriteria.date_range_end}::date`);
  }

  if (searchCriteria.limit) {
    sqlStatement.append(SQL` LIMIT ${searchCriteria.limit}`);
  }

  if (searchCriteria.limit) {
    sqlStatement.append(SQL` OFFSET ${searchCriteria.page}`);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};

/**
 * SQL query to fetch a single activity record based on its primary key.
 *
 * @param {number} activityId
 * @returns {SQLStatement} sql query object
 */
export const getActivitySQL = (activityId: number): SQLStatement => {
  return SQL`SELECT * FROM activity_incoming_data where activity_incoming_data_id = ${activityId}`;
};
