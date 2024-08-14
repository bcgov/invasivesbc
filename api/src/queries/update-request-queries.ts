import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch an access request and their associated role.
 *
 * @param {string} email user email
 * @returns {SQLStatement} sql query object
 */
export const getUpdateRequestsSQL = (): SQLStatement => {
  return SQL`SELECT * FROM access_request where request_type = 'UPDATE';`;
};

/**
 * SQL query to fetch an access request based on email.
 * @param email The user's email
 * @returns The user with that email
 */
export const getUpdateRequestForUserSQL = (username: string, email?: string): SQLStatement => {
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
      ? SQL`SELECT * FROM access_request WHERE idir_account_name=${username} AND primary_email = ${email} AND request_type = 'UPDATE';`
      : SQL`SELECT * FROM access_request WHERE bceid_account_name=${username} AND primary_email = ${email} AND request_type = 'UPDATE';`;
  } else {
    return isIdir
      ? SQL`SELECT * FROM access_request WHERE idir_account_name=${username} AND request_type = 'UPDATE';`
      : SQL`SELECT * FROM access_request WHERE bceid_account_name=${username} AND request_type = 'UPDATE';`;
  }
};

/**
 * @desc SQL Statement for confirming a user exists.
 * @param id User ID 'example@idir'
 */
export const doesUserExistSQL = (id: string): SQLStatement =>
  SQL`
    SELECT user_id
    FROM application_user
    WHERE (idir_account_name = LOWER(${id})
    OR bceid_account_name = LOWER(${id}))
    AND activation_status = 1;
  `;

export function appendNRQ(input: string) {
  if (input)
    if (input.indexOf('NRQ') == -1) return input + ',NRQ';
    else return input;
  return 'NRQ';
}

/**
 * @param username Identity submitted for an update request
 * @returns All pending rows associated with a user
 */
export const userHasPendingUpdateRequestSQL = (username: string): SQLStatement => {
  return SQL`
    SELECT access_request_id
    FROM access_request
    WHERE request_type = 'UPDATE'
    AND status = 'NOT_APPROVED'
    AND (
      idir_account_name=${username}
      OR
      bceid_account_name=${username}
    )
  `;
};

export const updateUpdateRequestSQL = (
  access_request_id: string,
  newUpdateRequest: Record<string, any>
): SQLStatement => {
  console.log(access_request_id);
  return SQL`
    UPDATE access_request
    SET 
      first_name = ${newUpdateRequest.firstName ? newUpdateRequest.firstName : null},
      last_name = ${newUpdateRequest.lastName ? newUpdateRequest.lastName : null},
      primary_email = ${newUpdateRequest.email ? newUpdateRequest.email : null},
      work_phone_number = ${newUpdateRequest.phone ? newUpdateRequest.phone : null},
      funding_agencies = ${appendNRQ(newUpdateRequest.fundingAgencies ?? null)},
      employer = ${appendNRQ(newUpdateRequest?.employer)},
      pac_number = ${newUpdateRequest.pacNumber ? newUpdateRequest.pacNumber : null},
      pac_service_number_1 = ${newUpdateRequest.psn1 ? newUpdateRequest.psn1 : null},
      pac_service_number_2 = ${newUpdateRequest.psn2 ? newUpdateRequest.psn2 : null},
      requested_roles = ${newUpdateRequest.requestedRoles ? newUpdateRequest.requestedRoles : null},
      comments = ${newUpdateRequest.comments ? newUpdateRequest.comments : null},
      updated_at = CURRENT_TIMESTAMP
    WHERE access_request_id = ${access_request_id}
    AND status = 'NOT_APPROVED'
  `;
};
/**
 * SQL query to create an access request.
 *
 * @returns {SQLStatement} sql query object
 */
export const createUpdateRequestSQL = (updateRequest): SQLStatement => {
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
        ${updateRequest.idir ? updateRequest.idir : null},
        ${updateRequest.bceid ? updateRequest.bceid : null},
        ${updateRequest.firstName ? updateRequest.firstName : null},
        ${updateRequest.lastName ? updateRequest.lastName : null},
        ${updateRequest.email ? updateRequest.email : null},
        ${updateRequest.phone ? updateRequest.phone : null},
        ${appendNRQ(updateRequest.fundingAgencies)},
        ${appendNRQ(updateRequest.employer)},
        ${updateRequest.pacNumber ? updateRequest.pacNumber : null},
        ${updateRequest.psn1 ? updateRequest.psn1 : null},
        ${updateRequest.psn2 ? updateRequest.psn2 : null},
        ${updateRequest.requestedRoles ? updateRequest.requestedRoles : null},
        ${updateRequest.comments ? updateRequest.comments : ''},
        'NOT_APPROVED',
        ${updateRequest.idirUserId ? updateRequest.idirUserId : null},
        ${updateRequest.bceidUserId ? updateRequest.bceidUserId : null},
        'UPDATE'
    )
    on conflict (idir_userid, bceid_userid) do nothing;
  `; // TODO: Maybe change line above?
};

/**
 * SQL query to update an access request's status
 */
export const updateUpdateRequestStatusSQL = (email, status): SQLStatement => {
  return SQL`
        update access_request
        set
        status=${status},
        updated_at=CURRENT_TIMESTAMP
        where primary_email=${email};
    `;
};

export const declineUpdateRequestSQL = (email): SQLStatement => {
  return SQL`
        update access_request
        set
        status='DECLINED',
        updated_at=CURRENT_TIMESTAMP
        where primary_email=${email};
    `;
};

export const approveUpdateRequestsSQL = (updateRequest): SQLStatement => {
  let preferredUsername = '';
  const today = new Date();
  const expiryDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  if (updateRequest.idir !== (null || '')) {
    preferredUsername = updateRequest.idir_account_name;
  } else if (updateRequest.bceid !== (null || '')) {
    preferredUsername = updateRequest.bceid_account_name;
  } else {
    preferredUsername = updateRequest.primary_email;
  }
  return SQL`
        update application_user
        set
            first_name=${updateRequest.first_name},
            last_name=${updateRequest.last_name},
            email=${updateRequest.primary_email},
            preferred_username=${preferredUsername},
            account_status=1,
            expiry_date=${expiryDate.toUTCString()},
            updated_at=CURRENT_TIMESTAMP,
            idir_account_name=${updateRequest.idir_account_name},
            bceid_account_name=${updateRequest.bceid_account_name},
            work_phone_number=${updateRequest.work_phone_number},
            funding_agencies=${updateRequest.funding_agencies},
            employer=${updateRequest.employer},
            pac_number=${updateRequest.pac_number},
            pac_service_number_1=${updateRequest.pac_service_number_1},
            pac_service_number_2=${updateRequest.pac_service_number_2}
            where (bceid_userid is not null and bceid_userid=${
              updateRequest.bceid_userid
            }) OR (idir_userid is not null and idir_userid=${updateRequest.idir_userid});
    `;
};
