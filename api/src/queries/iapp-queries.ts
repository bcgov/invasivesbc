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
  const sqlStatement: SQLStatement = SQL`SELECT`;

  sqlStatement.append(SQL` *, public.st_asGeoJSON(s.geog)::jsonb as geo`);
  sqlStatement.append(
    SQL` FROM iapp_site_summary_and_geojson i
    JOIN iapp_spatial s 
      ON i.site_id = s.site_id WHERE 1=1`
    // JOIN point_of_interest_incoming_data p
    //   ON i.site_id = p.point_of_interest_incoming_id WHERE 1=1`
  );

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

  // search intersects with some species codes
  // if (searchCriteria.species_positive && searchCriteria.species_positive.length) {
  //   sqlStatement.append(SQL` AND ARRAY[`);
  //   sqlStatement.append(SQL`${searchCriteria.species_positive[0]}`);
  //   for (let idx = 1; idx < searchCriteria.species_positive.length; idx++)
  //     sqlStatement.append(SQL`, ${searchCriteria.species_positive[idx]}`);
  //   sqlStatement.append(SQL`]::varchar[] && species_positive`);
  // }

  if (searchCriteria.search_feature?.geometry) {
    sqlStatement.append(SQL` AND  public.ST_INTERSECTS(
        geog,
        public.geography(
              	public.geography( public.ST_Force2D(  
				    public.ST_SetSRID(  
				        public.ST_GeomFromGeoJSON(${searchCriteria.search_feature.geometry}),  4326  ) ) )
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
