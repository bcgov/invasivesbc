import * as pmtiles from 'pmtiles';
import * as protomaps from 'protomaps';
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const PMTileLayer = (props) => {
  const map = useMap();

  const onFirstRender = useEffect(() => {
    let PAINT_RULES = [
      {
        dataLayer: 'tippecanoe_input',
        symbolizer: new protomaps.PolygonSymbolizer({ fill: 'black', opacity: 1, }, )
      }
    ];

    let LABEL_RULES = []; // ignore for now

    //var layer = protomaps.leafletLayer({url:'https://nrs.objectstore.gov.bc.ca/uphjps/riso.pmtiles'})
    var layer = protomaps.leafletLayer({
      //url: 'https://nrs.objectstore.gov.bc.ca/uphjps/testlayer2.pmtiles',
      //url: 'https://nrs.objectstore.gov.bc.ca/uphjps/testlayer2.pmtiles',
      url: 'https://nrs.objectstore.gov.bc.ca/uphjps/riso.pmtiles',
      paint_rules: PAINT_RULES,
      label_rules: LABEL_RULES, 
        debug: 'true',
    });

    console.dir(layer)
    layer.options.zIndex = 3005;
    layer.addTo(map )
  }, [map]);
  return <></>;
};
