'use strict';

import { verify, VerifyCallback } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { getLogger } from './logger';
import { createUser, getRolesForUser, getUserByKeycloakID, KeycloakAccountType } from './user-utils';
import { Request } from 'express';

const defaultLog = getLogger('auth-utils');

const APP_CERTIFICATE_URL =
  process.env.APP_CERTIFICATE_URL ||
  'https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/certs';

const KEYCLOAK_CLIENT_ID = 'invasives-bc-4565';

// so we have type information available to endpoints
export interface InvasivesRequest extends Request {
  keycloakToken: any;
  authContext: {
    preferredUsername: string;
    user: any;
    friendlyUsername?: string
    roles: string[];
    isPublicUser?: boolean;
  };
  originalUrl: string;
}

const jwks = jwksRsa({
  jwksUri: APP_CERTIFICATE_URL,
  cacheMaxAge: 3600,
  cache: true
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
  defaultLog.debug({ label: 'authenticate', message: 'authenticating user' });

  const urlSplit = req.originalUrl.split('?');
  const rawPath = urlSplit?.[0] ?? req.originalUrl;
  const authHeader = req.header('Authorization'); 

  const isPublicURL = ([
    '/api/activities-lean/',
    '/api/points-of-interest-lean/',
    '/api/points-of-interest/',
    // '/api/activities/',
    // '/api/activity/',
    // '/api/iapp-jurisdictions/',
    // '/api/code_tables/invasive_plant_code/',
    // '/api/code_tables/jurisdiction_code/',
  ].includes(rawPath));

  // add url
  if (authHeader === undefined  && isPublicURL) {
    {
      return new Promise<void>((resolve: any) => {
        req.authContext = {
          preferredUsername: null,
          friendlyUsername: null,
          user: null,
          roles: [],
          isPublicUser: true
        };
        resolve();
      });
    }
  }

  if (authHeader.includes('undefined')) {
    throw {
      code: 401,
      message: 'Missing Authorization header',
      namespace: 'auth-utils'
    };
  }

  const token = authHeader.split(/\s/)[1];

  if (!token) {
    defaultLog.info({ label: 'authenticate', message: 'missing or malformed auth token received' });

    throw {
      code: 401,
      message: 'Authorization header parse failure',
      namespace: 'auth-utils'
    };
  }

  return new Promise<void>((resolve, reject) => {
    verify(token, retrieveKey, {}, function (error, decoded) {
      if (error) {
        defaultLog.error({ label: 'authenticate', message: 'token verification failure', error });
        reject({
          code: 401,
          message: 'Token decode failure',
          namespace: 'auth-utils'
        });
      }

      req.keycloakToken = decoded;

      let accountType, id;

      if (decoded.identity_provider === 'idir') {
        accountType = KeycloakAccountType.idir;
        id = decoded.idir_user_guid;
      } else if (decoded.identity_provider === 'bceidbusiness') {
        accountType = KeycloakAccountType.bceid;
        id = decoded.bceid_user_guid;
      } else {
        reject({
          code: 401,
          message: 'Invalid token - missing idir_userid or bceid_userid',
          namespace: 'auth-utils'
        });
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
            user: null,
            roles: []
          };
          req.authContext.preferredUsername = decoded['preferred_username'];
          let idir_userid;
          let bceid_userid;
          if (decoded['idir_username']) idir_userid = decoded['idir_username'];
          if (decoded['bceid_username']) bceid_userid = decoded['bceid_username'];
          req.authContext.friendlyUsername = (idir_userid)? idir_userid.toLowerCase() + '@idir' : bceid_userid.toLowerCase() + '@bceid-business'
          req.authContext.user = user;
          getRolesForUser(user.user_id)
            .then((roles) => {
              req.authContext.roles = roles;
              defaultLog.debug({ label: 'authenticate', message: 'auth pass complete, context set!' });
              resolve();
            })
            .catch((error) => {
              defaultLog.error({ label: 'authenticate', message: 'failed looking up roles', error });
              reject(error);
            });
        });
      });
    });
  });
};
