import { SQL, SQLStatement } from 'sql-template-strings';

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
  console.log('UserType: ' + userType + ' ID: ' + id + ' Username: ' + username + ' Email: ' + email);
  switch (userType) {
    case 'idir':
      try {
        const returnVal = SQL`
        insert into application_user (idir_userid, preferred_username, email, activation_status) values (${id}, ${username}, ${email}, 0) on conflict (idir_userid) where idir_userid is not null do nothing;
      `;
        return returnVal;
      } catch (e) {
        console.log(JSON.stringify(e));
      }
      break;
    case 'bceid':
      try {
        const returnVal = SQL`
        insert into application_user (bceid_userid, preferred_username, email, activation_status) values (${id}, ${username}, ${email}, 0) on conflict (bceid_userid) where bceid_userid is not null do nothing;
      `;
        return returnVal;
      } catch (e) {
        console.log(JSON.stringify(e));
      }
      break;
    default:
      break;
  }
};
