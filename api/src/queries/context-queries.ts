import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL insert for inserting the distance to the closest
 *
 * @param {string} email user email
 * @returns {SQLStatement} sql query object
 */
export const insertWellDistanceSQL = (well: any): SQLStatement => {
  if (!well) {
    return null;
  }

  return SQL`
    update activity_incoming_data
    set well_proximity = round(${well.distance},0)
    where activity_id = ${well.id}
  `;
};
