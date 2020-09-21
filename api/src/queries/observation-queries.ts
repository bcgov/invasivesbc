import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch all plant observations.
 *
 * @returns {SQLStatement} sql query object
 */
export const getAllObservationPlantSQL = (): SQLStatement => SQL`SELECT * FROM observation;`;

/**
 * SQL query to fetch a single plant observation.
 *
 * @param {string} observationId observation primary key
 * @returns {SQLStatement} sql query object
 */
export const getSingleObservationPlantSQL = (observationId: string): SQLStatement => {
  if (!observationId) {
    return null;
  }

  return SQL`SELECT * FROM observation WHERE observation_id = ${observationId};`;
};
