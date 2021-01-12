import { SQL, SQLStatement } from 'sql-template-strings';
import { PointOfInterestPostRequestBody, PointOfInterestSearchCriteria } from '../models/point-of-interest';

/**
 * SQL query to insert a new point_of_interest, and return the inserted record.
 *
 * @param {PointOfInterestPostRequestBody} point_of_interest
 * @returns {SQLStatement} sql query object
 */
export const postPointOfInterestSQL = (point_of_interest: PointOfInterestPostRequestBody): SQLStatement => {
  if (!point_of_interest) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO point_of_interest_incoming_data (
      point_of_interest_type,
      point_of_interest_subtype,
      received_timestamp,
      point_of_interest_payload,
      geog,
      media_keys
    ) VALUES (
      ${point_of_interest.pointOfInterest_type},
      ${point_of_interest.pointOfInterest_subtype},
      ${point_of_interest.received_timestamp},
      ${point_of_interest.pointOfInterestPostBody}
  `;

  if (point_of_interest.geoJSONFeature && point_of_interest.geoJSONFeature.length) {
    // Note: this is only saving the `geometry` part of the feature, and not any assocaited `properties`.
    const geometry = JSON.stringify(point_of_interest.geoJSONFeature[0].geometry);

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

  if (point_of_interest.mediaKeys) {
    sqlStatement.append(SQL`
      ,${point_of_interest.mediaKeys}
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  sqlStatement.append(SQL`
    )
    RETURNING
      point_of_interest_incoming_data_id;
  `);

  return sqlStatement;
};

/**
 * SQL query to insert a large batch of new point_of_interest data, and return the last inserted record.
 *
 * @param {PointsOfInterestPostRequestBody} points_of_interest
 * @returns {SQLStatement} sql query object
 */
export const postPointsOfInterestSQL = (data: Array<PointOfInterestPostRequestBody>): SQLStatement => {
  if (!data) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO point_of_interest_incoming_data (
      point_of_interest_type,
      point_of_interest_subtype,
      received_timestamp,
      point_of_interest_payload,
      geog,
      media_keys
    ) VALUES `;

  for (let i = 0; i < data.length; i++) {
    sqlStatement.append(SQL`(
      ${data[i].pointOfInterest_type},
      ${data[i].pointOfInterest_subtype},
      ${data[i].received_timestamp},
      ${data[i].pointOfInterestPostBody}
    `);

    if (data[i].geoJSONFeature && data[i].geoJSONFeature.length) {
      // Note: this is only saving the `geometry` part of the feature, and not any assocaited `properties`.
      const geometry = JSON.stringify(data[i].geoJSONFeature[0].geometry);

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

    if (data[i].mediaKeys) {
      sqlStatement.append(SQL`
        ,${data[i].mediaKeys}
      `);
    } else {
      sqlStatement.append(SQL`
        ,null
      `);
    }

    sqlStatement.append(SQL`)`);
    if (i < data.length - 1)
      sqlStatement.append(SQL`,
      `);
  }

  sqlStatement.append(SQL`
    RETURNING
      point_of_interest_incoming_data_id;
  `);

  return sqlStatement;
};

/**
 * SQL query to fetch point_of_interest records based on search criteria.
 *
 * @param {PointOfInterestSearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */
export const getPointsOfInterestSQL = (searchCriteria: PointOfInterestSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT * FROM point_of_interest_incoming_data WHERE 1 = 1`;

  if (searchCriteria.pointOfInterest_type) {
    sqlStatement.append(SQL` AND point_of_interest_type = ${searchCriteria.pointOfInterest_type}`);
  }

  if (searchCriteria.pointOfInterest_subtype) {
    sqlStatement.append(SQL` AND point_of_interest_subtype = ${searchCriteria.pointOfInterest_subtype}`);
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
 * SQL query to fetch a single point_of_interest record based on its primary key.
 *
 * @param {number} point_of_interestId
 * @returns {SQLStatement} sql query object
 */
export const getPointOfInterestSQL = (point_of_interestId: number): SQLStatement => {
  return SQL`SELECT * FROM point_of_interest_incoming_data where point_of_interest_incoming_data_id = ${point_of_interestId}`;
};
