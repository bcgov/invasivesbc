import React, {useEffect, useRef, useState} from 'react';
import maplibregl from "maplibre-gl";
import {PMTiles, Protocol} from 'pmtiles';
import {OBJECTSTORE_ROOT} from 'constants';
import './map.css';

const Map: React.FC = () => {
  const map = useRef<maplibregl.Map|undefined>(undefined);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const pmtilesProtocol = new Protocol();

    maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

    pmtilesProtocol.add(new PMTiles(`${OBJECTSTORE_ROOT}nts-grid-50k-082E01.pmtiles`))

    map.current = new maplibregl.Map({
      container: 'map',
      zoom: 4,
      style: {
        version: 8,
        sources: {
          'Esri-Topo': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Powered by ESRI',
            maxzoom: 18
          },
    'proto': {
      type: 'raster',
        url: `pmtiles://${OBJECTSTORE_ROOT}/nts-grid-50k-082E01.pmtiles`,
        minzoom: 5,
        maxzoom: 16
    }
      },
        layers: [
          {
            id: 'topo',
            type: 'raster',
            source: 'Esri-Topo',
          },
          {
            id: 'proto',
            type: 'raster',
            source: 'proto',
            paint: {
              "raster-opacity": 0.7
            },
            minzoom: 6,
            maxzoom: 24

          }
        ]

      },
      center: [-125, 54],
    });




    map.current.once('idle', () => {
      setMapReady(true)
    })
  }, []);

  useEffect(() => {
    if (!map.current)
      return;

    if (!mapReady)
      return;

  }, [mapReady]);
  return (


    <div id='map'>
    </div>

  );
}

export default Map;
