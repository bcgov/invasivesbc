'use strict';

import bodyParser from 'body-parser';
import express from 'express';
import { initialize } from 'express-openapi';
import { api_doc } from './openapi/api-doc/api-doc';
import { applyApiDocSecurityFilters } from './utils/api-doc-security-filter';
import { authenticate, InvasivesRequest } from './utils/auth-utils';
import { getLogger } from './utils/logger';
import { getMetabaseGroupMappings, postSyncMetabaseGroupMappings } from './admin/metabase_groups';

const defaultLog = getLogger('app');

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || '3002');

export { HOST, PORT };

// Get initial express app
const app: express.Express = express();

// Enable CORS
app.use(function (req: any, res: any, next: any) {
  defaultLog.info(`${req.method} ${req.url}`);

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization, responseType, Access-Control-Allow-Origin'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'max-age=4');

  next();
});

// Initialize express-openapi framework
initialize({
  validateApiDoc: false,
  apiDoc: JSON.stringify(api_doc), // base open api spec
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
    Bearer: function (req) {
      // return true // bypass authentication
      return authenticate(<InvasivesRequest>req);
    }
  },
  securityFilter: async (req, res) => {
    const updatedReq = await applyApiDocSecurityFilters(<InvasivesRequest>(<unknown>req));
    res.status(200).json(updatedReq['apiDoc']);
  },
  errorTransformer: function (openapiError: object, ajvError: object): object {
    // Transform openapi-request-validator and openapi-response-validator errors
    defaultLog.error({ label: 'errorTransformer', message: 'ajvError', ajvError });
    return ajvError;
  },
  // If `next` is not inclduded express will silently skip calling the `errorMiddleware` entirely.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorMiddleware: function (error, req, res, next) {
    if (!error.status) {
      // TODO some unplanned errors do have a status, maybe change status to code for intentional errors?
      // log any unintentionally thrown errors (where no status has been set)
      defaultLog.error({ label: 'errorMiddleware', message: 'unexpected error', error });
    }

    res.status(error.status || 500).json(error);
  }
});

const adminApp: express.Express = express();
adminApp.get('/metabase_groups', getMetabaseGroupMappings);
adminApp.post('/metabase_sync', postSyncMetabaseGroupMappings);

export { adminApp, app };
