import { SQL, SQLStatement } from 'sql-template-strings';
import { PointOfInterestPostRequestBody, PointOfInterestSearchCriteria } from 'models/point-of-interest';

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
    INSERT INTO point_of_interest_incoming_data (point_of_interest_type,
                                                 point_of_interest_subtype,
                                                 species_positive,
                                                 received_timestamp,
                                                 point_of_interest_payload,
                                                 geog,
                                                 media_keys)
    VALUES (${point_of_interest.pointOfInterest_type},
            ${point_of_interest.pointOfInterest_subtype},
            ${point_of_interest.species_positive},
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
    INSERT INTO point_of_interest_incoming_data (point_of_interest_type,
                                                 point_of_interest_subtype,
                                                 species_positive,
                                                 received_timestamp,
                                                 point_of_interest_payload,
                                                 geog,
                                                 media_keys)
    VALUES `;

  for (let i = 0; i < data.length; i++) {
    sqlStatement.append(SQL`(
      ${data[i].pointOfInterest_type},
      ${data[i].pointOfInterest_subtype},
      ${data[i].species_positive},
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
 * SQL query to fetch a single point_of_interest record based on its primary key.
 *
 * @param {number} point_of_interestId
 * @returns {SQLStatement} sql query object
 */
export const getPointOfInterestSQL = (point_of_interestId: number): SQLStatement => {
  return SQL`SELECT *
             FROM point_of_interest_incoming_data
             where point_of_interest_incoming_data_id = ${point_of_interestId}`;
};

/**
 * ## getPointsOfInterestLeanSQL
 * Get Points of interest based on search criteria.
 * The output is formatted to the GeoJSON specification.
 * @param searchCriteria Extent, type ext...
 * @returns Postgres data object
 */
export const getPointsOfInterestLeanSQL = (searchCriteria: PointOfInterestSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL``;

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`WITH multi_polygon_cte AS
                                   (SELECT (ST_Collect(ST_GeomFromGeoJSON(array_features ->> 'geometry')))::geography as geog
                                    FROM (SELECT json_array_elements(${searchCriteria.search_feature}::json -> 'features') AS array_features) AS anything),
                                 not_null_issag AS (SELECT site_id, geojson
                                                    FROM iapp_site_summary_and_geojson
                                                    WHERE (geojson -> 'geometry')::text != 'null'),
                                 intersections as (select site_id,
                                                          (public.ST_INTERSECTS(
                                                            public.geography(public.ST_Force2D(public.ST_SetSRID(
                                                              (public.ST_GeomFromGeoJSON(((geojson -> 'geometry'):: text))),
                                                              4326))),
                                                            (SELECT geog FROM multi_polygon_cte))) as intersects
                                                   from not_null_issag)
    `);
    sqlStatement.append(
      SQL`SELECT a.site_id, b.intersects, geojson
          FROM iapp_site_summary_and_geojson a
                 join intersections b on a.site_id = b.site_id
          WHERE 1 = 1`
    );
  } else {
    sqlStatement.append(SQL`SELECT a.site_id, geojson
                            FROM iapp_site_summary_and_geojson a
                            WHERE 1 = 1`);
  }

  enum PoiType {
    Sites = 'Sites',
    Surveys = 'Surveys',
    ChemTreatment = 'Chemical Treatment',
    MechTreatment = 'Mechanical Treatment',
    MonitoringRecords = 'Monitoring Records',
    BioRelease = 'Biocontrol Release',
    BioDispersal = 'Biocontrol Dispersal',
    BioMonitoring = 'Biocontrol Monitoring'
  }

  if (searchCriteria.pointOfInterest_type) {
    // sqlStatement.append(SQL` AND point_of_interest_type = ${searchCriteria.pointOfInterest_type}`);

    switch (searchCriteria.pointOfInterest_type) {
      case PoiType.Sites:
        sqlStatement.append(SQL` AND 1 = 1`);
        break;
      case PoiType.Surveys:
        sqlStatement.append(SQL` AND has_surveys is TRUE`);
        break;
      case PoiType.ChemTreatment:
        sqlStatement.append(SQL` AND has_chemical_treatments IS TRUE`);
        break;
      case PoiType.MechTreatment:
        sqlStatement.append(SQL` AND has_mechanical_treatments IS TRUE`);
        break;
      case PoiType.MonitoringRecords:
        sqlStatement.append(
          SQL` AND has_chemical_treatment_monitorings IS TRUE OR has_mechanical_treatment_monitorings IS TRUE`
        );
        break;
      case PoiType.BioRelease:
        sqlStatement.append(SQL` AND has_biological_treatments IS TRUE`);
        break;
      case PoiType.BioDispersal:
        sqlStatement.append(SQL` AND has_biological_dispersals IS TRUE`);
        break;
      case PoiType.BioMonitoring:
        sqlStatement.append(SQL` AND has_biological_treatment_monitorings IS TRUE`);
        break;
      default:
        sqlStatement.append(SQL` AND 1=1`);
        break;
    }
  }

  // if (searchCriteria.pointOfInterest_subtype) {
  //   sqlStatement.append(SQL` AND point_of_interest_subtype = ${searchCriteria.pointOfInterest_subtype}`);
  // }

  if (searchCriteria.iappType) {
    if (searchCriteria.iappSiteID) {
      sqlStatement.append(SQL` AND site_id = ${searchCriteria.iappSiteID}`);
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

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`
      AND b.intersects IS TRUE
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
