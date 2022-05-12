import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../utils/logger';
const defaultLog = getLogger('point-of-interest');

/**
 * SQL query to insert a new point_of_interest, and return the inserted record.
 *
 * @returns {SQLStatement} sql query object
 */
export const getJurisdictionsSQL = (): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT jurisdiction AS description, code FROM iapp_jurisdictions;`;

  return sqlStatement;
};
