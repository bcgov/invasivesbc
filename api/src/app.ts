import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';

import { initialize } from 'express-openapi';
import { api_doc } from 'sharedAPI/src/openapi/api-doc/api-doc';
import { applyApiDocSecurityFilters } from 'utils/api-doc-security-filter';
import { getLogger } from 'utils/logger';
import * as middleware from './middleware';

const defaultLog = getLogger('app');

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || '3002');

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
app.use(middleware.cors);

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
    Bearer: middleware.bearerHandler
  },
  securityFilter: applyApiDocSecurityFilters,
  errorMiddleware: middleware.globalErrorHandler,
  errorTransformer: function (openapiError: object, ajvError: object): object {
    defaultLog.error({ label: 'errorTransformer', message: 'ajvError', ajvError });
    return ajvError;
  }
});

export { app, HOST, PORT };
