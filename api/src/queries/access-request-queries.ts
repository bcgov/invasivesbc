import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch an access request and their associated role.
 *
 * @param {string} email user email
 * @returns {SQLStatement} sql query object
 */
export const getAccessRequestsSQL = (): SQLStatement => {
  return SQL`SELECT * FROM access_request where status='NOT_APPROVED';`;
};

/**
 * SQL query to fetch an access request based on email.
 * @param email The user's email
 * @returns The user with that email
 */
export const getAccessRequestForUserSQL = (username: string, email?: string): SQLStatement => {
  if (!username) {
    return null;
  }

  let isIdir;

  if (username.includes('idir')) {
    isIdir = true;
  } else {
    isIdir = false;
  }

  if (email) {
    return isIdir
      ? SQL`SELECT * FROM access_request WHERE idir_account_name=${username} AND primary_email = ${email};`
      : SQL`SELECT * FROM access_request WHERE bceid_account_name=${username} AND primary_email = ${email};`;
  } else {
    return isIdir
      ? SQL`SELECT * FROM access_request WHERE idir_account_name=${username};`
      : SQL`SELECT * FROM access_request WHERE bceid_account_name=${username};`;
  }
};

/**
 * SQL query to create an access request.
 *
 * @returns {SQLStatement} sql query object
 */
export const createAccessRequestSQL = (accessRequest): SQLStatement => {
  return SQL`
    INSERT INTO access_request (
        idir_account_name,
        bceid_account_name,
        first_name,
        last_name,
        primary_email,
        work_phone_number,
        funding_agencies,
        employer,
        pac_number,
        pac_service_number_1,
        pac_service_number_2,
        requested_roles,
        comments,
        status,
        idir_userid,
        bceid_userid
    )
    VALUES (
        ${accessRequest.idir ? accessRequest.idir : null},
        ${accessRequest.bceid ? accessRequest.bceid : null},
        ${accessRequest.firstName ? accessRequest.firstName : null},
        ${accessRequest.lastName ? accessRequest.lastName : null},
        ${accessRequest.email ? accessRequest.email : null},
        ${accessRequest.phone ? accessRequest.phone : null},
        ${accessRequest.fundingAgencies ? accessRequest.fundingAgencies : null},
        ${accessRequest.employer ? accessRequest.employer : null},
        ${accessRequest.pacNumber ? accessRequest.pacNumber : null},
        ${accessRequest.psn1 ? accessRequest.psn1 : null},
        ${accessRequest.psn2 ? accessRequest.psn2 : null},
        ${accessRequest.requestedRoles ? accessRequest.requestedRoles : null},
        ${accessRequest.comments ? accessRequest.comments : ''},
        ${accessRequest.status},
        ${accessRequest.idirUserId ? accessRequest.idirUserId : null},
        ${accessRequest.bceidUserId ? accessRequest.bceidUserId : null}
    );
  `;
};

/**
 * SQL query to update an access request's status
 */
export const updateAccessRequestStatusSQL = (email, status): SQLStatement => {
  return SQL`
        update access_request
        set
        status=${status},
        updated_at=now()
        where primary_email=${email}
    `;
};
