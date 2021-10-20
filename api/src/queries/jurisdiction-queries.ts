import SQL, { SQLStatement } from 'sql-template-strings';
import { JurisdictionSearchCriteria } from '../models/jurisdiction';

/**
 * SQL query to fetch jurisdiction records based on search criteria.
 *
 * @param {JurisdictionSearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */

export const getJurisdictionsSQL = (searchCriteria: JurisdictionSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL``;

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`
      with inputData(geom) as (
      select 
                public.ST_Force2D(
                  public.ST_SetSRID(
                    public.ST_GeomFromGeoJSON(${searchCriteria.search_feature.geometry}),
                    4326
                  )
                ) 
              )
      select  code_name,jurisdictn,name, public.st_asGeoJSON(j.geom)::jsonb  as geom
      FROM jurisdiction j , inputData i
      where public.st_intersects2(j.geom, i.geom)
    `);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};
