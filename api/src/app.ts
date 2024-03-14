import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';

import { initialize } from 'express-openapi';
import { api_doc } from '../../sharedAPI/src/openapi/api-doc/api-doc.js';
import { applyApiDocSecurityFilters } from './utils/api-doc-security-filter.js';
import { authenticate, InvasivesRequest } from './utils/auth-utils.js';
import { getLogger } from './utils/logger.js';
import { MDC, MDCAsyncLocal } from './mdc.js';

const defaultLog = getLogger('app');

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || '3002');

export { HOST, PORT };

// Get initial express app
const app: express.Express = express();

app.use(compression({ filter: shouldCompress }));

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

// Enable CORS
app.use(function (req: any, res: any, next: any) {
  //
  // if (req.url !== '/api/misc/version') {
  //   // filter out health check for log brevity
  //   MDC
  // }

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization, responseType, Access-Control-Allow-Origin, If-None-Match, filterForSelectable'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // create a context if there isn't one
  let mdc = MDCAsyncLocal.getStore();
  if (!mdc) {
    mdc = new MDC();
    MDCAsyncLocal.run(mdc, next);
  } else {
    next();
  }
});

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
    Bearer: async function (req) {
      try {
        let mdc = MDCAsyncLocal.getStore();
        if (!mdc) {
          mdc = new MDC();
          await MDCAsyncLocal.run(mdc, authenticate, <InvasivesRequest>req);
        } else {
          await authenticate(<InvasivesRequest>req);
        }
      } catch (e) {
        defaultLog.error({ error: e });
        return false;
      }
      //  await applyApiDocSecurityFilters(<InvasivesRequest>(<unknown>req));
      return true;
    }
  },

  securityFilter: applyApiDocSecurityFilters,
  errorTransformer: function (openapiError: object, ajvError: object): object {
    // Transform openapi-request-validator and openapi-response-validator errors
    defaultLog.error({ label: 'errorTransformer', message: 'ajvError', ajvError });
    return ajvError;
  },
  // If `next` is not inclduded express will silently skip calling the `errorMiddleware` entirely.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorMiddleware: function (error, req, res, next) {
    defaultLog.error({
      label: 'errorHandler',
      message: 'unexpected error',
      error: error?.message + error?.stack || error
    });
    if (!res.headersSent) {
      // streaming responses cannot alter headers after dispatch
      res.status(error.status || error.code || 500).json(error);
    } else {
    }
  }
});

const adminApp: express.Express = express();

export { adminApp, app };
