import * as pmtiles from 'pmtiles';
import * as protomaps from 'protomaps';
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import centroid from '@turf/centroid';
import polygon from 'turf-polygon';
import { useLeafletContext } from '@react-leaflet/core';

export const PMTileLayer = (props) => {
  const map = useMap();
  const [layer, setLayer] = React.useState(null);
  const context = useLeafletContext();
  const container = context.layerContainer || context.map;

  const onFirstRender = useEffect(() => {
    let PAINT_RULES = [
      {
        dataLayer: 'tippecanoe_input',
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

    let LABEL_RULES = [
      {
        dataLayer: 'tippecanoe_input',
        symbolizer: new protomaps.PolygonLabelSymbolizer({
          label_props: ['code_name'],
          fill: 'white',
          font: '500 16px serif'
        })
      }
    ];

    var layer = protomaps.leafletLayer({
      url: 'https://nrs.objectstore.gov.bc.ca/uphjps/riso.pmtiles',
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
