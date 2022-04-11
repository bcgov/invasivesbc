import { MapRequestContext } from 'contexts/MapRequestsContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useState } from 'react';
import { Marker, Tooltip, useMap, useMapEvent } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import marker from '../Icons/POImarker.png';
import IAPPSiteMarker from '../Icons/pinned.png';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import BC_AREA from '../BC_AREA.json';

const IAPPSite = L.icon({
  iconUrl: IAPPSiteMarker,
  //shadowUrl: 'leaf-shadow.png',
  iconSize: [38, 95], // size of the icon
  //shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  //shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  className: 'greenIconFilter'
});

export const PoisLayer = (props) => {
  const map = useMap();
  const [mapBounds, setMapBounds] = useState(createPolygonFromBounds(map.getBounds(), map).toGeoJSON());
  const mapRequestContext = useContext(MapRequestContext);
  const { setCurrentRecords } = mapRequestContext;
  const [pois, setPois] = useState(null);
  const dataAccess = useDataAccess();
  const [vPOIs, setVPOIs] = useState(null);

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
    if (map.getZoom() > 9) {
      setMapBounds(createPolygonFromBounds(map.getBounds(), map).toGeoJSON());
    }
  });

  useMapEvent('zoomend', () => {
    if (map.getZoom() > 9) {
      setMapBounds(createPolygonFromBounds(map.getBounds(), map).toGeoJSON());
    }
  });

  useEffect(() => {
    fetchData(map.getZoom() === 6);
  }, [map]);

  useEffect(() => {
    fetchData();
    console.log(mapBounds);
  }, [mapBounds]);

  const fetchData = async (isZoomSix?: boolean) => {
    const poisData = await dataAccess.getPointsOfInterestLean({
      search_feature: isZoomSix ? (BC_AREA.features[0] as any) : mapBounds,
      isIAPP: true,
      point_of_interest_type: props.poi_type
    });

    const poisFeatureArray = [];
    poisData?.rows?.forEach((row) => {
      if (row.geom) {
        const object = {
          geometry: row.geom.geometry,
          properties: {
            point_of_interest_id: row.point_of_interest_id,
            point_of_interest_payload: row.point_of_interest_payload,
            point_of_interest_subtype: row.point_of_interest_subtype,
            species_on_site: row.species_on_site
          },
          type: row.geom.type
        };
        poisFeatureArray.push(object);
      }
    });

    if (isZoomSix) {
      setVPOIs({ type: 'FeatureCollection', features: poisFeatureArray });
    } else {
      setPois({ type: 'FeatureCollection', features: poisFeatureArray });
    }
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
      {/* Removed for now: map.getZoom() < 16 ? (
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
        )*/}
      {/* Close Zoom Renders */}
      {map.getZoom() < 10 && vPOIs && <GeoJSONVtLayer geoJSON={vPOIs} zIndex={props.zIndex} options={options} />}
      {map.getZoom() > 9 && map.getZoom() < 15 && (
        <MarkerClusterGroup chunkedLoading>
          {pois.features.map((feature) => {
            const coords = feature.geometry.coordinates;
            return (
              <Marker
                key={feature.properties.point_of_interest_id}
                position={[coords[1], coords[0]]}
                icon={IAPPSite}></Marker>
            );
          })}
        </MarkerClusterGroup>
      )}
      {map.getZoom() > 14 && (
        <>
          {pois.features.map((feature) => {
            const coords = feature.geometry.coordinates;
            return (
              <Marker icon={markerIcon} position={[coords[1], coords[0]]}>
                <Tooltip direction="top">{feature.properties.species_on_site.toString()}</Tooltip>
              </Marker>
            );
          })}
        </>
      )}
    </>
  );
};
