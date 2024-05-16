import { SQL, SQLStatement } from 'sql-template-strings';
import { RISOSearchCriteria } from 'models/riso';

export const getRISOsSQL = (searchCriteria: RISOSearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL``;

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`
      with inputData(geom) as (select public.ST_Force2D(
                                        public.ST_SetSRID(
                                          public.ST_GeomFromGeoJSON(${searchCriteria.search_feature.geometry}),
                                          4326
                                        )
                                      ))
      SELECT jsonb_build_object(
               'type', 'Feature',
               'properties', json_build_object(
                 'code_name', agency_cd,
                 'type', agency,
                 'name', layer,
                 'layer', 'regional_invasive_species_organization_areas'
                             ),
               'geometry', public.st_asGeoJSON(r.geog)::jsonb
             )                as "geojson",
             COUNT(*) OVER () AS "total_rows_count"
      FROM public.regional_invasive_species_organization_areas r,
           inputData i
      where public.ST_Intersects2(r.geog :: geometry, i.geom);
    `);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};
