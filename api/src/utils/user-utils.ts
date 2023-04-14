import { getRolesForUserSQL } from '../queries/role-queries';
import { SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../database/db';
import { getUserByBCEIDSQL, getUserByIDIRSQL, createUserSQL } from '../queries/user-queries';
import { getLogger } from './logger';
import { RequestHandler } from 'express';
import { InvasivesRequest } from './auth-utils';

const defaultLog = getLogger('user-utils');

export enum KeycloakAccountType {
  idir = 'idir',
  bceid = 'bceid'
}

export async function createUser(keycloakToken: any, accountType, id): Promise<any> {
  defaultLog.debug({
    message: 'Keycloak token in user-utils',
    params: {
      keycloakToken
    }
  });

  const connection = await getDBConnection();
  if (!connection) {
    defaultLog.error('No connection!');
    throw {
      code: 503,
      message: 'Failed to establish database connection',
      namespace: 'user-utils'
    };
  }
  try {
    const sqlStatement: SQLStatement = createUserSQL(
      accountType,
      id,
      keycloakToken.preferred_username,
      keycloakToken.email
    );
    defaultLog.debug({
      message: 'SQL statement to create user',
      sqlStatement
    });
    if (!sqlStatement) {
      throw {
        code: 500,
        message: 'Failed to generate SQL statement',
        namespace: 'user-utils'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    return result;
  } catch (error) {
    defaultLog.debug({ label: 'create', message: 'error', error });
    throw {
      code: 500,
      message: 'Failed to create user',
      namespace: 'user-utils'
    };
  } finally {
    connection.release();
  }
}

export async function getUserByKeycloakID(accountType: KeycloakAccountType, id: string) {
  defaultLog.debug({ label: '{' + accountType + '}', message: 'getUserByKeycloakID' });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      code: 503,
      message: 'Failed to establish database connection',
      namespace: 'user-utils'
    };
  }
  try {
    const sqlStatement: SQLStatement =
      accountType === KeycloakAccountType.idir ? getUserByIDIRSQL(id) : getUserByBCEIDSQL(id);
    if (!sqlStatement) {
      throw {
        code: 400,
        message: 'Failed to build SQL statement',
        namespace: 'user-utils'
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
    defaultLog.debug({ label: 'getUserByKeycloakID', message: 'error', error });
    throw {
      code: 500,
      message: 'Failed to get user by Keycloak ID',
      namespace: 'user-utils'
    };
  } finally {
    connection.release();
  }
}

export async function getRolesForUser(userId) {
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      code: 503,
      message: 'Failed to establish database connection',
      namespace: 'user-utils'
    };
  }
  try {
    const sqlStatement: SQLStatement = getRolesForUserSQL(userId);
    if (!sqlStatement) {
      throw {
        code: 400,
        message: 'Failed to build SQL statement',
        namespace: 'user-utils'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    return result;
  } catch (error) {
    defaultLog.debug({ label: 'getRolesForUser', message: 'error', error });
    throw {
      code: 500,
      message: 'Failed to get roles for user',
      namespace: 'user-utils'
    };
  } finally {
    connection.release();
  }
}
