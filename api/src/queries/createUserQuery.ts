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
  console.log('here');
  switch (userType) {
    case 'idir':
      console.log('there');
      try {
        const returnVal = SQL`
        insert into application_user (idir_userid, preferred_username, email) values (${id}, ${username}, ${email}) on conflict (idir_userid) do nothing;
      `;
        console.log('all good here');
        return returnVal;
      } catch (e) {
        console.log('the problem: ');
        console.log(JSON.stringify(e));
      }
    default:
      break;
  }
};
