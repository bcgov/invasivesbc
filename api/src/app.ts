import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';

import { initialize } from 'express-openapi';
import { api_doc } from 'sharedAPI/src/openapi/api-doc/api-doc';
import { serve as swaggerServe, setup as swaggerSetup } from 'swagger-ui-express';
import * as middleware from './middleware';
import { applyApiDocSecurityFilters } from 'utils/api-doc-security-filter';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('app');

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || '3002');

// Get initial express app
const app: express.Express = express();

app.use(compression({ filter: () => true, threshold: 0 }));

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
  errorMiddleware: middleware.globalErrorHandler
}).then(({ apiDoc }) => {
  // Sets the Swagger UI to serve the fully initialized apiDocs (post-generation)
  app.use('/api/docs', swaggerServe, swaggerSetup(apiDoc));
});

export { app, HOST, PORT };
