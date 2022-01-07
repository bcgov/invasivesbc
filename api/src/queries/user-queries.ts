import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch users.
 *
 * @returns {SQLStatement} sql query object
 */
export const getUsersSQL = (): SQLStatement => {
  return SQL`
    SELECT * FROM application_user;
  `;
};
