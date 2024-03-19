import pkg from 'mapshaper';
const { applyCommands } = pkg;

import proj4 from 'proj4';
import reproject from 'reproject';
import { getLogger } from './logger.js';

const defaultLog = getLogger('map-shaper');

proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
);

const albersToGeog = (featureCollection) => {
  try {
    const reprojected = reproject.reproject(featureCollection, proj4('EPSG:3005'), proj4.WGS84);
    return reprojected;
  } catch (e) {
    defaultLog.warn({ message: 'error converting back to geog from albers', error: e });
  }
};

async function simplifyGeojson(data, percentage, returnCallback) {
  try {
    await applyCommands(
      `-i in.json -simplify dp interval=${percentage} -clean -o format=geojson geojson-type=FeatureCollection out.json`,
      { 'in.json': data },
      function (err, output) {
        if (output) {
          let jsonArr = [];
          jsonArr.push(output['out.json']);
          if (!jsonArr[0]) {
            jsonArr = [];
            jsonArr.push(output['out1.json']);
            jsonArr.push(output['out2.json']);
          }

          let totalEdit = {
            type: 'FeatureCollection',
            features: []
          };

          jsonArr.forEach((json) => {
            let parsed = JSON.parse(json);

            let newFeatures = parsed?.features?.map((feature) => {
              if (typeof feature.properties === 'object' && feature.properties !== null) {
                return feature;
              } else {
                return { ...feature, properties: {} };
              }
            });

            totalEdit.features.push(...newFeatures);
          });

          returnCallback(JSON.stringify(totalEdit));
        } else {
          defaultLog.error({ message: 'unspecified failure' });

          return data;
        }
      }
    );
  } catch (e) {
    defaultLog.error({ error: e });
  }
}

export { simplifyGeojson };
