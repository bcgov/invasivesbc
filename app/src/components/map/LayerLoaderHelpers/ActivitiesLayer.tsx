import { MapRequestContext } from 'contexts/MapRequestsContext';
import React, { useContext, useEffect, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const ActivitiesLayer = (props) => {
  const map = useMap();
  const mapRequestContext = useContext(MapRequestContext);
  const { setCurrentRecords } = mapRequestContext;
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [activities, setActivities] = useState(null);
  const dataAccess = useDataAccess();
  const options = {
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    style: {
      fillColor: props.color_code || '#0000ff',
      color: props.color_code || '#0000ff',
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity / 2,
      weight: 5,
      zIndex: 1000000
    }
  };

  const fetchData = async () => {
    const activitiesData = await dataAccess.getActivitiesLean({
      search_feature: mapBounds,
      activity_subtype: [props.activity_subtype]
    });
    console.log('ActivitiesData: ', activitiesData);
    const activitiesFeatureArray = [];
    activitiesData?.rows?.forEach((row) => {
      activitiesFeatureArray.push(row.geojson ? row.geojson : row);
    });
    setActivities({ type: 'FeatureCollection', features: activitiesFeatureArray });
  };

  useMapEvent('moveend', () => {
    fetchData();
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activities) {
      const actArr = activities.features.map((feature) => {
        return feature.properties;
      });
      setCurrentRecords((prev) => {
        return { ...prev, activities: [...actArr] };
      });
    }
  }, [activities]);

  return (
    <>
      {
        activities && <GeoJSONVtLayer geoJSON={activities} zIndex={props.zIndex} options={options} /> //NOSONAR
      }
    </>
  );
};
