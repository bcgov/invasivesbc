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
    ) ON CONFLICT DO NOTHING;
  `;
  }

};

export const grantRoleByValueSQL = (email, role_value): SQLStatement => {
  if (!email || !role_value) {
    return null;
  } else {
    return SQL`
    INSERT INTO user_access (user_id, role_id) VALUES (
        (SELECT user_id from application_user WHERE email = ${email}),
        (SELECT role_id FROM user_role WHERE role_name = ${role_value})
    ) ON CONFLICT DO NOTHING;
  `;
  }
};

export const revokeAllRolesExceptAdmin = (userId): SQLStatement => {
  if (!userId) {
    return null;
  } else {
    const sql = SQL`
        DELETE FROM user_access
        WHERE user_id = ${userId}
        AND role_id != 18
        AND role_id != 1
        AND role_id != 2;
    `;
    return sql;
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
    const sql = SQL`
        DELETE FROM user_access
        WHERE user_id = ${user_id}
        AND role_id = ${role_id};
    `;
    return sql;
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
    const sql = SQL`
      select
        user_access.role_id,
        user_role.role_name,
        user_role.role_description
      from
        user_access
      inner join
        user_role
      on
        user_access.role_id = user_role.role_id
      where
        user_access.user_id=${user_id};
    `;
    return sql;
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
    const sql = SQL`
      select
        user_access.user_id,
        application_user.first_name,
        application_user.last_name,
        application_user.email,
        application_user.preferred_username,
        application_user.account_status,
        application_user.activation_status,
        application_user.activation_status
      from
        user_access
      inner join
        application_user
      on
        user_access.user_id = application_user.user_id
      where
        user_access.role_id=${role_id};
    `;
    return sql;
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

/**
 * SQL query to get all roles
 * @returns {SQLStatement} sql query object
 */
export const getAllRolesSQL = (): SQLStatement => {
  return SQL`
    SELECT *
    FROM user_role;
  `;
};

/**
 * SQL query to get metabase groups to be associated with each user
 * @returns {SQLStatement} sql query object
 */
export const getMetabaseGroupsSQL = (): SQLStatement => {
  return SQL`
    select u.email,
           array_remove(array_agg(distinct r.metabase_group),NULL) as metabase_groups
    from user_access ua left join application_user u on ua.user_id=u.user_id inner join user_role r on ua.role_id = r.role_id
    group by u.email
    order by u.email asc;
  `;
};
