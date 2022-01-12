import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRecordsContext } from 'contexts/MapRecordsContext';
import React, { useContext, useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const ActivitiesLayer = (props) => {
  const map = useMap();
  const mapRecordsContext = useContext(MapRecordsContext);
  const { setRecords } = mapRecordsContext;
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

  useMapEvents({
    moveend: () => {
      fetchData();
    },
    zoomend: () => {
      fetchData();
    },
    dragend: () => {
      fetchData();
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activities) {
      const actArr = activities.features.map((feature) => {
        return feature.properties;
      });
      setRecords(actArr);
    }
  }, [activities]);

  const fetchData = async () => {
    const activitiesData = await dataAccess.getActivitiesLean({ search_feature: mapBounds }, databaseContext);
    const activitiesFeatureArray = [];
    activitiesData?.rows.forEach((row) => {
      activitiesFeatureArray.push(row.geojson ? row.geojson : row);
    });
    setActivities({ type: 'FeatureCollection', features: activitiesFeatureArray });
  };

  return (
    <>
      {
        activities && <GeoJSONVtLayer geoJSON={activities} zIndex={props.zIndex} options={options} /> //NOSONAR
      }
    </>
  );
};
