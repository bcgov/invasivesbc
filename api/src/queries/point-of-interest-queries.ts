import { SQL, SQLStatement } from 'sql-template-strings';
import { PointOfInterestPostRequestBody, PointOfInterestSearchCriteria } from 'models/point-of-interest';

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

  if (searchCriteria.column_names && searchCriteria.column_names.length) {
    // do not include the `SQL` template string prefix, as column names can not be parameterized
    sqlStatement.append(` ${searchCriteria.column_names.join(', ')}`);
  } else {
    // if no column_names specified, select all
    sqlStatement.append(SQL` *`);
  }

  // include the total count of results that would be returned if the limit and offset constraints weren't applied
  //sqlStatement.append(SQL`, COUNT(*) OVER() AS total_rows_count`);

  if (searchCriteria.iappType) {
    sqlStatement.append(SQL` FROM point_of_interest_incoming_data LEFT JOIN iapp_site_summary_and_geojson ON
    point_of_interest_incoming_data.point_of_interest_incoming_data_id = iapp_site_summary_and_geojson.id WHERE 1 = 1
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
      sqlStatement.append(SQL` AND iapp_site_summary_and_geojson.id = ${searchCriteria.iappSiteID}`);
    }
    if (searchCriteria.date_range_start) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const format = require('pg-format');
      const noTime = searchCriteria.date_range_start.toString().substr(0, 10);
      const sql = format(
        " AND iapp_site_summary_and_geojson.%I >= '%s'::DATE",
        'min_' + searchCriteria.iappType,
        noTime
      );
      sqlStatement.append(sql);
    }
    if (searchCriteria.date_range_end) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const format = require('pg-format');
      const noTime = searchCriteria.date_range_end.toString().substr(0, 10);
      const sql = format(
        " AND iapp_site_summary_and_geojson.%I <= '%s'::DATE",
        'max_' + searchCriteria.iappType,
        noTime
      );
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

  if (searchCriteria.point_of_interest_ids && searchCriteria.point_of_interest_ids.length) {
    sqlStatement.append(SQL` AND point_of_interest_id IN (`);
    sqlStatement.append(SQL`${searchCriteria.point_of_interest_ids[0]}`);
    for (let idx = 1; idx < searchCriteria.point_of_interest_ids.length; idx++) {
      sqlStatement.append(SQL`, ${searchCriteria.point_of_interest_ids[idx]}`);
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

  // if (searchCriteria.search_feature) {     doesn't appear to be used, see iapp-queries.ts
  //   sqlStatement.append(SQL`
  //     AND public.ST_INTERSECTS(
  //       geog,
  //       public.geography(
  //         public.ST_Force2D(
  //           public.ST_SetSRID(
  //             public.ST_GeomFromGeoJSON(${searchCriteria.search_feature.geometry}),
  //             4326
  //           )
  //         )
  //       )
  //     )
  //   `);
  // }

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
 * SQL query to fetch mapped species names based on advanced filter codes
 *
 * @param {Array} codes
 * @returns {SQLStatement} sql query object
 */
export const getSpeciesMapSQL = (codes: Array<string>): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT iapp_name
                                         FROM iapp_invbc_mapping
                                         WHERE char_code IN (`;
  sqlStatement.append(SQL`${codes[0]}`);

  for (let idx = 1; idx < codes.length; idx++) {
    sqlStatement.append(SQL`, ${codes[idx]}`);
  }

  sqlStatement.append(SQL`);`);

  return sqlStatement;
};
