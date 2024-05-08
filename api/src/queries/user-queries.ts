import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('user-queries');

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

export enum userTypeEnum {
  idir = 'idir',
  bceid = 'bceid',
  bceid_business = 'bceid_business'
}

/**
 * SQL statement to create users.
 *
 * @returns {SQLStatement} sql query object
 */
export const createUserSQL = (userType: string, id: string, username: string, email: string): SQLStatement => {
  defaultLog.debug({
    message: 'create user SQL params',
    params: {
      userType,
      id,
      username,
      email
    }
  });
  switch (userType) {
    case 'idir':
      try {
        const returnVal = SQL`
        insert into application_user (idir_userid, preferred_username, email, activation_status) values (${id}, ${username}, ${email}, 0) on conflict (idir_userid) where idir_userid is not null do nothing;
      `;
        return returnVal;
      } catch (e) {
        defaultLog.error({ error: e });
      }
      break;
    case 'bceid':
      try {
        const returnVal = SQL`
        insert into application_user (bceid_userid, preferred_username, email, activation_status) values (${id}, ${username}, ${email}, 0) on conflict (bceid_userid) where bceid_userid is not null do nothing;
      `;
        return returnVal;
      } catch (e) {
        defaultLog.error({ error: e });
      }
      break;
    default:
      break;
  }
};
