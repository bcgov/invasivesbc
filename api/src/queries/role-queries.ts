import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to grant a role to a user id.
 * @param {number} userId user id
 * @param {number} roleId role id
 * @returns {SQLStatement} sql query object
 */
export const grantRoleToUserSQL = (user_id, role_id): SQLStatement => {
  if (!user_id || !role_id) {
    return null;
  } else {
    return SQL`
    INSERT INTO user_access (user_id, role_id) VALUES (
        ${user_id},
        ${role_id}
    );
  `;
  }
};

/**
 * SQL query to revoke a role from a user.
 *
 * @returns {SQLStatement} sql query object
 */
export const revokeRoleFromUserSQL = (user_id, role_id): SQLStatement => {
  if (!user_id || !role_id) {
    return null;
  } else {
    return SQL`
        DELETE FROM user_access
        WHERE user_id = ${user_id}
        AND role_id = ${role_id};
    `;
  }
};

/**
 * SQL query to get roles for a given user id
 * @param user_id the user id of the user
 * @returns {SQLStatement} sql query object
 */
export const getRolesForUserSQL = (user_id): SQLStatement => {
  if (!user_id) {
    return null;
  } else {
    return SQL`
        SELECT role_id
        FROM user_access
        WHERE user_id = ${user_id};
    `;
  }
};

/**
 * SQl query to get all users associated to a role
 * @param role_id the role id
 * @returns {SQLStatement} sql query object
 */
export const getUsersForRoleSQL = (role_id): SQLStatement => {
  if (!role_id) {
    return null;
  } else {
    return SQL`
        SELECT user_id
        FROM user_access
        WHERE role_id = ${role_id};
    `;
  }
};

/**
 * SQL query to get description and name of a
 * @param role_id the role id
 * @returns {SQLStatement} sql query object
 */
export const getRoleInfoSQL = (role_id): SQLStatement => {
  if (!role_id) {
    return null;
  } else {
    return SQL`
        SELECT role_name, role_description
        FROM user_role
        WHERE role_id = ${role_id};
    `;
  }
};
