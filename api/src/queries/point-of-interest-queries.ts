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
//NOSONAR
export const getPointsOfInterestSQL = (searchCriteria: PointOfInterestSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT`;

  /*
  select poi.*, ot.survey_date
  from point_of_interest_incoming_data poi
  left join other_table ot on poi.id_column = ot.id_column
  —where ot.iapp_type = ‘survey’ and ot.survey_date > ‘inputdate1’ and ot.survey_date < ‘input_date2’
  */

  // if (searchCriteria.column_names && searchCriteria.column_names.length) {
  //   // do not include the `SQL` template string prefix, as column names can not be parameterized
  //   sqlStatement.append(` ${searchCriteria.column_names.join(', ')}`);
  // } else {
  //   // if no column_names specified, select all
  //   sqlStatement.append(SQL` *`);
  // }

  /**
   * TODO: Add list of attributes and geometries here
   */
  sqlStatement.append(` 
    jsonb_build_object(
      'type', 'Feature',
      'properties', json_build_object(
        COUNT(*) OVER() AS total_rows_count,
        'activity_id', activity_id,
        'activity_type', activity_type,
        'activity_subtype', activity_subtype
     ),
     'geometry', puplic.st_asGeoJSON(geog)::jsonb
    ) as "geojson"
  `);

  // include the total count of results that would be returned if the limit and offset constraints weren't applied
  sqlStatement.append(SQL`, `);

  if (searchCriteria.iappType) {
    sqlStatement.append(SQL` FROM point_of_interest_incoming_data LEFT JOIN iapp_site_summary ON
    point_of_interest_incoming_data.point_of_interest_incoming_data_id = iapp_site_summary.id WHERE 1 = 1
    `);
  } else {
    sqlStatement.append(SQL` FROM point_of_interest_incoming_data WHERE 1 = 1`);
  }

  if (searchCriteria.pointOfInterest_type) {
    sqlStatement.append(SQL` AND point_of_interest_type = ${searchCriteria.pointOfInterest_type}`);
  }

  if (searchCriteria.pointOfInterest_subtype) {
    sqlStatement.append(SQL` AND point_of_interest_subtype = ${searchCriteria.pointOfInterest_subtype}`);
  }

  if (searchCriteria.iappType) {
    if (searchCriteria.iappSiteID) {
      sqlStatement.append(SQL` AND iapp_site_summary.id = ${searchCriteria.iappSiteID}`);
    }
    if (searchCriteria.date_range_start) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const format = require('pg-format');
      const noTime = searchCriteria.date_range_start.toString().substr(0, 10);
      const sql = format(" AND iapp_site_summary.%I >= '%s'::DATE", 'min_' + searchCriteria.iappType, noTime);
      sqlStatement.append(sql);
    }
    if (searchCriteria.date_range_end) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const format = require('pg-format');
      const noTime = searchCriteria.date_range_end.toString().substr(0, 10);
      const sql = format(" AND iapp_site_summary.%I <= '%s'::DATE", 'max_' + searchCriteria.iappType, noTime);
      sqlStatement.append(sql);
    }
  } else {
    if (searchCriteria.date_range_start) {
      sqlStatement.append(SQL` AND received_timestamp >= ${searchCriteria.date_range_start}::DATE`);
    }
    if (searchCriteria.date_range_end) {
      sqlStatement.append(SQL` AND received_timestamp <= ${searchCriteria.date_range_end}::DATE`);
    }
  }

  if (searchCriteria.pointOfInterest_ids && searchCriteria.pointOfInterest_ids.length) {
    sqlStatement.append(SQL` AND point_of_interest_id IN (`);
    sqlStatement.append(SQL`${searchCriteria.pointOfInterest_ids[0]}`);
    for (let idx = 1; idx < searchCriteria.pointOfInterest_ids.length; idx++) {
      sqlStatement.append(SQL`, ${searchCriteria.pointOfInterest_ids[idx]}`);
    }
    sqlStatement.append(SQL`)`);
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

  // TBD: This may conflict with the json building function
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

/**
 * SQL query to fetch point_of_interest records based on search criteria. Formatted to GeoJSON
 *
 * @param {PointOfInterestSearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */
//NOSONAR
export const getPointsOfInterestLeanSQL = (searchCriteria: PointOfInterestSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT`;

  /*
  select poi.*, ot.survey_date
  from point_of_interest_incoming_data poi
  left join other_table ot on poi.id_column = ot.id_column
  —where ot.iapp_type = ‘survey’ and ot.survey_date > ‘inputdate1’ and ot.survey_date < ‘input_date2’
  */

  if (searchCriteria.column_names && searchCriteria.column_names.length) {
    // do not include the `SQL` template string prefix, as column names can not be parameterized
    sqlStatement.append(` ${searchCriteria.column_names.join(', ')}`);
  } else {
    // if no column_names specified, select all
    sqlStatement.append(SQL` *`);
  }

  // include the total count of results that would be returned if the limit and offset constraints weren't applied
  sqlStatement.append(SQL`, COUNT(*) OVER() AS total_rows_count`);

  if (searchCriteria.iappType) {
    sqlStatement.append(SQL` FROM point_of_interest_incoming_data LEFT JOIN iapp_site_summary ON
    point_of_interest_incoming_data.point_of_interest_incoming_data_id = iapp_site_summary.id WHERE 1 = 1
    `);
  } else {
    sqlStatement.append(SQL` FROM point_of_interest_incoming_data WHERE 1 = 1`);
  }

  if (searchCriteria.pointOfInterest_type) {
    sqlStatement.append(SQL` AND point_of_interest_type = ${searchCriteria.pointOfInterest_type}`);
  }

  if (searchCriteria.pointOfInterest_subtype) {
    sqlStatement.append(SQL` AND point_of_interest_subtype = ${searchCriteria.pointOfInterest_subtype}`);
  }

  if (searchCriteria.iappType) {
    if (searchCriteria.iappSiteID) {
      sqlStatement.append(SQL` AND iapp_site_summary.id = ${searchCriteria.iappSiteID}`);
    }
    if (searchCriteria.date_range_start) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const format = require('pg-format');
      const noTime = searchCriteria.date_range_start.toString().substr(0, 10);
      const sql = format(" AND iapp_site_summary.%I >= '%s'::DATE", 'min_' + searchCriteria.iappType, noTime);
      sqlStatement.append(sql);
    }
    if (searchCriteria.date_range_end) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const format = require('pg-format');
      const noTime = searchCriteria.date_range_end.toString().substr(0, 10);
      const sql = format(" AND iapp_site_summary.%I <= '%s'::DATE", 'max_' + searchCriteria.iappType, noTime);
      sqlStatement.append(sql);
    }
  } else {
    if (searchCriteria.date_range_start) {
      sqlStatement.append(SQL` AND received_timestamp >= ${searchCriteria.date_range_start}::DATE`);
    }
    if (searchCriteria.date_range_end) {
      sqlStatement.append(SQL` AND received_timestamp <= ${searchCriteria.date_range_end}::DATE`);
    }
  }

  if (searchCriteria.pointOfInterest_ids && searchCriteria.pointOfInterest_ids.length) {
    sqlStatement.append(SQL` AND point_of_interest_id IN (`);
    sqlStatement.append(SQL`${searchCriteria.pointOfInterest_ids[0]}`);
    for (let idx = 1; idx < searchCriteria.pointOfInterest_ids.length; idx++) {
      sqlStatement.append(SQL`, ${searchCriteria.pointOfInterest_ids[idx]}`);
    }
    sqlStatement.append(SQL`)`);
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

  return sqlStatement;
};
