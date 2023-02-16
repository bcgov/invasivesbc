'use strict';

import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';

import { initialize } from 'express-openapi';
import { api_doc } from './openapi/api-doc/api-doc';
import { applyApiDocSecurityFilters } from './utils/api-doc-security-filter';
import { authenticate, InvasivesRequest } from './utils/auth-utils';
import { getLogger } from './utils/logger';
import { getMetabaseGroupMappings, postSyncMetabaseGroupMappings } from './admin/metabase_groups';
import loggingConfig from './loggingconfig.json'
import { getuid } from 'process';

// const defaultLog = getLogger('app');

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || '3002');

export { HOST, PORT };

// Get initial express app
const app: express.Express = express();

app.use(compression({ filter: shouldCompress }));
app.use(express.json());

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

function uuidv4() {
  throw new Error('Function not implemented.');
}

// Enable CORS
app.use(function (req: any, res: any, next: any) {
  if (req.url !== '/api/misc/version') {
    // filter out health check for log brevity
    // defaultLog.info(`${req.method} ${req.url}`);
  }

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization, responseType, Access-Control-Allow-Origin, If-None-Match, filterForSelectable'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(function (req: InvasivesRequest, res: any, next: any) {
  // const transactionID = uuidv4();
  // res.transactionID = transactionID;
  loggingPublic(req, res, next);
  next();
});

const loggingHandler = (isAuthed: boolean) => function(req: any, res, next) {
  const endpoint = req.url.split('/')[2];
  const endpointConfigObj = loggingConfig.endpoint_configs[endpoint];
  const logger = getLogger(endpoint);

  if(isAuthed)
  {
    //user metadata
    if(endpointConfigObj["user-metadata"])
    {
      const token = req.keycloakToken;
      const authContext = req.authContext;
      const metadata = {
        'token': token,
        'auth': authContext
      }
      if (token && authContext) {
        logger.log({
          level: 'info',
          message: JSON.parse(JSON.stringify(metadata))
        });
      } else {
        logger.log({
          level: 'warn',
          message: "There is a problem with either token or AuthContext"
        });
      }
    }
  }

  if(!isAuthed)
  {
    //query string params
    if(endpointConfigObj["query-string-params"])
    {
      const queryParams = req.query.query;
      if (queryParams && queryParams !== 'undefined') {
        logger.log({
          level: 'debug',
          message: JSON.parse(queryParams)
        });
      } else {
        logger.log({
          level: 'warn',
          message: "There are no query parameters."
        });
      }
    }
    
    // req body
    if(endpointConfigObj["request-body"])
    {
      const body = req.body;
      if (body && JSON.stringify(body) !== '{}') {
        logger.log({
          level: 'debug',
          message: body
        });
      } else {
        logger.log({
          level: 'warn',
          message: "Body is empty."
        })
      }
    }
  }
}
  
  
const loggingAuthd = function(req: InvasivesRequest, res: any, next: any)
{
  return loggingHandler(true)(req, res, next);
}

const loggingPublic = function(req: any, res: any, next: any)
{
  return loggingHandler(false)(req, res, next);
}

// Initialize express-openapi framework
initialize({
  validateApiDoc: false,
  apiDoc: api_doc as any, // base open api spec
  app: app, // express app to initialize
  paths: './src/paths', // base folder for endpoint routes
  routesGlob: '**/*.{ts,js}', // updated default to allow .ts
  routesIndexFileRegExp: /(?:index)?\.[tj]s$/, // updated default to allow .ts
  promiseMode: true, // allow endpoint handlers to return promises
  consumesMiddleware: {
    'application/json': bodyParser.json({ limit: '50mb' }),
    'application/x-www-form-urlencoded': bodyParser.urlencoded({ limit: '50mb', extended: true })
  },
  securityHandlers: {
    Bearer: async function (req, res, next) {
      await authenticate(<InvasivesRequest>req);
      //  await applyApiDocSecurityFilters(<InvasivesRequest>(<unknown>req));
      return true;
    }
  },
  
  securityFilter: applyApiDocSecurityFilters,
  errorTransformer: function (openapiError: object, ajvError: object): object {
    // Transform openapi-request-validator and openapi-response-validator errors
    // defaultLog.error({ label: 'errorTransformer', message: 'ajvError', ajvError });
    return ajvError;
  },
  // If `next` is not inclduded express will silently skip calling the `errorMiddleware` entirely.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorMiddleware: function (error, req, res, next) {
    if (!error.status) {
      // TODO some unplanned errors do have a status, maybe change status to code for intentional errors?
      // log any unintentionally thrown errors (where no status has been set)
      // defaultLog.error({ label: 'errorMiddleware', message: 'unexpected error', error });
    }

    res.status(error.status || error.code || 500).json(error);
  }
});

const adminApp: express.Express = express();
adminApp.get('/metabase_groups', getMetabaseGroupMappings);
adminApp.post('/metabase_sync', postSyncMetabaseGroupMappings);

export { adminApp, app };
  

