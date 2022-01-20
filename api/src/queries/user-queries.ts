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

export const getUserByIDIRSQL = (idir_userid: string): SQLStatement => {
  return SQL`
    SELECT * FROM application_user WHERE idir_userid = ${idir_userid};
  `;
};

export const getUserByBCEIDSQL = (bceid_userid: string): SQLStatement => {
  return SQL`
    SELECT * FROM application_user WHERE bceid_userid = ${bceid_userid};
  `;
};

export const renewUserSQL = (userId: string): SQLStatement => {
  const today = new Date();
  const expiryDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toUTCString();
  return SQL`
    UPDATE application_user SET
      expiry_date = ${expiryDate}
    WHERE user_id = ${parseInt(userId)};
  `;
};
