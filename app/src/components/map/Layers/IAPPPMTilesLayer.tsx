import * as protomaps from 'protomaps';
import React, {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {useLeafletContext} from '@react-leaflet/core';

export const IAPPPMTilesLayer = (props) => {
  const map = useMap();
  const context = useLeafletContext();
  const container = context.layerContainer || context.map;

  const onFirstRender = useEffect(() => {
    class IAPPTextSymbolizer {
      place(layout,geom,feature) {
        if (layout.zoom < 15)
          return;

        let pt = geom[0][0]
        let name = `Site ${feature.props.site_id}: ${feature.props.species}`

        const font = "12px serif"

        layout.scratch.font = font
        let metrics = layout.scratch.measureText(name)
        let width = metrics.width
        let ascent = metrics.actualBoundingBoxAscent
        let descent = metrics.actualBoundingBoxDescent
        let bbox = {minX:pt.x-width/2,minY:pt.y-ascent,maxX:pt.x+width/2,maxY:pt.y+descent}

        let draw = ctx => {
          ctx.font = font
          ctx.fillStyle = "white"
          ctx.fillText(name,-width/2,20)
        }
        return [{anchor:pt,bboxes:[bbox],draw:draw}]
      }
    }

    let PAINT_RULES = [
      {
        dataLayer: 'iapp',
        symbolizer: new protomaps.CircleSymbolizer({
          fill: (z: number, p: any) => {
            switch (p.props.site_id) {
              default:
                return 'blue';
            }
          },
          opacity: 0.6,
          stroke: 'blue',
          width: 1
        })
      }
    ];

    let LABEL_RULES = [
      {
        dataLayer: 'iapp',
        symbolizer: new IAPPTextSymbolizer()
      }
    ];

    var layer = protomaps.leafletLayer({
      url: 'https://nrs.objectstore.gov.bc.ca/seeds/iapp.pmtiles',
      paint_rules: PAINT_RULES,
      label_rules: LABEL_RULES
    });

    layer.options.zIndex = 3005;

    if (!map.hasLayer(layer)) {
      container.addLayer(layer);
    }

    return () => {
      container.removeLayer(layer);
    };
  });

  return null;
};
