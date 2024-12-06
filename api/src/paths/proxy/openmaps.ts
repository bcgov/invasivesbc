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
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  parameters: [
    {
      name: 'bbox',
      in: 'query',
      required: true,
      description: 'BBox'
    },
    {
      name: 'url',
      in: 'query',
      required: true,
      description: 'The target WMS URL to proxy'
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
 * Proxy request to Openmaps from mobile, redirect the response back to the client
 *
 * @return {RequestHandler}
 */
function getOpenMapsWMSTiles(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    if (req.authContext.roles.length === 0) {
      res.status(401).json({ message: 'No Role for user' });
    }
    const targetUrl = req.query.url;
    const bbox = req.query.bbox;
    const decodedUrl = decodeURI(targetUrl as string);
    console.log('Decoded', decodedUrl);

    const updatedUrl = decodedUrl.replace('{bbox-epsg-3857}', bbox as string);
    console.log('Updated', updatedUrl);

    const finalEncodedUrl = encodeURI(updatedUrl);

    // const finalEncodedUrl = encodeURIComponent(
    //   decodeURIComponent(targetUrl.toString()).replace('{bbox-epsg-3857}', bbox.toString())
    // );
    console.log('Final', finalEncodedUrl);

    if (!finalEncodedUrl) {
      return res.status(400).json({
        message: 'Missing URL parameter',
        request: req.body,
        namespace: 'openmaps/url={url}',
        code: 400
      });
    }

    https
      .get(finalEncodedUrl, (apiRes) => {
        if (apiRes.statusCode !== 200) {
          console.error(`Failed to fetch data: ${apiRes.statusMessage}`);
          return res.status(apiRes.statusCode).send(`Error fetching data: ${apiRes.statusMessage}`);
        }

        // Pass headers from the OpenMaps API response
        res.setHeader('Content-Type', apiRes.headers['content-type']);
        res.setHeader('Cache-Control', apiRes.headers['cache-control'] || 'no-cache');

        // Pipe the API response directly to the client
        apiRes.pipe(res);
      })
      .on('error', (err) => {
        console.error('Request error:', err);
        res.status(500).send('Internal Server Error');
      });
    // return next();
  };
}

export { GET };
