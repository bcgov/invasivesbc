'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import get from 'simple-get';
import { applyCommands } from 'mapshaper';
import decode from 'urldecode';
import proj4 from 'proj4';
import reproject from 'reproject';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';

const namespace = 'map-shaper';
/**
 * GET api/species?key=123;key=456;key=789
 */
export const GET: Operation = [getSimplifiedGeoJSON()];

GET.apiDoc = {
  tags: [namespace,'species'],
  description: 'Fetches the simplified GeoJSON from the specified url.'
};

proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
);

const albersToGeog = (featureCollection) => {
  try {
    const reprojected = reproject.reproject(featureCollection, proj4('EPSG:3005'), proj4.WGS84);
    return reprojected;
  } catch (e) {
    console.log('error converting back to geog from albers:');
    console.log(JSON.stringify(e));
    console.log(e);
  }
};

function getSimplifiedGeoJSON(): RequestHandler {
  return async (req, res) => {
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);
    const url = req.query.url;
    const percentage = req.query.percentage;

    if (!url) {
      logErr()(namespace,`Bad request - no url provided: 400\n${req?.query}`);
      return res.status(400).json({ message: 'Bad request - no url provided', namespace, code: 400 });
    }

    if (!percentage) {
      logErr()(namespace,`Bad request - no percentage provided: 400\n${req?.query}`);
      return res
        .status(400)
        .json({ message: 'Bad request - no percentage provided', namespace, code: 400 });
    }

    const decodedUrl = decode(url);

    get.concat(decodedUrl, function (err, res1, data) {
      if (err) {
        logErr()(namespace,err);
        throw err;
      }
      const command1 = `-i in.json -simplify dp interval=${percentage} -proj wgs84 -o out.json`;
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,command1);
      logData()(namespace,logMetrics.SQL_PARAMS,`${url}\n${percentage}\n${data}`);
      try {
        applyCommands(
          command1,
          { 'in.json': albersToGeog(JSON.parse(data.toString())) },
          function (err, output) {
            if (output) {
              const json = JSON.parse(output['out.json']);
              logData()(namespace,logMetrics.SQL_RESULTS,json);
              logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);             
              return res.status(200).json({
                message: 'Got simplified GeoJSON',
                request: req.query,
                result: json,
                namespace,
                code: 200
              });
            } else {
              logErr()(namespace,`Error getting simplified GeoJSON: 500\n${req?.query}`);
              return res.status(500).json({
                message: 'Failed to get simplified GeoJSON',
                request: req.query,
                error: err,
                namespace,
                code: 500
              });
            }
          }
        );
      } catch (e) {
        logErr()(namespace,`Error getting simplified GeoJSON\n${req?.body}\n${e}`);
        return res.status(500).json({
          message: 'Failed to get simplified GeoJSON',
          request: req.query,
          error: e,
          namespace,
          code: 500
        });
      }
    });
  };
}
