'use strict';

import bodyParser from 'body-parser';
import express from 'express';
import { initialize } from 'express-openapi';
import swaggerUi from 'swagger-ui-express';
import { authenticate } from './utils/auth-utils';
import { getLogger } from './utils/logger';

const defaultLog = getLogger('app');

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || '3002');

// Get initial express app
const app: express.Express = express();

// Enable CORS
app.use(function (req: any, res: any, next: any) {
  defaultLog.info(`${req.method} ${req.url}`);

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, responseType');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'max-age=4');

  next();
});

// Initialize express-openapi framework
const openAPIFramework = initialize({
  apiDoc: './src/openapi/api-doc.yaml', // base open api spec, relative to node root
  app: app, // express app to initialize
  paths: './src/paths', // base folder for endpoint routes, relative to node root
  routesGlob: '**/*.{ts,js}', // updated default to allow .ts
  routesIndexFileRegExp: /(?:index)?\.[tj]s$/, // updated default to allow .ts
  promiseMode: true, // allow endpoint handlers to return promises
  consumesMiddleware: {
    'application/json': bodyParser.json({ limit: '50mb' }),
    'application/x-www-form-urlencoded': bodyParser.urlencoded({ limit: '50mb', extended: true })
  },
  securityHandlers: {
    Bearer: function (req, scopes) {
      // return true // bypass authentication
      return authenticate(req, scopes);
    }
  },
  errorTransformer: function (openapiError: object, ajvError: object): object {
    // Transform openapi-request-validator and openapi-response-validator errors
    return ajvError;
  },
  errorMiddleware: function (error, req, res, next) {
    if (!error.status) {
      // TODO some unplanned errors do have a status, maybe change status to code for intentional errors?
      // log any unintentionally thrown errors (where no status has been set)
      defaultLog.error({ label: 'errorMiddleware', message: 'unexpected error', error });
    }

    res.status(error.status || 500).json(error);
  }
});

// Serve pretty api docs
app.use('/api/docs/', swaggerUi.serve, swaggerUi.setup(openAPIFramework.apiDoc));

// Start api
try {
  app.listen(PORT, () => {
    defaultLog.info({ label: 'start api', message: `started api on ${HOST}:${PORT}/api` });
  });
} catch (error) {
  defaultLog.error({ label: 'start api', message: 'error', error });
  process.exit(1);
}
