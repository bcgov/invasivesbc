'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import get from 'simple-get';
import { applyCommands } from 'mapshaper';
import decode from 'urldecode';

/**
 * GET api/species?key=123;key=456;key=789
 */
export const GET: Operation = [getSimplifiedGeoJSON()];

GET.apiDoc = {
  tags: ['species'],
  description: 'Fetches the simplified GeoJSON from the specified url.'
};

function getSimplifiedGeoJSON(): RequestHandler {
  return async (req, res) => {
    const url = req.query.url;
    const percentage = req.query.percentage;

    if (!url) {
      return res.status(200).json('no url provided');
    }

    const decodedUrl = decode(url);

    get.concat(decodedUrl, function (err, res1, data) {
      if (err) {
        throw err;
      }

      try {
        applyCommands(
          `-i in.json -simplify dp ${percentage}% -o out.json`,
          { 'in.json': JSON.parse(data.toString()) },
          function (err, output) {
            const json = JSON.parse(output['out.json']);
            console.log(JSON.stringify(json));
            return res.status(200).json(json);
          }
        );
      } catch (e) {
        console.log(e);
        return e;
      }
    });
  };
}
