import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L, { LatLngBoundsExpression } from 'leaflet';
import React, { useContext, useEffect, useState } from 'react';
import { Marker, SVGOverlay, Tooltip, useMap, useMapEvent } from 'react-leaflet';
import marker from '../Icons/POImarker.png';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const PoisLayer = (props) => {
  const map = useMap();
  const [pois, setPois] = useState(null);
  const [isReady, setIsReady] = useState(false);
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

  useEffect(() => {
    fetchData();
    return () => {
      setPois(null);
      setIsReady(false);
    };
  }, []);

  useMapEvent('zoomend', async () => {
    await fetchData();
  });

  useEffect(() => {
    if (pois) setIsReady(true);

    return () => {
      setIsReady(false);
    };
  }, [pois]);

  const fetchData = async () => {
    const newMapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();

    const poisData = await dataAccess.getPointsOfInterestLean(
      { search_feature: newMapBounds, isIAPP: true },
      databaseContext
    );

    const poisFeatureArray = [];
    poisData?.rows?.forEach((row) => {
      poisFeatureArray.push(row.geojson ? row.geojson : row);
    });

    setPois({ type: 'FeatureCollection', features: poisFeatureArray });
  };

  if (!pois || !isReady) {
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
