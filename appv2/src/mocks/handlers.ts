//example ripped from https://raw.githubusercontent.com/vitest-dev/vitest/main/examples/react-testing-lib-msw/src/mocks/handlers.ts
import { HttpResponse, graphql, http } from 'msw';
import {
  ActivitiesLeanResponse_Mock,
  ActivitiesResponse_Mock,
  ActivitiesS3Repsonse_Mock,
  AdminDefinedShapeResponse_Mock,
  ExportConfigResponse_Mock,
  IAPPS3Repsonse_Mock,
  IAPPSitesResponse_Mock,
  getAPIDoc
} from 'sharedAPI/src/openapi/api-doc/util/mocks/mock_handlers';

const BASEURL = 'http://localhost:3002';

// Later we can pass the req through to the mocking function so we can deal with edge cases like id only queries, and ultimately make them more dynamic when we need them to be
const handlerConfig = [
  // very confused on this one:
  { method: 'get', url: ('/'), req: null, responseBody: '', status: 200 },

  // not sure why I needed to add this one just now:
  { method: 'get', url: ('/api/api-docs'), req: null, responseBody: getAPIDoc(), status: 200 },

  { method: 'get', url: (BASEURL + '/api/api-docs'), req: null, responseBody: getAPIDoc(), status: 200 },
  {
    method: 'get',
    url: BASEURL + '/admin-defined-shapes',
    req: null,
    responseBody: AdminDefinedShapeResponse_Mock(), // went to town trying to make this one open-api compliant, really this is where the others should go
    status: 200
  },
  {
    method: 'get',
    url: 'https://nrs.objectstore.gov.bc.ca/seeds/iapp_geojson_gzip.gz',
    req: null,
    responseBody: IAPPS3Repsonse_Mock(null),
    status: 200
  },
  {
    method: 'get',
    url: BASEURL + '/api/export-config',
    req: null,
    responseBody: ExportConfigResponse_Mock(null),
    status: 200
  },
  {
    method: 'post',
    url: BASEURL + '/api/v2/activities/',
    req: null,
    responseBody: ActivitiesResponse_Mock(null),
    status: 200
  },
  {
    method: 'post',
    url: BASEURL + '/api/v2/IAPP/',
    req: null,
    responseBody: IAPPSitesResponse_Mock(null),
    status: 200
  },
  {
    method: 'get',
    url: '/fake_zipped_activity_json_url',
    req: null,
    responseBody: ActivitiesS3Repsonse_Mock(null),
    status: 200
  },
  {
    method: 'post',
    url: BASEURL + '/api/activities-lean/',
    req: null,
    responseBody: ActivitiesLeanResponse_Mock(null),
    status: 200
  }
];
export const mapHandlers = (inputHandlerConfig) => inputHandlerConfig.map((conf) => {
  switch (conf.method) {
    case 'get': {
      return http.get(conf.url, () => HttpResponse.json(conf.responseBody, { status: conf.status }));
    }
    case 'post': {
      return http.post(conf.url, () => HttpResponse.json(conf.responseBody, { status: conf.status }));
    }
  }
});

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = mapHandlers(handlerConfig)