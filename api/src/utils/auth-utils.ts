'use strict';

import { decode, verify } from 'jsonwebtoken';
import JwksRsa, { JwksClient } from 'jwks-rsa';
import { SQLStatement } from 'sql-template-strings';
import { promisify } from 'util';
import { getDBConnection } from '../database/db';
import { getUserWithRolesSQL } from '../queries/user-queries';
import { getLogger } from './logger';

const defaultLog = getLogger('auth-utils');

const APP_CERTIFICATE_URL =
  process.env.APP_CERTIFICATE_URL || 'https://dev.oidc.gov.bc.ca/auth/realms/dfmlcg7z/protocol/openid-connect/certs';

const KEYCLOAK_CLIENT_ID = 'invasives-bc';

const TOKEN_IGNORE_EXPIRATION: boolean =
  process.env.TOKEN_IGNORE_EXPIRATION === 'true' ||
  process.env.NODE_ENV === 'dev' ||
  process.env.DB_HOST === 'localhost' ||
  false;

/**
 * Authenticate the current user against the current route.
 *
 * @param {*} req
 * @param {*} authOrSecDef
 * @param {*} token
 * @param {*} callback
 * @returns {*}
 */
export const authenticate = async function (req: any, scopes: string[]): Promise<any> {
  try {
    defaultLog.debug({ label: 'authenticate', message: 'authenticating user', scopes });

    if (!req.headers || !req.headers.authorization) {
      defaultLog.warn({ label: 'authenticate', message: 'token was null' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    const token = req.headers.authorization;

    defaultLog.debug({ label: 'authenticate', message: 'authenticating user', token });

    if (token.indexOf('Bearer ') !== 0) {
      defaultLog.warn({ label: 'authenticate', message: 'token did not have a bearer' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    // Validate the 'Authorization' header.
    // Authorization header should be a string with format: Bearer xxxxxx.yyyyyyy.zzzzzz
    const tokenString = token.split(' ')[1];

    if (!tokenString) {
      defaultLog.warn({ label: 'authenticate', message: 'token string was null' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    // Decode token without verifying signature
    const decodedToken = decode(tokenString, { complete: true, json: true });

    if (!decodedToken) {
      defaultLog.warn({ label: 'authenticate', message: 'decoded token was null' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    // Get token header kid
    const kid = decodedToken.header && decodedToken.header.kid;

    if (!decodedToken) {
      defaultLog.warn({ label: 'authenticate', message: 'decoded token header kid was null' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    const jwksClient: JwksClient = JwksRsa({ jwksUri: APP_CERTIFICATE_URL });

    const getSigningKeyAsync = promisify(jwksClient.getSigningKey);

    // Get signing key from certificate issuer
    const key = await getSigningKeyAsync(kid);

    if (!key) {
      defaultLog.warn({ label: 'authenticate', message: 'get signing key' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    const signingKey = key['publicKey'] || key['rsaPublicKey'];

    // Verify token using signing key
    const verifiedToken = verifyToken(tokenString, signingKey);

    if (!verifiedToken) {
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    defaultLog.debug({ label: 'verifyToken', message: 'verifiedToken', verifiedToken });

    // Add the verified token to the request for future use, if needed
    req.auth_payload = verifiedToken;

    // Verify that the user role(s) (from keycloak) align with the required roles for this endpoint (security scopes)
    // The user may have multiple roles, but this check only requires 1 role to match for successful authorization
    const areUserRolesValid = userHasValidRoles(scopes, verifiedToken['resource_access'][KEYCLOAK_CLIENT_ID].roles);

    if (!areUserRolesValid) {
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    return true;
  } catch (error) {
    defaultLog.warn({ label: 'authenticate', message: `unexpected error - ${error.message}`, error });
    throw {
      status: 401,
      message: 'Access Denied'
    };
  }
};

/**
 * Verify jwt token.
 *
 * @param {*} tokenString
 * @param {*} secretOrPublicKey
 * @returns {*} verifiedToken
 */
const verifyToken = function (tokenString: any, secretOrPublicKey: any): any {
  return verify(tokenString, secretOrPublicKey, { ignoreExpiration: TOKEN_IGNORE_EXPIRATION }, function (
    verificationError: any,
    verifiedToken: any
  ): any {
    if (verificationError) {
      defaultLog.warn({ label: 'verifyToken', message: 'jwt verification error', verificationError });
      return null;
    }

    // Verify that the token came from the expected issuer
    // Example: when running in prod, only accept tokens from `sso.pathfinder...` and not `sso-dev.pathfinder...`, etc
    if (!APP_CERTIFICATE_URL.includes(verifiedToken.iss)) {
      defaultLog.warn({
        label: 'verifyToken',
        message: 'jwt verification error: issuer mismatch',
        'found token issuer': verifiedToken.iss,
        'expected to be a substring of': APP_CERTIFICATE_URL
      });
      return null;
    }

    defaultLog.debug({ label: 'verifyToken', message: 'jwt verification success' });

    return verifiedToken;
  });
};

/**
 * Checks if at least one of the the userRoles matches one of the allowedRoles.
 *
 * @param {(string[] | string)} allowedRoles allowed user roles
 * @param {(string[] | string)} userRoles roles possessed by the user.
 * @returns {boolean} true if userRoles contains at least one of the allowdRoles, false otherwise.
 */
export const verifyUserRoles = function (allowedRoles: string[] | string, userRoles: string[] | string): boolean {
  if (!Array.isArray(allowedRoles)) {
    allowedRoles = [allowedRoles];
  }

  if (!Array.isArray(userRoles)) {
    userRoles = [userRoles];
  }

  for (const allowedRole of allowedRoles) {
    // if the user contains at least one of the allowedRoles, then return true
    if (userRoles.includes(allowedRole)) {
      return true;
    }
  }

  // user contains none of the allowedRoles, return false
  return false;
};

/**
 * Finds a single user based on their email.
 *
 * @param {string} email
 * @returns user
 */
export const getUserWithRoles = async function (email: string) {
  defaultLog.debug({ label: 'getUserWithRoles', message: 'email', email });

  if (!email) {
    throw {
      status: 503,
      message: 'Missing required email'
    };
  }

  const connection = await getDBConnection();

  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }

  try {
    const sqlStatement: SQLStatement = getUserWithRolesSQL(email);

    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rowCount && response.rows[0]) || null;

    return result;
  } catch (error) {
    defaultLog.debug({ label: 'getUserWithRoles', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Checks a set of user roles against a set of valid roles.
 *
 * @param {(string | string[])} validRoles one or more valid roles to match against
 * @param {(string | string[])} userRoles one or more user roles to check against the valid roles
 * @return {boolean} true if the user has at least 1 of the valid roles, false otherwise
 */
export const userHasValidRoles = function (validRoles: string | string[], userRoles: string | string[]): boolean {
  if (!Array.isArray(validRoles)) {
    validRoles = [validRoles];
  }

  if (!Array.isArray(userRoles)) {
    userRoles = [userRoles];
  }

  for (const validRole of validRoles) {
    if (userRoles.includes(validRole)) {
      return true;
    }
  }

  return false;
};
