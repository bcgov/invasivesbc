import { SQL, SQLStatement } from 'sql-template-strings';
import { PointOfInterestSearchCriteria } from '../models/point-of-interest';

/**
 * SQL query to fetch point_of_interest records based on search criteria.
 *
 * @param {PointOfInterestSearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */
//NOSONAR
export const getSurveysSQL = (searchCriteria: PointOfInterestSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT`;

  sqlStatement.append(SQL` *`);

  if (searchCriteria.iappSiteID) {
    sqlStatement.append(SQL` FROM survey_extract
      WHERE survey_extract.site_id = ${searchCriteria.iappSiteID}`);
  }

  return sqlStatement;
};
