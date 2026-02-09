import { useEffect, useRef } from 'react';
import maplibregl, { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';
import { centroid } from '@turf/centroid';
import { bbox } from '@turf/bbox';

import './formMap.css';

type PropTypes = {
  geojson: GeoJSON.Polygon | GeoJSON.Feature;
};

const FormMap = ({ geojson }: PropTypes) => {
  const SRC = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const mapRef = useRef<HTMLDivElement>(null);
  const map= useRef<maplibregl.Map | undefined>(undefined);

  const mapCenter: LngLatLike = (() => {
    if (!geojson) return [-121, 54] as LngLatLike;
    else return centroid(geojson).geometry.coordinates as LngLatLike;
  })();

  useEffect(() => {
    // Init Map after load
    map.current =
      new maplibregl.Map({
        container: 'map',
        center: mapCenter,
        zoom: 8,
        style: {
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [SRC],
              tileSize: 256,
              maxzoom: 18
            }
          },
          layers: [
            {
              id: 'raster-tiles',
              type: 'raster',
              source: 'raster-tiles'
            }
          ],
          version: 8
        }
      }
    );
  }, [geojson]);

  useEffect(() => {
    // Apply Geometry + Layer
    if (!map.current || !geojson) return;

    map.current.on('load', () => {
      if (geojson) {
        map.current?.addSource('form-feature', {
          type: 'geojson',
          data: geojson
        });
        map.current?.addLayer({
          id: 'form-feature',
          type: 'fill',
          source: 'form-feature',
          layout: {},
          paint: {
            'fill-color': 'orange',
            'fill-opacity': 0.6
          }
        });
        const bounds = bbox(geojson) as LngLatBoundsLike;
        map.current?.fitBounds(bounds, {
          padding: 10,
          minZoom: 8
        });
      }
    });

  }, [map]);
  return (
    <div>
      <div id="map" ref={mapRef} />
    </div>
  );
};

export default FormMap;
