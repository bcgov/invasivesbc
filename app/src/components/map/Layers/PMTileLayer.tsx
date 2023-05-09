import * as pmtiles from 'pmtiles';
import * as protomaps from 'protomaps';
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import centroid from '@turf/centroid';
import polygon from 'turf-polygon';

export const PMTileLayer = (props) => {
  const map = useMap();

  const onFirstRender = useEffect(() => {
    let PAINT_RULES = [
      {
        dataLayer: 'tippecanoe_input',
        //symbolizer: new protomaps.PolygonSymbolizer({ fill: 'black', opacity: 1, }, )
        symbolizer: new protomaps.PolygonSymbolizer({
          per_feature: true,
          fill: (z: number, p: any) => {
            switch (p.props.code_name) {
              case 'NORD':
                return '#FF0000';
              default:
                return 'hsl(100,50%,50%)';
            }
            //if (z > 16) return 'hsl(100,50%,50%)';
          },
          opacity: 0.5,
          stroke: 'black',
          width: 1
        })
      }
    ];

    class MyPlaceSymbolizer {
      place(layout, geom, feature) {
        const realPolygon = polygon([feature.geom[0].map((pt) => [pt.x, pt.y])]);
        let center;
        try {
          center = centroid(realPolygon)
        } catch (e) {
          console.dir(e);
          return [];
        }

        let pt = geom[0][0];
        let pt2 = { x: center.geometry.coordinates[0], y: center.geometry.coordinates[1] };
        let name = feature.props.code_name;

        var font = '12px sans-serif';
        font = '500 14px sans-serif';

        layout.scratch.font = font;
        let metrics = layout.scratch.measureText(name);
        let width = metrics.width;
        let ascent = metrics.actualBoundingBoxAscent;
        let descent = metrics.actualBoundingBoxDescent;
        let bbox = { minX: pt.x - width / 2, minY: pt.y - ascent, maxX: pt.x + width / 2, maxY: pt.y + descent };

        let draw = (ctx) => {
          ctx.font = font;
          ctx.fillStyle = 'darkslategray';
          ctx.fillText(name, -width / 2, 0);
        };
        return [{ anchor: pt2, bboxes: [bbox], draw: draw }];
//k        return [{ anchor: pt2, bboxes: [], draw: draw }];
      }
    }

    let LABEL_RULES = [
      {
        dataLayer: 'tippecanoe_input',
        symbolizer: new MyPlaceSymbolizer()
      }
    ]; // ignore for now

    //var layer = protomaps.leafletLayer({url:'https://nrs.objectstore.gov.bc.ca/uphjps/riso.pmtiles'})
    var layer = protomaps.leafletLayer({
      //url: 'https://nrs.objectstore.gov.bc.ca/uphjps/testlayer2.pmtiles',
      //url: 'https://nrs.objectstore.gov.bc.ca/uphjps/testlayer2.pmtiles',
      url: 'https://nrs.objectstore.gov.bc.ca/uphjps/riso.pmtiles',
      paint_rules: PAINT_RULES,
      label_rules: LABEL_RULES
    });

    console.dir(layer);
    layer.options.zIndex = 3005;
    layer.addTo(map);
  }, []);
  return <></>;
};
