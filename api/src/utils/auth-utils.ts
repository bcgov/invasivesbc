'use strict';

import { verify } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { getLogger } from './logger';
import {
  createUser,
  getRolesForUser,
  getUserByKeycloakID,
  getV2BetaAccessForUser,
  KeycloakAccountType
} from './user-utils';
import { Request } from 'express';
import { MDCAsyncLocal } from '../mdc';

const defaultLog = getLogger('auth-utils');

const APP_CERTIFICATE_URL =
  process.env.APP_CERTIFICATE_URL ||
  'https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/certs';

// so we have type information available to endpoints
export interface InvasivesRequest extends Request {
  keycloakToken: any;
  authContext: {
    preferredUsername: string;
    user: any;
    friendlyUsername?: string;
    roles: string[];
    filterForSelectable: boolean;
    v2beta?: boolean;
  };
  originalUrl: string;
}

const jwks = jwksRsa({
  jwksUri: APP_CERTIFICATE_URL,
  cacheMaxAge: 3600000,
  cache: true,
  timeout: 60000
});

function retrieveKey(header, callback) {
  jwks.getSigningKey(header.kid, function (err, key) {
    defaultLog.debug({ label: 'authenticate', message: 'retrieve signing key' });

    if (err) {
      defaultLog.error({ label: 'authenticate', message: 'error retrieving key', error: err });
      callback(err, null);
      return;
    }

    const signingKey = key.getPublicKey();
    try {
      callback(null, signingKey);
    } catch (e) {
      defaultLog.error({ label: 'authenticate', message: 'uncaught error in callback', error: e });
    }
  });
}

export const authenticate = async (req: InvasivesRequest) => {
  const MDC = MDCAsyncLocal.getStore();

  defaultLog.debug({ label: 'authenticate', message: 'authenticating user' });

  const filterForSelectable = req.header('filterforselectable') === 'true' ? true : false;
  const authHeader = req.header('Authorization');

  const isPublicURL = [
    '/api/activities-lean/',
    '/api/points-of-interest-lean/',
    '/api/points-of-interest/',
    '/api/activities/'
  ].includes(req.originalUrl.split('?')?.[0]);

  MDC.additionalContext.isPublicURL = isPublicURL;

  let token: string;

  try {
    token = authHeader.split(/\s/)[1];
  } catch (error) {
    defaultLog.info({ label: 'authenticate', message: 'malformed auth token received' });

    throw {
      code: 400,
      message: 'Authorization header parse failure',
      namespace: 'auth-utils'
    };
  }

  if (isPublicURL && (req.method === 'GET' || req.method === 'POST') && !token) {
    return new Promise<void>((resolve: any) => {
      req.authContext = {
        preferredUsername: null,
        friendlyUsername: null,
        user: null,
        roles: [],
        filterForSelectable: filterForSelectable
      };

      resolve();
    });
  }

  if (!token) {
    defaultLog.info({ label: 'authenticate', message: 'missing or malformed auth token received' });

    throw {
      code: 401,
      message: 'Authorization header parse failure',
      namespace: 'auth-utils'
    };
  }

  return new Promise<void>((resolve, reject) => {
    verify(token, retrieveKey, {}, function (error, decoded: Record<string, any>) {
      if (error) {
        defaultLog.error({ label: 'authenticate', message: 'token verification failure', error });
        reject({
          code: 401,
          message: 'Token decode failure',
          namespace: 'auth-utils'
        });
        return;
      }
      if (!decoded) {
        reject({
          code: 401,
          message: 'Token decode failure',
          namespace: 'auth-utils'
        });
        return;
      }

      req.keycloakToken = decoded;

      let accountType, id;

      if (!decoded['identity_provider']) {
        reject({
          code: 401,
          message: 'Invalid token - missing identity provider',
          namespace: 'auth-utils'
        });
        return;
      }

      if (decoded.identity_provider === 'idir') {
        accountType = KeycloakAccountType.idir;
        if (!decoded['idir_user_guid']) {
          reject({
            code: 401,
            message: 'Invalid token - missing idir guid',
            namespace: 'auth-utils'
          });
          return;
        }
        id = decoded.idir_user_guid;
      } else if (decoded.identity_provider === 'bceidbusiness') {
        accountType = KeycloakAccountType.bceid;
        if (!decoded['bceid_user_guid']) {
          reject({
            code: 401,
            message: 'Invalid token - missing bceid guid',
            namespace: 'auth-utils'
          });
          return;
        }
        id = decoded.bceid_user_guid;
      } else {
        reject({
          code: 401,
          message: 'Invalid token - missing idir_userid or bceid_userid',
          namespace: 'auth-utils'
        });
        return;
      }

      getUserByKeycloakID(accountType, id).then((user) => {
        const createIfNeeded = new Promise((resolve: any) => {
          if (!user) {
            defaultLog.info({ label: 'authenticate', message: `first creating new user ${id}` });
            createUser(decoded, accountType, id).then(() => {
              getUserByKeycloakID(accountType, id).then((newUser) => {
                user = newUser;
                resolve();
              });
            });
          } else {
            resolve();
          }
        });

        createIfNeeded.then(() => {
          req.authContext = {
            preferredUsername: null,
            friendlyUsername: null,
            user: null,
            roles: [],
            filterForSelectable: false
          };
          req.authContext.preferredUsername = decoded['preferred_username'];
          if (decoded['idir_username']) {
            req.authContext.friendlyUsername = decoded['idir_username'].toLowerCase() + '@idir';
          }
          if (decoded['bceid_username']) {
            req.authContext.friendlyUsername = decoded['bceid_username'].toLowerCase() + '@bceid-business';
          }

          req.authContext.filterForSelectable = filterForSelectable;
          req.authContext.user = user;

          MDC.request.user = req.authContext.preferredUsername || 'unresolved';

          getRolesForUser(user.user_id)
            .then((roles) => {
              req.authContext.roles = roles;
              MDC.additionalContext.authContext = req.authContext;
            })
            .catch((error) => {
              defaultLog.error({ label: 'authenticate', message: 'failed looking up roles', error });
              reject(error);
            })
            .then(() => {
              // check if user has beta access
              getV2BetaAccessForUser(user.user_id)
                .then((betaAccess) => {
                  defaultLog.debug({ label: 'authenticate', message: 'looked up v2beta', betaAccess });
                  req.authContext.v2beta = betaAccess;
                  //req.authContext.user.v2beta = betaAccess;
                  resolve();
                })
                .catch((error) => {
                  defaultLog.error({ label: 'authenticate', message: 'failed looking up beta access', error });
                  reject(error);
                });
            });
        });
      });
    });
  });
};
