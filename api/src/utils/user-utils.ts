import { SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../database/db';
import { getUserByBCEIDSQL, getUserByIDIRSQL } from '../queries/user-queries';
import { getLogger } from './logger';

const defaultLog = getLogger('user-utils');

export async function getUserByBCEID(bceid) {
  defaultLog.debug({ label: '{bceid}', message: 'getUserByBCEID' });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = getUserByBCEIDSQL(bceid);
    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    if (result) {
      return result[0];
    } else {
      return null;
    }
  } catch (error) {
    defaultLog.debug({ label: 'getUserByBCEID', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}

export async function getUserByIDIR(idir) {
  defaultLog.debug({ label: '{bceid}', message: 'getUserByIDIR' });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = getUserByIDIRSQL(idir);
    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    if (result) {
      return result[0];
    } else {
      return null;
    }
  } catch (error) {
    defaultLog.debug({ label: 'getUserByIDIR', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}
