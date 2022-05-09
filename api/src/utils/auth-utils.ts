'use strict';

import { verify } from 'jsonwebtoken';
import jwksRsa, { JwksClient } from 'jwks-rsa';
import { getLogger } from './logger';
import { getRolesForUser, getUserByBCEID, getUserByIDIR } from './user-utils';
import { Request } from 'express';

const defaultLog = getLogger('auth-utils');

const APP_CERTIFICATE_URL =
  process.env.APP_CERTIFICATE_URL ||
  'https://dev.oidc.gov.bc.ca/auth/realms/onestopauth-business/protocol/openid-connect/certs';

const KEYCLOAK_CLIENT_ID = 'invasives-bc-1849';

// so we have type information available to endpoints
export interface InvasivesRequest extends Request {
  keycloakToken: any;
  authContext: {
    preferredUsername: string;
    user: any;
    roles: string[];
  };
}

const jwks = jwksRsa({
  jwksUri: APP_CERTIFICATE_URL,
  cacheMaxAge: 3600,
  cache: true
});

function retrieveKey(header, callback) {
  jwks.getSigningKey(header.kid, function (err, key) {
    if (err) {
      throw err;
    }

    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export const authenticate = async function (req: InvasivesRequest): Promise<any> {
  defaultLog.debug({ label: 'authenticate', message: 'authenticating user' });

  const authHeader = req.header('Authorization');

  if (!authHeader) {
    throw {
      code: 401,
      message: 'Missing Authorization header',
      namespace: 'auth-utils'
    };
  }

  const token = authHeader.split(/\s/)[1];

  if (!token) {
    throw {
      code: 401,
      message: 'Authorization header parse failure',
      namespace: 'auth-utils'
    };
  }

  const fullyAuthenticated = new Promise(() => {
    verify(token, retrieveKey, {}, function (error, decoded) {
      if (error) {
        defaultLog.error(error);
        throw {
          code: 401,
          message: 'Token decode failure',
          namespace: 'auth-utils'
        };
      }

      req.keycloakToken = decoded;

      if (decoded.idir_userid) {
        getUserByIDIR(decoded.idir_userid).then((user) => {
          req.authContext = {
            preferredUsername: null,
            user: null,
            roles: []
          };
          req.authContext.preferredUsername = decoded['preferred_username'];
          req.authContext.user = user;
          getRolesForUser(user.user_id).then((roles) => {
            req.authContext.roles = roles;
          });
        });
      } else if (decoded.bceid_userid) {
        getUserByIDIR(decoded.bceid_userid).then((user) => {
          req.authContext = {
            preferredUsername: null,
            user: null,
            roles: []
          };
          req.authContext.preferredUsername = decoded['preferred_username'];
          req.authContext.user = user;
          getRolesForUser(user.user_id).then((roles) => {
            req.authContext.roles = roles;
          });
        });
      }
    });
  });

  return fullyAuthenticated;
};
