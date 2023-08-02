import * as protomaps from 'protomaps';
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useLeafletContext } from '@react-leaflet/core';

export const VectorOverviewLayer = (props) => {
  const map = useMap();
  const context = useLeafletContext();
  const container = context.layerContainer || context.map;

  useEffect(() => {
    class IAPPTextSymbolizer {
      place(layout, geom, feature) {
        if (layout.zoom < 14) return;

        let pt = geom[0][0];
        let name = 'IAPP Site';

        try {
          name = `IAPP Site - ${feature.props.site_id}: ${feature.props.species}`;
        } catch {}

        const font = '13px Tahoma';
        const outlineColor = 'black';

        layout.scratch.font = font;
        let metrics = layout.scratch.measureText(name);
        let width = metrics.width;
        let ascent = metrics.actualBoundingBoxAscent;
        let descent = metrics.actualBoundingBoxDescent;
        let bbox = { minX: pt.x - width / 2, minY: pt.y - ascent, maxX: pt.x + width / 2, maxY: pt.y + descent };

        let draw = (ctx) => {
          ctx.font = font;
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = 2;
          ctx.strokeText(name, -width / 2, 20);
          ctx.fillStyle = 'white';
          ctx.fillText(name, -width / 2, 20);
        };

        return [{ anchor: pt, bboxes: [bbox], draw: draw }];
      }
    }

    class InvasivesTextSymbolizer {
      place(layout, geom, feature) {
        if (layout.zoom < 13) return;

        let pt = geom[0][0];
        let name = 'InvasivesBC Site';
        try {
          let details = '';
          if (feature.props.speciesPositive) {
            details += 'Species Positive: ' + feature.props.speciesPositive;
          }
          if (feature.props.speciesNegative) {
            details += 'Species Negative: ' + feature.props.speciesNegative;
          }

          name = `${feature.props.id}: ${details}`;
        } catch {}

        const font = '13px Tahoma';
        const outlineColor = 'black';

        layout.scratch.font = font;
        let metrics = layout.scratch.measureText(name);
        let width = metrics.width;
        let ascent = metrics.actualBoundingBoxAscent;
        let descent = metrics.actualBoundingBoxDescent;
        let bbox = { minX: pt.x - width / 2, minY: pt.y - ascent, maxX: pt.x + width / 2, maxY: pt.y + descent };

        let draw = (ctx) => {
          ctx.font = font;
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = 2;
          ctx.strokeText(name, -width / 2, 20);
          ctx.fillStyle = 'white';
          ctx.fillText(name, -width / 2, 20);
        };

        return [{ anchor: pt, bboxes: [bbox], draw: draw }];
      }
    }

    let PAINT_RULES = [
      {
        dataLayer: 'iapp',
        symbolizer: new protomaps.CircleSymbolizer({
          fill: (z: number, p: any) => {
            return 'rgb(0, 238, 0)';
          },
          opacity: 1,
          stroke: 'rgb(0, 238, 0)',
          width: 1
        })
      },
      {
        dataLayer: 'invasives',
        symbolizer: new protomaps.CircleSymbolizer({
          fill: (z: number, p: any) => {
            return 'rgb(20, 180, 220)';
          },
          opacity: 1,
          stroke: 'rgb(20, 188, 220)',
          width: 1
        })
      }
    ];
    let LABEL_RULES = [
      {
        dataLayer: 'iapp',
        symbolizer: new IAPPTextSymbolizer(),
      },
      {
        dataLayer: 'invasives',
        symbolizer: new InvasivesTextSymbolizer()
      }
    ];

    var layer = protomaps.leafletLayer({
      url: 'https://nrs.objectstore.gov.bc.ca/uphjps/invasives.pmtiles',
      paint_rules: PAINT_RULES,
      label_rules: LABEL_RULES
    });

    layer.options.zIndex = 9999;

    if (!map.hasLayer(layer)) {
      container.addLayer(layer);
    }

    return () => {
      container.removeLayer(layer);
    };
  }, []);

  return null;
};
