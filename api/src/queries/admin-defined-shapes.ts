import {SQL, SQLStatement} from 'sql-template-strings';
import {PointOfInterestPostRequestBody, PointOfInterestSearchCriteria} from '../models/point-of-interest';

/**
 * SQL query to fetch administratively-defined shapes (from uploaded KML) for display
 *
 * @returns {SQLStatement} sql query object
 */
export const getAdministrativelyDefinedShapesSQL = () => {
  const sqlStatement: SQLStatement = SQL`
    SELECT json_build_object(
             'type', 'FeatureCollection',
             'features', json_agg(ST_AsGeoJSON(t.*)::json)
             ) as geojson
    FROM (select id, geog from admin_defined_shapes where visible is true) as t;
  `;
  return sqlStatement;
};
