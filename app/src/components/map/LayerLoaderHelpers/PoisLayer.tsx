import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useState } from 'react';
import { Marker, Tooltip, useMap, useMapEvent } from 'react-leaflet';
import marker from '../Icons/POImarker.png';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const PoisLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const mapRequestContext = useContext(MapRequestContext);
  const { setCurrentRecords } = mapRequestContext;
  const [pois, setPois] = useState(null);
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);

  const markerIcon = L.icon({
    iconUrl: marker,
    iconSize: [16, 16]
  });
  const options = {
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    style: {
      fillColor: '#2CFA1F',
      color: '#2CFA1F',
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity - 0.2,
      weight: 5
    }
  };

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useMapEvent('zoomend', () => {
    fetchData();
  });

  useEffect(() => {
    if (isReady) {
      fetchData();
    }
  }, [isReady]);

  const fetchData = async () => {
    const poisData = await dataAccess.getPointsOfInterestLean(
      { search_feature: mapBounds, isIAPP: true, point_of_interest_type: props.poi_type },
      databaseContext
    );

    const poisFeatureArray = [];
    poisData?.rows?.forEach((row) => {
      poisFeatureArray.push(row.geojson ? row.geojson : row);
    });

    setPois({ type: 'FeatureCollection', features: poisFeatureArray });
  };

  useEffect(() => {
    if (pois) {
      const poiArr = pois.features.map((feature) => {
        return {
          id: 'IAPP: ' + feature.properties.site_id,
          species_positive: feature.properties.species_on_site
        };
      });
      setCurrentRecords((prev) => {
        return { ...prev, pois: [...poiArr] };
      });
    }
  }, [pois]);

  if (!pois) {
    return null;
  }

  // map zoom check: console.log(map.getZoom());

  return (
    <>
      {map.getZoom() < 16 ? (
        <GeoJSONVtLayer geoJSON={pois} zIndex={props.zIndex} options={options} />
      ) : (
        <>
          {pois.features.map((feature) => {
            var coords = feature.geometry.coordinates;
            return (
              <Marker position={[coords[1], coords[0]]} icon={markerIcon}>
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                  {feature.properties.species_on_site.toString()}
                </Tooltip>
              </Marker>
            );
          })}
        </>
      )}
    </>
  );
};
