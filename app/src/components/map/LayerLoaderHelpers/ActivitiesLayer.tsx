import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useDataAccess } from '../../../hooks/useDataAccess';
import MapRecordsDataGrid from '../MapRecordsDataGrid';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const ActivitiesLayer = (props) => {
  const map = useMap();
  const mapRequestContext = useContext(MapRequestContext);
  const { setCurrentRecords, layers } = mapRequestContext;
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [activities, setActivities] = useState(null);
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();
  const options = {
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    style: {
      fillColor: props.color_code,
      color: props.color_code,
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity - 0.2,
      weight: 5
    }
  };

  const fetchData = useCallback(async () => {
    const activitiesData = await dataAccess.getActivitiesLean({ search_feature: mapBounds }, databaseContext);
    const activitiesFeatureArray = [];
    activitiesData?.rows.forEach((row) => {
      activitiesFeatureArray.push(row.geojson ? row.geojson : row);
    });
    setActivities({ type: 'FeatureCollection', features: activitiesFeatureArray });
  }, [dataAccess, mapBounds, databaseContext]);

  useMapEvents({
    moveend: () => {
      fetchData();
    }
  });

  useEffect(() => {
    if (activities) {
      const actArr = activities.features.map((feature) => {
        return feature.properties;
      });
      setCurrentRecords(actArr);
    }
  }, [activities, setCurrentRecords]);

  return (
    <>
      {
        activities && <GeoJSONVtLayer geoJSON={activities} zIndex={props.zIndex} options={options} /> //NOSONAR
      }
    </>
  );
};
