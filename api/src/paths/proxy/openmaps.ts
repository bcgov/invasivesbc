import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getLogger } from 'utils/logger';
import { InvasivesRequest } from 'utils/auth-utils';
const https = require('https');

const defaultLog = getLogger('proxy');

const GET: Operation = [getOpenMapsWMSTiles()];

GET.apiDoc = {
  description: 'Proxy requests to a BCGW WMS endpoint',
  tags: ['proxy'],
  parameters: [
    {
      name: 'url',
      in: 'query',
      required: true,
      type: 'string',
      description: 'The target WMS URL to proxy'
    }
  ],
  responses: {
    200: {
      description: 'Successful response',
      schema: {
        type: 'string'
      }
    },
    400: {
      description: 'Invalid request'
    },
    500: {
      description: 'Internal server error'
    },
    401: {
      $ref: '#/components/responses/401'
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
 * Proxy request to Openmaps from mobile, redirect the response back to the client
 *
 * @return {RequestHandler}
 */
function getOpenMapsWMSTiles(): RequestHandler {
  return async (req, res, next) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({
        message: 'Missing URL parameter',
        request: req.body,
        namespace: 'openmaps/url={url}',
        code: 400
      });
    }

    https
      .get(targetUrl, (apiRes) => {
        if (apiRes.statusCode !== 200) {
          console.error(`Failed to fetch data: ${apiRes.statusMessage}`);
          return res.status(apiRes.statusCode).send(`Error fetching data: ${apiRes.statusMessage}`);
        }

        // Pass through headers from the OpenMaps API response
        res.setHeader('Content-Type', apiRes.headers['content-type']);
        res.setHeader('Cache-Control', apiRes.headers['cache-control'] || 'no-cache');

        // Pipe the API response directly to the client
        apiRes.pipe(res);
      })
      .on('error', (err) => {
        console.error('Request error:', err);
        res.status(500).send('Internal Server Error');
      });
  };
}

export { GET };
