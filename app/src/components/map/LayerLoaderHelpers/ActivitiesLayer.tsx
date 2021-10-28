import React, { useContext, useEffect, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { DatabaseContext2 } from 'contexts/DatabaseContext2';

export const ActivitiesLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [activities, setActivities] = useState(null);
  const databaseContext = useContext(DatabaseContext2);
  const dataAccess = useDataAccess();
  const options = {
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    style: {
      fillColor: props.color,
      color: props.color,
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
        activities && <GeoJSONVtLayer geoJSON={activities} options={options} /> //NOSONAR
        /*activities &&
          activities.features.map((activity) => (
            <GeoJSON data={activity} style={options.style} key={Math.random()}>
              {console.log(activity)}
              <Tooltip>
                <Typography>{activity.properties.created}</Typography>
                <Typography>{activity.properties.subtype}</Typography>
                <Typography>{activity.properties.id}</Typography>
              </Tooltip>
            </GeoJSON>
          ))*/
      }
    </>
  );
};
