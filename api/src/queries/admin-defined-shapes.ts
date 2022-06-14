import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch administratively-defined shapes (from uploaded KML) for display
 *
 * @returns {SQLStatement} sql query object
 */
export const getAdministrativelyDefinedShapesSQL = (user_id: string) => {
  const sqlStatement: SQLStatement = SQL`
SELECT id, title, json_build_object(
             'type', 'FeatureCollection',
             'features', json_agg(ST_asGeoJSON(t.geog)::json)
             ) as geojson
    FROM (select id, title, geog from invasivesbc.admin_defined_shapes where visible is true and created_by = $1) as t group by title, id;
  `;

  sqlStatement.values = [user_id];
  return sqlStatement;
};
