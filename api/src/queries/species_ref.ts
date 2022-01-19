import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to insert a new point_of_interest, and return the inserted record.
 *
 * @returns {SQLStatement} sql query object
 */
export const speciesRefSql = (): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select * from invasivesbc.species_ref;`;
  return sqlStatement;
};
