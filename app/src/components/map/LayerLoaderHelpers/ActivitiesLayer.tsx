import React, { useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';

export const ActivitiesLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [activities, setActivities] = useState(null);
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
    const activitiesData = await dataAccess.getActivitiesLean({ search_feature: mapBounds });
    const activitiesFeatureArray = [];

    activitiesData.rows.forEach((row) => {
      activitiesFeatureArray.push(row.geojson);
    });

    setActivities({ type: 'FeatureCollection', features: activitiesFeatureArray });
  };

  return (
    <>
      {
        activities && <GeoJSONVtLayer geoJSON={activities} options={options} /> //NOSONAR
      }
    </>
  );
};
