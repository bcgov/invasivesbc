import { ErrorPostRequestBody } from '../models/error.js';
import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to save error
 *
 * @param {ErrorPostRequestBody} searchCriteria
 * @returns {SQLStatement} sql query object
 */

export const saveErrorSQL = (searchCriteria: ErrorPostRequestBody): SQLStatement => {
  const sqlStatement: SQLStatement = SQL``;

  if (searchCriteria.error) {
    sqlStatement.append(SQL`
    insert into invasivesbc.error_log (error, client_state, created_by, created_by_with_guid) values (${searchCriteria.error}, ${searchCriteria.clientState}, ${searchCriteria.created_by}, ${searchCriteria.created_by_with_guid});
  `);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};
