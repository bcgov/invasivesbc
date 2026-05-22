import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import * as geojson from 'geojson';
import { Protocol } from 'pmtiles';
import './map.css';
import MapGenerationRequestsTable from 'map-components/map_generation_requests_table';
import MapGenerationRecordsTable, { MapRecord } from 'map-components/map_generation_records_table';
import MapGenerationRequestForm from 'map-components/map_generation_request_form';
import { NavLink, Route, Routes, useLocation, useMatch } from 'react-router';
import MapGenerationRequestMonitor from 'map-components/map_generation_request_monitor';

type point = {
  lat: number;
  lng: number;
};

const Map: React.FC = () => {
  const map = useRef<maplibregl.Map | undefined>(undefined);
  const [mapReady, setMapReady] = useState(false);

  const [activeProtomapLayer, setActiveProtomapLayer] = useState<MapRecord | undefined>();

  const [clickedPoints, setClickedPoints] = useState<point[]>([]);
  const [drawnBounds, setDrawnBounds] = useState<geojson.Polygon | undefined>(undefined);

  const enableDrawnBounds = useMatch('/map/create') != null;

  const onRecordsPage = useMatch('/map/records/*') != null;
  const onMonitoringPage = useMatch('/map/monitor/*') != null;
  const enableActiveProtomapLayer = onRecordsPage || onMonitoringPage;

  const { pathname } = useLocation();

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
          }
        },
        layers: [
          {
            id: 'topo',
            type: 'raster',
            source: 'Esri-Topo'
          }
        ]
      },
      center: [-125, 54]
    });

    map.current.once('idle', () => {
      setMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!map.current || !mapReady) {
      return;
    }
    map.current.addSource('drawn-bounds', {
      type: 'geojson',
      data: drawnBounds || {
        type: 'FeatureCollection',
        features: []
      }
    });

    map.current.addLayer({
      id: `drawn-bounds`,
      type: 'line',
      source: `drawn-bounds`,
      paint: {
        'line-color': '#00ff00',
        'line-width': 4
      },
      minzoom: 0,
      maxzoom: 24
    });

    return () => {
      map.current?.removeLayer('drawn-bounds');
      map.current?.removeSource('drawn-bounds');
    };
  }, [drawnBounds, map.current, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady) {
      return;
    }

    if (activeProtomapLayer !== undefined && enableActiveProtomapLayer) {
      map.current.addSource(activeProtomapLayer.file_name, {
        type: 'raster',
        url: `pmtiles://${activeProtomapLayer.download_link}`,
        minzoom: activeProtomapLayer.minimum_zoom,
        maxzoom: activeProtomapLayer.maximum_zoom
      });

      map.current.addLayer({
        id: activeProtomapLayer.file_name,
        type: 'raster',
        source: activeProtomapLayer.file_name,
        paint: {
          'raster-opacity': 0.7
        }
      });

      map.current.addSource(`bounds-${activeProtomapLayer.file_name}`, {
        type: 'geojson',
        data: activeProtomapLayer.bounds
      });

      map.current.addLayer({
        id: `bounds-${activeProtomapLayer.file_name}`,
        type: 'line',
        source: `bounds-${activeProtomapLayer.file_name}`,
        paint: {
          'line-color': '#ff0000',
          'line-width': 3
        },
        minzoom: 0,
        maxzoom: 24
      });

      map.current.zoomTo(Math.max(activeProtomapLayer.minimum_zoom, 5));
      map.current.setCenter([activeProtomapLayer.centroid.coordinates[0], activeProtomapLayer.centroid.coordinates[1]]);

      return () => {
        map.current?.removeLayer(`bounds-${activeProtomapLayer.file_name}`);
        map.current?.removeLayer(activeProtomapLayer.file_name);
        map.current?.removeSource(activeProtomapLayer.file_name);
        map.current?.removeSource(`bounds-${activeProtomapLayer.file_name}`);
      };
    }
  }, [activeProtomapLayer, enableActiveProtomapLayer, drawnBounds, map.current, mapReady]);

  useEffect(() => {
    // clear state on page change
    setActiveProtomapLayer(undefined);
    setDrawnBounds(undefined);
    setClickedPoints([]);
  }, [pathname]);

  const mapClickHandler = (record: MapRecord) => {
    setActiveProtomapLayer(record);
  };

  useEffect(() => {
    if (!map.current) return;

    if (!mapReady) return;

    if (!enableDrawnBounds) {
      setDrawnBounds(undefined);
      if (clickedPoints.length > 0) {
        setClickedPoints([]);
      }
      return;
    }

    map.current.on('click', (e) => {
      const current = clickedPoints;
      current.push({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      setClickedPoints(current);

      if (current.length == 2) {
        const a = current[0];
        const b = current[1];
        const polygon: geojson.Polygon = {
          type: 'Polygon',
          coordinates: [
            [
              [a.lng, a.lat],
              [b.lng, a.lat],
              [b.lng, b.lat],
              [a.lng, b.lat],
              [a.lng, a.lat]
            ]
          ]
        };
        setDrawnBounds(polygon);
        setClickedPoints([]);
      }
    });
  }, [mapReady, clickedPoints, enableDrawnBounds]);

  return (
    <>
      <div id="map"></div>
      <div id="maplinks">
        <NavLink to={'/map/requests'}>Requests</NavLink>
        <NavLink to={'/map/records/personal'}>Records (Personal)</NavLink>
        <NavLink to={'/map/records/public'}>Records (Public)</NavLink>
        <NavLink to={'/map/create'}>Create</NavLink>
      </div>
      <Routes>
        <Route path="/requests" element={<MapGenerationRequestsTable />} />
        <Route path="/create" element={<MapGenerationRequestForm boundingPolygon={drawnBounds} />} />
        <Route path="/monitor/:id" element={<MapGenerationRequestMonitor setMap={mapClickHandler} />} />
        <Route
          path="/records/personal"
          element={<MapGenerationRecordsTable setMap={mapClickHandler} source={'owned'} />}
        />
        <Route
          path="/records/public"
          element={<MapGenerationRecordsTable setMap={mapClickHandler} source={'public'} />}
        />
      </Routes>
    </>
  );
};

export default Map;
