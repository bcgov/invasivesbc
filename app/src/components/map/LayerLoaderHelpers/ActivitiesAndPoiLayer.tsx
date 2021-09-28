import React, { useEffect, useState } from 'react';
import { GeoJSON, useMap, useMapEvent } from 'react-leaflet';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { Feature, Geometry } from 'geojson';
import { Layer } from 'leaflet';
import { useDataAccess } from 'hooks/useDataAccess';

export const ActivitiesAndPoiLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [activities, setActivities] = useState(null);
  const [pois, setPois] = useState(null);
  const dataAccess = useDataAccess();

  useMapEvent('moveend', () => {
    fetchData();
  });

  const fetchData = async () => {
    const activitiesData = await dataAccess.getActivitiesLean({ search_feature: mapBounds });
    const poisData = await dataAccess.getPointsOfInterestLean({ search_feature: mapBounds });
    const activitiesFeatureArray = [];
    const poisFeatureArray = [];

    activitiesData.rows.forEach((row) => {
      activitiesFeatureArray.push(row.geojson);
    });

    poisData.rows.forEach((row) => {
      poisFeatureArray.push(row.geojson);
    });

    setActivities({ type: 'FeatureCollection', features: activitiesFeatureArray });
    setPois({ type: 'FeatureCollection', features: poisFeatureArray });
    console.log(pois);
  };

  const onEachFeature = props.customOnEachFeature
    ? props.customOnEachFeature
    : (feature: Feature<Geometry, any>, layer: Layer) => {
        const popupContent = `
          <div>
              <p>${feature.id}</p>                  
          </div>
        `;
        layer.bindPopup(popupContent);
      };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {
        activities && <GeoJSON key={Math.random()} onEachFeature={onEachFeature} data={activities} /> //NOSONAR
      }
      {
        pois && <GeoJSON key={Math.random()} onEachFeature={onEachFeature} data={pois} /> //NOSONAR
      }
    </>
  );
};
