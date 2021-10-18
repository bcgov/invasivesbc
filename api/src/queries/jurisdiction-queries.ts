import SQL, { SQLStatement } from 'sql-template-strings';
import { JurisdictionSearchCriteria } from '../models/jurisdiction';

/**
 * SQL query to fetch jurisdiction records based on search criteria.
 *
 * @param {JurisdictionSearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */
//NOSONAR
export const getJurisdictionsSQL = (searchCriteria: JurisdictionSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT`;

  sqlStatement.append(SQL`
     code_name,jurisdictn,name
  `);

  // include the total count of results that would be returned if the limit and offset constraints weren't applied
  // sqlStatement.append(SQL`, COUNT(*) OVER() AS total_rows_count`);

  sqlStatement.append(SQL` FROM jurisdiction WHERE 1 = 1`);

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`
      AND public.ST_INTERSECTS(
        geom,
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

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};
