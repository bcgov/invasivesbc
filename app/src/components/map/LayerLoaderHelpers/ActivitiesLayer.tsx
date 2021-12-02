import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

const getSearchFeature = (layer_code: string) => {
  var type = { activity_type: null, activity_subtype: null };
  switch (layer_code) {
    case 'terrestrial_observations':
      type = { activity_type: 'observations', activity_subtype: 'plant_terrestrial' };
      return type;
    case 'aquatic_observations':
      type = { activity_type: 'observations', activity_subtype: 'plant_aquatic' };
      return type;
    case 'terrestrial_chemical_treatment':
      type = { activity_type: 'chemical_treatment', activity_subtype: 'plant_terrestrial' };
      return type;
    case 'aquatic_chemical_treatment':
      type = { activity_type: 'chemical_treatment', activity_subtype: 'plant_aquatic' };
      return type;
    case 'terrestrial_mechanical_treatment':
      type = { activity_type: 'mechanical_treatment', activity_subtype: 'plant_terrestrial' };
      return type;
    case 'aquatic_mechanical_treatment':
      type = { activity_type: 'mechanical_treatment', activity_subtype: 'plant_aquatic' };
      return type;
    case 'chemical_monitoring':
      type = { activity_subtype: 'chemical', ...type };
      return type;
  }
};

export const ActivitiesLayer = (props) => {
  const map = useMap();
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
