import { SQL, SQLStatement } from 'sql-template-strings';
import { appendNRQ } from './update-request-queries';

/**
 * SQL query to fetch an access request and their associated role.
 *
 * @param {string} email user email
 * @returns {SQLStatement} sql query object
 */
export const getAccessRequestsSQL = (): SQLStatement => {
  return SQL`SELECT * FROM access_request;`;
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
      ? SQL`SELECT * FROM access_request WHERE idir_account_name=${username} AND primary_email = ${email} AND status = 'APPROVED' order by updated_at desc;`
      : SQL`SELECT * FROM access_request WHERE bceid_account_name=${username} AND primary_email = ${email} AND status = 'APPROVED' order by updated_at desc;`;
  } else {
    return isIdir
      ? SQL`SELECT * FROM access_request WHERE idir_account_name=${username} AND status = 'APPROVED' order by updated_at desc;`
      : SQL`SELECT * FROM access_request WHERE bceid_account_name=${username} AND status = 'APPROVED' order by updated_at desc;`;
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
        bceid_userid,
        request_type
    )
    values(
        ${accessRequest.idir ? accessRequest.idir : null},
        ${accessRequest.bceid ? accessRequest.bceid : null},
        ${accessRequest.firstName ? accessRequest.firstName : null},
        ${accessRequest.lastName ? accessRequest.lastName : null},
        ${accessRequest.email ? accessRequest.email : null},
        ${accessRequest.phone ? accessRequest.phone : null},
        ${appendNRQ(accessRequest.fundingAgencies)},
        ${appendNRQ(accessRequest.employer)},
        ${accessRequest.pacNumber ? accessRequest.pacNumber : null},
        ${accessRequest.psn1 ? accessRequest.psn1 : null},
        ${accessRequest.psn2 ? accessRequest.psn2 : null},
        ${accessRequest.requestedRoles ? accessRequest.requestedRoles : null},
        ${accessRequest.comments ? accessRequest.comments : ''},
        ${accessRequest.status},
        ${accessRequest.idirUserId ? accessRequest.idirUserId : null},
        ${accessRequest.bceidUserId ? accessRequest.bceidUserId : null},
        'ACCESS'
    )
    on conflict (idir_userid, bceid_userid) do nothing;
  `;

};

/**
 * SQL query to update an access request's status
 */
export const updateAccessRequestStatusSQL = (email, status, access_request_id): SQLStatement => {
  return SQL`
        update access_request
        set
        status=${status},
        updated_at=CURRENT_TIMESTAMP
        where primary_email=${email}
        AND access_request_id=${access_request_id};
    `;
};

export const declineAccessRequestSQL = (email): SQLStatement => {
  return SQL`
        update access_request
        set
        status='DECLINED',
        updated_at=CURRENT_TIMESTAMP
        where primary_email=${email}
        AND request_type != 'UPDATE';
    `;
};

export const approveAccessRequestsSQL = (accessRequest): SQLStatement => {
  let preferredUsername = '';
  const today = new Date();
  const expiryDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  if (accessRequest.idir !== (null || '')) {
    preferredUsername = accessRequest.idir_account_name;
  } else if (accessRequest.bceid !== (null || '')) {
    preferredUsername = accessRequest.bceid_account_name;
  } else {
    preferredUsername = accessRequest.primary_email;
  }
  return SQL`
        update application_user
        set
            first_name=${accessRequest.first_name},
            last_name=${accessRequest.last_name},
            email=${accessRequest.primary_email},
            preferred_username=${preferredUsername},
            account_status=1,
            expiry_date=${expiryDate.toUTCString()},
            activation_status=1,
            created_at=CURRENT_TIMESTAMP,
            updated_at=CURRENT_TIMESTAMP,
            idir_account_name=${accessRequest.idir_account_name},
            bceid_account_name=${accessRequest.bceid_account_name},
            work_phone_number=${accessRequest.work_phone_number},
            funding_agencies=${accessRequest.funding_agencies},
            employer=${accessRequest.employer},
            pac_number=${accessRequest.pac_number},
            pac_service_number_1=${accessRequest.pac_service_number_1},
            pac_service_number_2=${accessRequest.pac_service_number_2}
            where (bceid_userid is not null and bceid_userid=${accessRequest.bceid_userid
    }) OR (idir_userid is not null and idir_userid=${accessRequest.idir_userid});
    `;
};
