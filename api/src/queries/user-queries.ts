import { SQL, SQLStatement } from 'sql-template-strings';
import { CustomError } from 'middleware/globalErrorHandler';
import { KeycloakAccountType } from 'utils/auth-utils';

/**
 * SQL query to fetch users.
 *
 * @returns {SQLStatement} sql query object
 */
export const getUsersSQL = (): SQLStatement => {
  return SQL`
    SELECT au.*, STRING_AGG(ur.role_description, ', ') as role
    FROM application_user au
    LEFT JOIN user_access rl
    ON rl.user_id = au.user_id
    LEFT JOIN user_role ur
    ON rl.role_id = ur.role_id
    GROUP BY au.user_id;
  `;
};

/**
 * @desc Sql for limited information regarding users.
 */
export const getSanitizedUsersForAutofillSQL = (): SQLStatement => {
  return SQL`
  SELECT
    first_name,
    last_name,
    pac_number,
    pac_service_number_1,
    pac_service_number_2
  FROM application_user
  WHERE account_status = 1;
  `;
};

export const getUserByIDIRSQL = (idir_userid: string): SQLStatement => {
  return SQL`
    SELECT *
    FROM application_user
    WHERE idir_userid = ${idir_userid};
  `;
};

export const getUserByBCEIDSQL = (bceid_userid: string): SQLStatement => {
  return SQL`
    SELECT *
    FROM application_user
    WHERE bceid_userid = ${bceid_userid};
  `;
};

export const renewUserSQL = (userId: string): SQLStatement => {
  const today = new Date();
  const expiryDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toUTCString();
  return SQL`
    UPDATE application_user
    SET expiry_date = ${expiryDate}
    WHERE user_id = ${parseInt(userId)};
  `;
};

/**
 * @desc Fetches user from token, includes users roles.
 *       If user does not exist, create new user and return new row
 */
export const processTokenSQL = (params: {
  userType: KeycloakAccountType;
  id: string;
  username: string;
  email: string;
}): SQLStatement => {
  const { userType, id, username, email } = params;

  const userTypeCol = (() => {
    if (userType === KeycloakAccountType.bceid) return 'bceid_userid';
    else if (userType === KeycloakAccountType.idir) return 'idir_userid';
    else throw new CustomError('Invalid userType', 400);
  })();

  // Cannot interpolate Tables/Columns, so broken into multiple append commands as raw value.
  return SQL`
    WITH existing AS (
    SELECT *, false as new_user -- User exists, no insert required
    FROM application_user WHERE `
    .append(userTypeCol)
    .append(
      SQL` = ${id}
    ),
    inserted AS (
      INSERT INTO application_user (`
    )
    .append(userTypeCol).append(SQL`, preferred_username, email, activation_status)
      SELECT ${id}, ${username}, ${email}, 0
      WHERE NOT EXISTS (SELECT 1 FROM existing)
      RETURNING *, true AS new_user -- New User created as result of query
    ),
    user_row AS (
      SELECT * FROM inserted
      UNION ALL
      SELECT * FROM existing
      LIMIT 1
    )
    SELECT
      u.*,
      (
        SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'role_id', ua.role_id,
            'role_name', ur.role_name,
            'role_description', ur.role_description
          )
      ), '[]'
          )
        FROM user_access ua
        INNER JOIN user_role ur ON ua.role_id = ur.role_id
        WHERE ua.user_id = u.user_id
      ) AS roles
    FROM user_row u
    LEFT JOIN user_access ua ON ua.user_id = u.user_id
    LEFT JOIN user_role ur ON ua.role_id = ur.role_id
  `);
};
