import { getDBConnection } from 'database/db';
import { CustomError } from 'middleware/globalErrorHandler';
import { PoolClient } from 'pg';
import { SQLStatement } from 'sql-template-strings';

/**
 * For this handler to operate effectively, the API route must take the 'next' param.
 * @summary DRY handler for DB requests.
 * @param   sqlStatement Sql to be executed
 * @param   caller_name Name of the function calling genericDbRequest (used for logging/error handling)
 * @returns Database response
 */
const commonDbRequest = async (sqlStatement: SQLStatement) => {
  let connection: PoolClient;
  try {
    connection = await getDBConnection();
    return await connection.query(sqlStatement.text, sqlStatement.values);
  } catch (e) {
    throw new CustomError(e?.message || 'Connection Refused', 503);
  } finally {
    connection?.release();
  }
};

export default commonDbRequest;
