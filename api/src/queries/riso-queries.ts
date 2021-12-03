import SQL, { SQLStatement } from 'sql-template-strings';
import { RISOSearchCriteria } from 'models/riso';

export const getRISOsSQL = (searchCriteria: RISOSearchCriteria): SQLStatement => {
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
    SELECT json_build_object (
      'type', 'Feature',
      'properties', json_build_object(
        'gid', gid,
        'agency', agency,
        'layer', 'regional_invasive_species_organization_areas'
      ),
      'geometry', public.st_asGeoJSON(r.geom)::jsonb
    ) as "geojson", COUNT(*) OVER() AS "total_rows_count"
      FROM regional_invasive_species_organization_areas r, inputData i
      where public.ST_Intersects2(r.geom, i.geom)
    `);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};
