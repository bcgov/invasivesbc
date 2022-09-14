import { getDBConnection } from '../database/db';
import { SQL, SQLStatement } from 'sql-template-strings';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';
import { getLogger } from '../utils/logger';
const defaultLog = getLogger('point-of-interest');
/**
 * SQL query to fetch point_of_interest records based on search criteria.
 *
 * @param {PointOfInterestSearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */
//NOSONAR
export const getSitesBasedOnSearchCriteriaSQL = (searchCriteria: PointOfInterestSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL``;

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`WITH multi_polygon_cte AS (SELECT (ST_Collect(ST_GeomFromGeoJSON(array_features->>'geometry')))::geography as geog
    FROM (
      SELECT json_array_elements(${searchCriteria.search_feature}::json->'features') AS array_features
    ) AS anything) `);
  }

  if (searchCriteria?.grid_filters?.jurisdictions) {
    if (searchCriteria.search_feature) sqlStatement.append(SQL`, `);
    sqlStatement.append(SQL`WITH strings AS (SELECT site_id, array_to_string(jurisdictions, ', ') AS j_string FROM iapp_site_summary_and_geojson) `);
  }

  sqlStatement.append(SQL`SELECT *, public.st_asGeoJSON(s.geog)::jsonb as geo`);
  sqlStatement.append(
    SQL` FROM iapp_site_summary_and_geojson i
    JOIN iapp_spatial s 
      ON i.site_id = s.site_id`
    // JOIN point_of_interest_incoming_data p
    //   ON i.site_id = p.point_of_interest_incoming_id WHERE 1=1`
  );

  if (searchCriteria?.grid_filters?.jurisdictions) {
    sqlStatement.append(SQL` INNER JOIN strings j ON i.site_id = j.site_id`);
  }

  sqlStatement.append(SQL` WHERE 1 = 1 `);

  if (searchCriteria.iappSiteID) {
    sqlStatement.append(SQL` AND i.site_id = ${searchCriteria.iappSiteID}`);
  }
  if (searchCriteria.pointOfInterest_subtype) {
    sqlStatement.append(SQL` AND point_of_interest_subtype = ${searchCriteria.pointOfInterest_subtype}`);
  }

  if (searchCriteria.iappType) {
    if (searchCriteria.iappSiteID) {
      sqlStatement.append(SQL` AND i.site_id = ${searchCriteria.iappSiteID}`);
    }
    if (searchCriteria.date_range_start) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const format = require('pg-format');
      const noTime = searchCriteria.date_range_start.toString().substr(0, 10);
      const sql = format(" AND i.%I >= '%s'::DATE", 'min_' + searchCriteria.iappType, noTime);
      sqlStatement.append(sql);
    }
    if (searchCriteria.date_range_end) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const format = require('pg-format');
      const noTime = searchCriteria.date_range_end.toString().substr(0, 10);
      const sql = format(" AND i.%I <= '%s'::DATE", 'max_' + searchCriteria.iappType, noTime);
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

  // grid filtering
  console.log('\n\n%%%%%%%%%%%%%%%%%%%%%%% GRID FILTERS @@@@@@@\n\n\n\n\n\n\n\n\n\n\n\n');
  if (searchCriteria.grid_filters) {
    console.log('$$$$ GRID FILTERS @@@@@@@');
    console.log(searchCriteria.grid_filters);

    const gridFilters = searchCriteria.grid_filters;
    if (gridFilters.enabled) {
      if (gridFilters.point_of_interest_id) {
        sqlStatement.append(SQL` AND i.site_id::text LIKE '%'||`);
        sqlStatement.append(SQL`${gridFilters.point_of_interest_id}`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.paper_file_id) {
        sqlStatement.append(SQL` AND LOWER(i.site_paper_file_id::text) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.paper_file_id})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.jurisdictions) {
        sqlStatement.append(SQL` AND LOWER(j.j_string) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.jurisdictions})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.date_created) {
        sqlStatement.append(SQL` AND LOWER(i.min_survey::text) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.date_created})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.species_on_site) {
        sqlStatement.append(SQL` AND LOWER(i.all_species_on_site) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.species_on_site})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.date_last_surveyed) {
        sqlStatement.append(SQL` AND LOWER(i.max_survey::text) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.date_last_surveyed})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.agencies) {
        sqlStatement.append(SQL` AND LOWER(i.agencies::text) LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.agencies})`);
        sqlStatement.append(SQL`||'%'`);
      }
      if (gridFilters.bio_release) {
        sqlStatement.append(SQL` AND has_biological_treatments = CASE
        WHEN LOWER('Yes') LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.bio_release})`);
        sqlStatement.append(SQL`||'%'`);
        sqlStatement.append(SQL`THEN TRUE ELSE FALSE END`);
      }
      if (gridFilters.chem_treatment) {
        sqlStatement.append(SQL` AND has_chemical_treatments = CASE
        WHEN LOWER('Yes') LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.chem_treatment})`);
        sqlStatement.append(SQL`||'%'`);
        sqlStatement.append(SQL`THEN TRUE ELSE FALSE END`);
      }
      if (gridFilters.mech_treatment) {
        sqlStatement.append(SQL` AND has_mechanical_treatments = CASE
        WHEN LOWER('Yes') LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.mech_treatment})`);
        sqlStatement.append(SQL`||'%'`);
        sqlStatement.append(SQL`THEN TRUE ELSE FALSE END`);
      }
      if (gridFilters.bio_dispersal) {
        sqlStatement.append(SQL` AND has_biological_dispersals = CASE
        WHEN LOWER('Yes') LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.bio_dispersal})`);
        sqlStatement.append(SQL`||'%'`);
        sqlStatement.append(SQL`THEN TRUE ELSE FALSE END`);
      }
      if (gridFilters.monitored) {
        sqlStatement.append(SQL` AND (
          (has_biological_treatment_monitorings = TRUE 
          OR has_chemical_treatment_monitorings = TRUE 
          OR has_mechanical_treatment_monitorings = TRUE
          )
        AND LOWER('Yes') LIKE '%'||`);
        sqlStatement.append(SQL`LOWER(${gridFilters.monitored})`);
        sqlStatement.append(SQL`||'%'`);
        sqlStatement.append(SQL`)`);
      }

    }
  }

  // search intersects with positive or negative species
  if ((searchCriteria.species_positive && searchCriteria.species_positive.length) || 
      (searchCriteria.species_negative && searchCriteria.species_negative.length)) {

    // filter positive species encounters
    if (searchCriteria.species_positive && searchCriteria.species_positive.length) {
      for (let i = 0; i < searchCriteria.species_positive.length; i++ ) {
        sqlStatement.append(SQL`
          AND i.site_id IN (SELECT site_id
            FROM iapp_species_status
            WHERE is_species_positive
            AND invasive_plant IN (`);

        sqlStatement.append(SQL`${searchCriteria.species_positive[i]}`);

        sqlStatement.append(SQL`))`);
      }
    }

    // filter negative species encounters
    if (searchCriteria.species_negative && searchCriteria.species_negative.length) {
      for (let i = 0; i < searchCriteria.species_negative.length; i++ ) {
        sqlStatement.append(SQL`
          AND i.site_id IN (SELECT site_id
            FROM iapp_species_status
            WHERE is_species_negative
            AND invasive_plant IN (`);

        sqlStatement.append(SQL`${searchCriteria.species_negative[i]}`);

        sqlStatement.append(SQL`))`);
      }
    }
  }

  // search intersects with jurisdiction codes
  if (searchCriteria.jurisdiction && searchCriteria.jurisdiction.length) {
    for (let i = 0; i < searchCriteria.jurisdiction.length; i++) {
      const string = `%${searchCriteria.jurisdiction[i]}%`; // separate variable to get over data type issue
      sqlStatement.append(SQL`AND array_to_string(jurisdictions, ', ') LIKE ${string} `);
    }
  }
    
  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`
      AND public.ST_INTERSECTS(
        geog,
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

  return sqlStatement;
};

