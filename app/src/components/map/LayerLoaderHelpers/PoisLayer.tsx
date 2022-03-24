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

  useMapEvent('moveend', () => {
    fetchData();
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const poisData = await dataAccess.getPointsOfInterestLean(
      { search_feature: mapBounds, isIAPP: true, point_of_interest_type: props.poi_type },
      databaseContext
    );

    const poisFeatureArray = [];
    poisData?.rows?.forEach((row) => {
      if (row.geom) poisFeatureArray.push(row.geom);
    });

    setPois({ type: 'FeatureCollection', features: poisFeatureArray });

    const poiArr = poisData?.rows?.map((row) => {
      return {
        id: row.point_of_interest_id,
        type: row.point_of_interest_type,
        subtype: row.point_of_interest_subtype,
        species_positive: row.species_on_site
      };
    });
    setCurrentRecords((prev) => {
      return { ...prev, pois: [...poiArr] };
    });
  };

  if (!pois) {
    return null;
  }

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
