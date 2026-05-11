import React, {useEffect, useRef, useState} from 'react';
import maplibregl from "maplibre-gl";
import {Protocol} from 'pmtiles';
import {OBJECTSTORE_ROOT} from 'constants';
import './map.css';
import MapGenerationRequestTable, {MapRecord} from "map-components/map_generation_requests_table";

const Map: React.FC = () => {
  const map = useRef<maplibregl.Map|undefined>(undefined);
  const [mapReady, setMapReady] = useState(false);

  const [ activeProtomapLayer, setActiveProtomapLayer ] = useState<MapRecord | undefined>();

  useEffect(() => {
    const pmtilesProtocol = new Protocol();

    maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

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
      },
        layers: [
          {
            id: 'topo',
            type: 'raster',
            source: 'Esri-Topo',
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
    if (!map.current) {
      return;
    }
    if (activeProtomapLayer !== undefined) {
      map.current.addSource(activeProtomapLayer.file_name, {
        type: 'raster',
          url: `pmtiles://${OBJECTSTORE_ROOT}/${activeProtomapLayer.file_name}`,
          minzoom: activeProtomapLayer.minimum_zoom,
          maxzoom: activeProtomapLayer.maximum_zoom
      })

      map.current.addLayer(
        {
          id: activeProtomapLayer.file_name,
          type: 'raster',
          source: activeProtomapLayer.file_name,
          paint: {
            "raster-opacity": 0.7
          },
        }
      )


      map.current.addSource(`bounds-${activeProtomapLayer.file_name}`, {
        type: 'geojson',
        data: activeProtomapLayer.bounds
      })


      map.current.addLayer(
        {
          id: `bounds-${activeProtomapLayer.file_name}`,
          type: 'line',
          source: `bounds-${activeProtomapLayer.file_name}`,
          paint: {
            'line-color': '#ff0000',
            'line-width': 3
          }  ,
          minzoom: 0,
          maxzoom: 24
        }
      )

      return () => {
        map.current?.removeLayer(`bounds-${activeProtomapLayer.file_name}`)
        map.current?.removeLayer(activeProtomapLayer.file_name)
        map.current?.removeSource(activeProtomapLayer.file_name)
        map.current?.removeSource(`bounds-${activeProtomapLayer.file_name}`)

      }
    }
  }, [activeProtomapLayer, map.current]);

  const mapClickHandler = (record: MapRecord) => {
    setActiveProtomapLayer(record)
  }

  useEffect(() => {
    if (!map.current)
      return;

    if (!mapReady)
      return;

  }, [mapReady]);
  return (
    <>
    <div id='map'>
    </div>
      <MapGenerationRequestTable setMap={mapClickHandler} />
    </>
  );
}

export default Map;
