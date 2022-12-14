// mostly taken from map-shaper.ts
'use strict';

import { applyCommands } from 'mapshaper';
import proj4 from 'proj4';
import reproject from 'reproject';

proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
);

const albersToGeog = (featureCollection) => {
  try {
    const reprojected = reproject.reproject(featureCollection, proj4('EPSG:3005'), proj4.WGS84);
    // console.log("reprojected: ", JSON.stringify(reprojected) );
    return reprojected;
  } catch (e) {
    console.log('error converting back to geog from albers:');
    console.log(JSON.stringify(e));
    console.log(e);
  }
};

async function simplifyGeojson(data, percentage, returnCallback) {
  try {
    // let result = null;
    // await applyCommands(
    //   `-i in.json -simplify dp interval=${percentage} -proj wgs84 -clean -o format=geojson geojson-type=FeatureCollection out.json`,
    //   { 'in.json': albersToGeog(data) },
    //   async function (err, output) {
    //     if (output) {
    //       const json = output['out.json'];
    //       console.log("json: ", JSON.stringify(JSON.parse(json).features));
    //       console.log("success");
    //     //   return json;
    //     result = json;
    //     } else {
    //         console.log("json: ", output);
    //         console.log("failure");
    //     //   return data;
    //     result = data;
    //     }
    //   }
    // );

    // return await result;

    await applyCommands(
      `-i in.json -simplify dp interval=${percentage} -clean -o format=geojson geojson-type=FeatureCollection out.json`,
      { 'in.json': data },
      function (err, output) {
        if (output) {
          let json = output['out.json'];
          let parsed = JSON.parse(json);
          let parsedEdit = JSON.parse(JSON.stringify(parsed));

          delete parsedEdit.features;
          let newFeatures = parsed?.features?.map((feature) => {
            if (typeof feature.properties === 'object' && feature.properties !== null) {
              return feature;
            } else {
              return { ...feature, properties: {} };
            }
          });
          parsedEdit.features = [...newFeatures];

          returnCallback(JSON.stringify(parsedEdit));
        } else {
          // console.log("json: ", output);
          console.log('failure');
          //   return data;
          return data;
        }
      }
    );

    // if (output) {
    //     const json = output['out.json'];
    //     console.log("json: ", JSON.parse(json));
    //     console.log("success");
    //     //   return json;
    //     return json;
    // } else {
    //     console.log("json: ", output);
    //     console.log("failure");
    //     //   return data;
    //     return data;
    // }
  } catch (e) {
    console.log(e);
    // return res.status(500).json({
    //   message: 'Failed to get simplified GeoJSON',
    //   request: req.query,
    //   error: e,
    //   namespace: 'map-shaper',
    //   code: 500
    // });
  }
}

export { simplifyGeojson };

// function getSimplifiedGeoJSON(){
//   return async (req, res) => {
//     const url = req.query.url;
//     const percentage = req.query.percentage;

//     if (!url) {
//       return res.status(400).json({ message: 'Bad request - no url provided', namespace: 'map-shaper', code: 400 });
//     }

//     if (!percentage) {
//       return res
//         .status(400)
//         .json({ message: 'Bad request - no percentage provided', namespace: 'map-shaper', code: 400 });
//     }

//     const decodedUrl = decode(url);

//     get.concat(decodedUrl, function (err, res1, data) {
//       if (err) {
//         throw err;
//       }

//       try {
//         applyCommands(
//           `-i in.json -simplify dp interval=${percentage} -proj wgs84 -o out.json`,
//           { 'in.json': albersToGeog(JSON.parse(data.toString())) },
//           function (err, output) {
//             if (output) {
//               const json = JSON.parse(output['out.json']);
//               return res.status(200).json({
//                 message: 'Got simplified GeoJSON',
//                 request: req.query,
//                 result: json,
//                 namespace: 'map-shaper',
//                 code: 200
//               });
//             } else {
//               return res.status(500).json({
//                 message: 'Failed to get simplified GeoJSON',
//                 request: req.query,
//                 error: err,
//                 namespace: 'map-shaper',
//                 code: 500
//               });
//             }
//           }
//         );
//       } catch (e) {
//         console.log(e);
//         return res.status(500).json({
//           message: 'Failed to get simplified GeoJSON',
//           request: req.query,
//           error: e,
//           namespace: 'map-shaper',
//           code: 500
//         });
//       }
//     });
//   };
// }
