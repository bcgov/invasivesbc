import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch a user and their associated role.
 *
 * @param {string} email user email
 * @returns {SQLStatement} sql query object
 */
export const getUserWithRolesSQL = (email: string): SQLStatement => {
  if (!email) {
    return null;
  }

  return SQL`
    SELECT * FROM application_user au
    LEFT JOIN user_role ur
      USING (user_id)
    LEFT JOIN code cc
      ON cc.code_id = ur.role_code_id
    WHERE au.email = ${email.toLowerCase()};
  `;
};
