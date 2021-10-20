import React, { useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { useDataAccess } from 'hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';

export const PoisLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [pois, setPois] = useState(null);
  const dataAccess = useDataAccess();
  const options = {
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    style: {
      fillColor: '#00000',
      color: '#00000',
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity - 0.2,
      weight: 5
    }
  };

  useMapEvent('moveend', () => {
    fetchData();
  });

  const fetchData = async () => {
    const poisData = await dataAccess.getPointsOfInterestLean({ search_feature: mapBounds });
    const poisFeatureArray = [];

    poisData?.rows.forEach((row) => {
      poisFeatureArray.push(row.geojson);
    });

    setPois({ type: 'FeatureCollection', features: poisFeatureArray });
  };

  console.log('pois', pois);

  return (
    <>
      {
        pois && <GeoJSONVtLayer geoJSON={pois} options={options} /> //NOSONAR
      }
    </>
  );
};
