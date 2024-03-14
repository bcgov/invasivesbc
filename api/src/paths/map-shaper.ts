import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import get from 'simple-get';
import { applyCommands } from 'mapshaper';
import decode from 'urldecode';
import proj4 from 'proj4';
import reproject from 'reproject';
import { getLogger } from '../utils/logger.js';

/**
 * GET api/species?key=123;key=456;key=789
 */
export const GET: Operation = [getSimplifiedGeoJSON()];

GET.apiDoc = {
  tags: ['species'],
  description: 'Fetches the simplified GeoJSON from the specified url.'
};

proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
);
const defaultLog = getLogger('map-shaper');

const albersToGeog = (featureCollection) => {
  try {
    const reprojected = reproject.reproject(featureCollection, proj4('EPSG:3005'), proj4.WGS84);
    return reprojected;
  } catch (e) {
    defaultLog.error({ message: 'error converting back to geog from albers:', error: e });
  }
};

function getSimplifiedGeoJSON(): RequestHandler {
  return async (req, res) => {
    const url = req.query.url;
    const percentage = req.query.percentage;

    if (!url) {
      return res.status(400).json({ message: 'Bad request - no url provided', namespace: 'map-shaper', code: 400 });
    }

    if (!percentage) {
      return res
        .status(400)
        .json({ message: 'Bad request - no percentage provided', namespace: 'map-shaper', code: 400 });
    }

    const decodedUrl = decode(url);

    get.concat(decodedUrl, function (err, res1, data) {
      if (err) {
        throw err;
      }

      try {
        applyCommands(
          `-i in.json -simplify dp interval=${percentage} -proj wgs84 -o out.json`,
          { 'in.json': albersToGeog(JSON.parse(data.toString())) },
          function (err, output) {
            if (output) {
              const json = JSON.parse(output['out.json']);
              return res.status(200).json({
                message: 'Got simplified GeoJSON',
                request: req.query,
                result: json,
                namespace: 'map-shaper',
                code: 200
              });
            } else {
              return res.status(500).json({
                message: 'Failed to get simplified GeoJSON',
                request: req.query,
                error: err,
                namespace: 'map-shaper',
                code: 500
              });
            }
          }
        );
      } catch (e) {
        defaultLog.error({ message: 'Failed to get simplified GeoJSON', error: e });
        return res.status(500).json({
          message: 'Failed to get simplified GeoJSON',
          request: req.query,
          error: e,
          namespace: 'map-shaper',
          code: 500
        });
      }
    });
  };
}
