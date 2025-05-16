import { SQLStatement } from 'sql-template-strings';
import { getLogger } from 'utils/logger';
import { getBetaAccessForUserSQL, getPermissionsForUser, getRolesForUserSQL } from 'queries/role-queries';
import { getDBConnection } from 'database/db';
import { createUserSQL, getUserByBCEIDSQL, getUserByIDIRSQL } from 'queries/user-queries';
import { PoolClient } from 'pg';

const defaultLog = getLogger('user-utils');

export enum KeycloakAccountType {
  idir = 'idir',
  bceid = 'bceid'
}
const rejectWithErr = (issue: string, code: number = 401) =>
  new Error(issue, {
    cause: {
      code: code,
      message: issue,
      namespace: 'user-utils'
    }
  });

export async function createUser(keycloakToken: any, accountType, id): Promise<any> {
  defaultLog.debug({ message: 'Keycloak token in user-utils', params: { keycloakToken } });
  let connection: PoolClient | undefined;

  try {
    connection = await getDBConnection();
    const sqlStatement: SQLStatement = createUserSQL(
      accountType,
      id,
      keycloakToken.preferred_username,
      keycloakToken.email
    );
    defaultLog.debug({ message: 'SQL statement to create user', sqlStatement });
    if (!sqlStatement) throw rejectWithErr('Failed to generate SQL statement', 500);

    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = response?.rows;

    return result;
  } catch (error) {
    defaultLog.debug({ label: 'create', message: 'error', error });
    throw rejectWithErr('Failed to create user', 500);
  } finally {
    connection?.release();
  }
}

export async function getUserByKeycloakID(accountType: KeycloakAccountType, id: string) {
  defaultLog.debug({ label: `{${accountType}}`, message: 'getUserByKeycloakID' });
  let connection: PoolClient | undefined;

  try {
    connection = await getDBConnection();
    if (!connection) throw rejectWithErr('Failed to establish database connection', 503);

    const sqlStatement: SQLStatement =
      accountType === KeycloakAccountType.idir ? getUserByIDIRSQL(id) : getUserByBCEIDSQL(id);
    if (!sqlStatement) throw rejectWithErr('Failed to build SQL statement', 400);

    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = response?.rows;
    return result?.[0];
  } catch (error) {
    defaultLog.debug({ label: 'getUserByKeycloakID', message: 'error', error });
    return rejectWithErr('Failed to get user by Keycloak ID', 500);
  } finally {
    connection?.release();
  }
}

export async function getRolesForUser(userId) {
  let connection: PoolClient | undefined;

  try {
    connection = await getDBConnection();
    if (!connection) throw rejectWithErr('Failed to establish database connection', 503);

    const rolesStatement: SQLStatement = getRolesForUserSQL(userId);
    if (!rolesStatement) throw rejectWithErr('Failed to build SQL statement', 400);

    const roleResponse = await connection.query(rolesStatement.text, rolesStatement.values);
    return { roles: roleResponse?.rows };
  } catch (error) {
    defaultLog.debug({ label: 'getRolesForUser', message: 'error', error });
    return rejectWithErr('Failed to get roles for user', 500);
  } finally {
    connection?.release();
  }
}

export async function getV2BetaAccessForUser(userId) {
  let connection: PoolClient | undefined;
  try {
    connection = await getDBConnection();
    if (!connection) throw rejectWithErr('Failed to establish database connection', 503);
    const sqlStatement: SQLStatement = getBetaAccessForUserSQL(userId);
    if (!sqlStatement) throw rejectWithErr('Failed to build SQL statement', 400);

    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    defaultLog.debug({ label: 'getBetaAccessForUserSQL', message: 'v2access', response });

    const result = !!response?.rows?.[0]?.v2beta;
    return result;
  } catch (error) {
    defaultLog.debug({ label: 'getBetaAccessForUserSQL', message: 'error', error });
    return rejectWithErr('Failed getBetaAccessForUserSQL', 500);
  } finally {
    connection?.release();
  }
}
