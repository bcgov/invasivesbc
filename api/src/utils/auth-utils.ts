import { verify } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { Request } from 'express';
import LoggerHandler from './endpoints/LoggerHandler';
import QueryHandler from './endpoints/QueryHandler';
import { MDCAsyncLocal } from 'mdc';
import { processTokenSQL } from 'queries/user-queries';

const logger = new LoggerHandler('auth-utils');

const APP_CERTIFICATE_URL =
  process.env.APP_CERTIFICATE_URL ||
  'https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/certs';

/**
 * @desc Partial Role interface for used values
 */
interface Role {
  role_id: number;
  role_description: string;
  role_name: string;
  [key: PropertyKey]: unknown;
}

/** @desc Partial decode Keycloak token for used values */
interface KeycloakToken {
  idir_user_guid?: string;
  bceid_user_guid?: string;
  identity_provider: string;
  idir_username?: string;
  bceid_username?: string;
  name: string;
  preferred_username: string;
  display_name: string;
  given_name: string;
  family_name: string;
  email: string;
  [key: PropertyKey]: unknown;
}

interface UserContext {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  preferred_username: string;
  account_status: number;
  expiry_date: Date;
  activation_status: number;
  active_session_id: unknown;
  created_at: Date;
  updated_at: Date;
  idir_userid?: string;
  bceid_userid?: string;
  idir_account_name: string;
  bceid_account_name: string;
  work_phone_number: string;
  funding_agencies: string;
  employer: string;
  pac_number: number;
  pac_service_number_1?: number;
  pac_service_number_2?: number;
  v2beta: boolean;
  primary_employer?: string;
  primary_agency?: string;
}

interface AuthContext {
  preferredUsername: string;
  user?: UserContext;
  friendlyUsername: string;
  roles: Array<Role>;
  filterForSelectable: boolean;
  v2beta: boolean;
}

interface InvasivesRequest extends Request {
  keycloakToken: KeycloakToken;
  authContext: Partial<AuthContext>;
  originalUrl: string;
  operationDoc: Record<PropertyKey, unknown>;
}

enum KeycloakAccountType {
  idir = 'idir',
  bceid = 'bceid'
}
const jwks = jwksRsa({
  jwksUri: APP_CERTIFICATE_URL,
  cacheMaxAge: 3600000,
  cache: true,
  timeout: 60000
});

function retrieveKey(header, callback) {
  jwks.getSigningKey(header.kid, function (e, key) {
    logger.debug('[authenticate]: Retrieve signing key');
    if (e) {
      logger.error(e, '[retrieveKey]: Error retrieving Key');
      callback(e, null);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export const authenticate = async (req: InvasivesRequest): Promise<void> => {
  logger.debug('[authenticate]: Authenticating user');
  const MDC = MDCAsyncLocal.getStore();
  const filterForSelectable = req.header('filterforselectable') === 'true';

  const token = req?.header('Authorization')?.replace(/Bearer /, '');
  if (!token) {
    // Set default values for authContext if user has no token.
    req.authContext = {
      preferredUsername: null,
      friendlyUsername: null,
      user: null,
      roles: [],
      filterForSelectable: filterForSelectable,
      v2beta: false
    };
    return;
  }
  const parsedToken: KeycloakToken = await (() =>
    new Promise((resolve, reject) => {
      verify(token, retrieveKey, (error, parsed) => {
        if (error) reject(error);
        return resolve(parsed as KeycloakToken);
      });
    }))();

  req.keycloakToken = parsedToken;

  let accountType: KeycloakAccountType;
  let id: string;
  if (parsedToken?.identity_provider === KeycloakAccountType.idir && !!parsedToken?.idir_user_guid) {
    accountType = KeycloakAccountType.idir;
    id = parsedToken.idir_user_guid;
  } else if (parsedToken.identity_provider === KeycloakAccountType.bceid && !!parsedToken?.bceid_user_guid) {
    accountType = KeycloakAccountType.bceid;
    id = parsedToken.bceid_user_guid;
  } else {
    logger.debug('[authenticate]', { parsedToken });
    throw new Error('Invalid token - missing bceid/idir guid');
  }
  const userSql = processTokenSQL({
    userType: accountType,
    id: id,
    username: parsedToken.preferred_username,
    email: parsedToken.email
  });
  const { roles, new_user, ...user } = (await new QueryHandler().query(userSql))?.rows?.[0] ?? {};
  // Set context for Request object
  req.authContext = {
    preferredUsername: user.preferred_username,
    friendlyUsername: user.friendlyUsername,
    user: user,
    roles: roles,
    filterForSelectable
  };
  MDC.request.user = req.authContext.preferredUsername || 'unresolved';
  MDC.additionalContext.authContext = req.authContext;

  if (new_user) logger.info('[authenticate]: New user created from token');
};

export type { InvasivesRequest };
export { KeycloakAccountType };
