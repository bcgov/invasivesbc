import React, { useState, useEffect } from 'react';
import { Marker, useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { useDataAccess } from 'hooks/useDataAccess';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import marker from '../Icons/POImarker.png';

export const PoisLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [pois, setPois] = useState(null);
  const [things, setThings] = useState([]);
  const dataAccess = useDataAccess();

  useEffect(() => {
    if (things.length > 0) {
      console.log(things);
      fetchPOIs();
    }
  }, [things]);

  const markerIcon = L.icon({
    iconUrl: marker,
    iconSize: [16, 16]
  });
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
    const poisIDArray = [];

    poisData?.rows.forEach((row) => {
      poisFeatureArray.push(row.geojson);
      poisIDArray.push(row.geojson.properties.point_of_interest_id.toString());
    });

    setThings(poisIDArray);
    setPois({ type: 'FeatureCollection', features: poisFeatureArray });
  };

  const fetchPOIs = async () => {
    console.log('fetching');
    console.log(await dataAccess.getPointsOfInterest({ point_of_interest_ids: things, limit: 50 }));
  };

  return (
    <>
      {
        //pois && <GeoJSONVtLayer geoJSON={pois} options={options} /> //NOSONAR
        pois &&
          pois.features.map((feature) => {
            var coords = feature.geometry.coordinates;
            return <Marker position={[coords[1], coords[0]]} icon={markerIcon}></Marker>;
          })
      }
    </>
  );
};