/**
 * SQL query to get biological_dispersal_extract based on site_id
 * @param {number[]} site_id
 * @param {string} extractName
 * @returns {SQLStatement} sql query object
 */
export const iapp_extract_sql = (site_id: number[], extractName: string): SQLStatement => {
  //stupid lib doesn't let you dynamically pass table name
  const sqlStatement: SQLStatement = SQL`SELECT`;

  switch (extractName) {
    case 'iapp_spatial':
      sqlStatement.append(SQL` site_id, public.st_asGeoJSON(geog)::jsonb as geo`);
      break;
    default:
      sqlStatement.append(SQL` *`);
      break;
  }
  switch (extractName) {
    case 'iapp_spatial':
      sqlStatement.append(` from iapp_spatial`);
      break;
    case 'biological_dispersal_extract':
      sqlStatement.append(` from biological_dispersal_extract`);
      break;
    case 'biological_monitoring_extract':
      sqlStatement.append(` from biological_monitoring_extract`);
      break;
    case 'biological_treatment_extract':
      sqlStatement.append(` from biological_treatment_extract`);
      break;
    case 'chemical_monitoring_extract':
      sqlStatement.append(` from chemical_monitoring_extract`);
      break;
    case 'chemical_treatment_extract':
      sqlStatement.append(` from chemical_treatment_extract`);
      break;
    case 'mechanical_monitoring_extract':
      sqlStatement.append(` from mechanical_monitoring_extract`);
      break;
    case 'mechanical_treatment_extract':
      sqlStatement.append(` from mechanical_treatment_extract`);
      break;
    case 'site_selection_extract':
      sqlStatement.append(` from site_selection_extract`);
      break;
    case 'survey_extract':
      sqlStatement.append(` from survey_extract`);
      break;
  }

  if (site_id && site_id.length) {
    sqlStatement.append(SQL` where site_id IN (`);

    // add the first activity subtype, which does not get a comma prefix
    sqlStatement.append(SQL`${site_id[0]}`);

    for (let idx = 1; idx < site_id.length; idx++) {
      // add all subsequent activity subtypes, which do get a comma prefix
      sqlStatement.append(SQL`, ${site_id[idx]}`);
    }

    sqlStatement.append(SQL`);`);
  }

  return sqlStatement;
};

export const getIappExtractFromDB = async (site_ids: number[], extractName: string) => {
  const connection = await getDBConnection();

  if (!connection) {
    throw {
      code: 503,
      message: 'Failed to establish database connection',
      namespace: 'iapp-queries'
    };
  }

  try {
    const sqlStatement: SQLStatement = iapp_extract_sql(site_ids, extractName);

    if (!sqlStatement) {
      throw {
        code: 400,
        message: 'Failed to build SQL statement',
        namespace: 'iapp-queries'
      };
    }

    const responseIAPP = await connection.query(sqlStatement.text, sqlStatement.values);
    if (responseIAPP.rows) return responseIAPP.rows;
    else return [];
  } catch (e) {
    console.log(e);
    throw 'Unable to get iapp extract ' + extractName + ' for sites ' + site_ids;
  } finally {
    connection.release();
  }
};
