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
    SELECT jsonb_build_object (
    'type', 'Feature',
    'properties', json_build_object(
      'code_name', code_name,
      'type', jurisdictn,
      'name', name,
      'layer', 'jurisdiction'
    ),
    'geometry', public.st_asGeoJSON(j.geog)::jsonb
  ) as "geojson", COUNT(*) OVER() AS "total_rows_count" 
    FROM public.jurisdiction j , inputData i
    where public.ST_Intersects2(ST_MakeValid(j.geog :: geometry), i.geom);
  `);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};
