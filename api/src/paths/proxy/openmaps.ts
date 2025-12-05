import * as https from 'node:https';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ACTIVATED_ROLES, SECURITY_ON } from 'constants/misc';
import { getLogger } from 'utils/logger';
import { InvasivesRequest } from 'utils/auth-utils';

const defaultLog = getLogger('proxy');

const GET: Operation = [getOpenMapsWMSTiles()];

GET.apiDoc = {
  description: 'Proxy requests to BCGW WMS endpoint',
  tags: ['proxy'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ACTIVATED_ROLES
        }
      ]
    : [],
  parameters: [
    {
      name: 'url',
      in: 'query',
      required: true,
      description: 'The target WMS URL'
    }
  ],
  responses: {
    200: {
      description: 'Successful response',
      schema: {
        type: 'object'
      }
    },
    400: {
      description: 'Invalid request'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    500: {
      description: 'Internal server error'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Proxy request to Openmaps for mobile, redirect response to the client
 *
 * @return {RequestHandler}
 */
function getOpenMapsWMSTiles(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (req.authContext.roles.length === 0) {
      return res.status(401).json({ message: 'No Role for user' });
    }

    try {
      const targetUrl = decodeURI(req.query.url as string);

      https
        .get(targetUrl, (apiRes) => {
          if (apiRes.statusCode !== 200) {
            defaultLog.error({ label: 'openmaps', message: 'getOpenMapsWMSTiles', body: apiRes.statusMessage });
            return res.status(apiRes.statusCode).send(`Error fetching data: ${apiRes.statusMessage}`);
          }

          // Pass headers from the OpenMaps API response
          res.setHeader('Content-Type', apiRes.headers['content-type']);
          res.setHeader('Cache-Control', apiRes.headers['cache-control'] || 'no-cache');

          // Pipe the API response directly to the client
          apiRes.pipe(res);
        })
        .on('error', (_err) => {
          return res.status(500).send('Internal Server Error');
        });
    } catch (error) {
      defaultLog.error({ label: 'openmaps', message: 'getOpenMapsWMSTiles', body: error });
      return res.status(500).json({
        message: 'Unable to fetch wms tiles',
        request: req.body,
        error: error,
        namespace: 'proxy/openmaps',
        code: 500
      });
    }
  };
}

export { GET };
