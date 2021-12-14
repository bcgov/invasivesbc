import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch an access request and their associated role.
 *
 * @param {string} email user email
 * @returns {SQLStatement} sql query object
 */
export const getAccessRequestsSQL = (): SQLStatement => {
  return SQL`SELECT * FROM access_request where status='Awaiting Approval';`;
};

/**
 * SQL query to fetch an access request based on email.
 * @param email The user's email
 * @returns The user with that email
 */
export const getAccessRequestForUserSQL = (email: string): SQLStatement => {
  if (!email) {
    return null;
  }
  return SQL`SELECT * FROM access_request WHERE primary_email = ${email};`;
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
        pac_number,
        pac_service_number_1,
        pac_service_number_2,
        status
    )
    VALUES (
        ${accessRequest.idir ? accessRequest.idir : null},
        ${accessRequest.bceid ? accessRequest.bceid : null},
        ${accessRequest.firstName},
        ${accessRequest.lastName},
        ${accessRequest.email},
        ${accessRequest.phone},
        ${accessRequest.fundingAgencies},
        ${accessRequest.pacNumber},
        ${accessRequest.psn1},
        ${accessRequest.psn2},
        ${accessRequest.status}
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
