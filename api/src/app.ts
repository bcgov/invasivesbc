import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';

import { initialize } from 'express-openapi';

import { api_doc } from '@bcgov/invasivesbci-shared';

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
app.use(function(req: any, res: any, next: any) {
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
  paths: [
    { path: '/access-request-read', module: await import('./paths/access-request-read.js') },
    { path: '/access-request', module: await import('./paths/access-request.js') },
    { path: '/activities-lean', module: await import('./paths/activities-lean.js') },
    { path: '/activities', module: await import('./paths/activities.js') },
    { path: '/activity-lean/{activityId}', module: await import('./paths/activity-lean/{activityId}.js') },
    { path: '/activity', module: await import('./paths/activity.js') },
    { path: '/activity/{activityId}', module: await import('./paths/activity/{activityId}.js') },
    { path: '/admin-defined-shapes', module: await import('./paths/admin-defined-shapes.js') },
    { path: '/agency_codes', module: await import('./paths/agency_codes.js') },
    { path: '/application-user', module: await import('./paths/application-user.js') },
    { path: '/application-user/renew', module: await import('./paths/application-user/renew.js') },
    { path: '/batch', module: await import('./paths/batch.js') },
    { path: '/batch/templates', module: await import('./paths/batch/templates.js') },
    { path: '/batch/templates/{id}', module: await import('./paths/batch/templates/{id}.js') },
    { path: '/batch/{id}', module: await import('./paths/batch/{id}.js') },
    { path: '/batch/{id}/execute', module: await import('./paths/batch/{id}/execute.js') },
    { path: '/bc-grid/bcGrid', module: await import('./paths/bc-grid/bcGrid.js') },
    { path: '/code_tables', module: await import('./paths/code_tables.js') },
    { path: '/code_tables/{codeHeaderName}', module: await import('./paths/code_tables/{codeHeaderName}.js') },
    { path: '/context/databc/{wfs}', module: await import('./paths/context/databc/{wfs}.js') },
    { path: '/context/elevation', module: await import('./paths/context/elevation.js') },
    { path: '/context/internal/{target}', module: await import('./paths/context/internal/{target}.js') },
    { path: '/context/transform', module: await import('./paths/context/transform.js') },
    { path: '/context/well', module: await import('./paths/context/well.js') },
    { path: '/deleted/activities', module: await import('./paths/deleted/activities.js') },
    { path: '/email-settings', module: await import('./paths/email-settings.js') },
    { path: '/email-templates', module: await import('./paths/email-templates.js') },
    { path: '/embedded-report', module: await import('./paths/embedded-report.js') },
    { path: '/embedded-report/{reportId}', module: await import('./paths/embedded-report/{reportId}.js') },
    { path: '/employer_codes', module: await import('./paths/employer_codes.js') },
    { path: '/error', module: await import('./paths/error.js') },
    { path: '/export-config', module: await import('./paths/export-config.js') },
    { path: '/iapp-jurisdictions', module: await import('./paths/iapp-jurisdictions.js') },
    { path: '/jurisdictions', module: await import('./paths/jurisdictions.js') },
    { path: '/map-shaper', module: await import('./paths/map-shaper.js') },
    { path: '/media', module: await import('./paths/media.js') },
    { path: '/media/delete/{key}', module: await import('./paths/media/delete/{key}.js') },
    { path: '/media/{key}', module: await import('./paths/media/{key}.js') },
    { path: '/metabase-query', module: await import('./paths/metabase-query.js') },
    { path: '/metabase-query/{queryId}', module: await import('./paths/metabase-query/{queryId}.js') },
    { path: '/misc/version', module: await import('./paths/misc/version.js') },
    { path: '/points-of-interest-lean', module: await import('./paths/points-of-interest-lean.js') },
    { path: '/points-of-interest', module: await import('./paths/points-of-interest.js') },
    { path: '/public-map/activities', module: await import('./paths/public-map/activities.js') },
    { path: '/riso', module: await import('./paths/riso.js') },
    { path: '/roles', module: await import('./paths/roles.js') },
    { path: '/species', module: await import('./paths/species.js') },
    { path: '/training_videos', module: await import('./paths/training_videos.js') },
    { path: '/update-request', module: await import('./paths/update-request.js') },
    { path: '/user-access', module: await import('./paths/user-access.js') },
    { path: '/v2/activities', module: await import('./paths/v2/activities.js') },
    { path: '/v2/iapp', module: await import('./paths/v2/iapp.js') }
  ],
  promiseMode:
    true, // allow endpoint handlers to return promises
  consumesMiddleware:
    {
      'application/json':
        bodyParser.json({ limit: '50mb' }),
      'application/x-www-form-urlencoded':
        bodyParser.urlencoded({ limit: '50mb', extended: true })
    }
  ,
  securityHandlers: {
    Bearer: async function(req) {
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
  }
  ,

  securityFilter: applyApiDocSecurityFilters,
  errorTransformer:

    function(openapiError: object, ajvError: object): object {
      // Transform openapi-request-validator and openapi-response-validator errors
      defaultLog.error({ label: 'errorTransformer', message: 'ajvError', ajvError });
      return ajvError;
    }

  ,
// If `next` is not inclduded express will silently skip calling the `errorMiddleware` entirely.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorMiddleware: function(error, req, res, next) {
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
})
;

const adminApp: express.Express = express();

export { adminApp, app };
