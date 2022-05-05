import { MapRequestContext } from 'contexts/MapRequestsContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useState } from 'react';
import { Marker, Tooltip, useMap, useMapEvent } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import marker from '../Icons/POImarker.png';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import iappLean from '../GeoTIFFs/zoom9.tiff'; // NOSONAR
// import { GeoTIFFLayer } from '../GeoTIFFs/GeoTIFFLayer';

var parseGeoraster = require('georaster');
var GeoRasterLayer = require('georaster-layer-for-leaflet');

const IAPPSite = L.icon({
  iconUrl: marker,
  iconSize: [20, 20], // size of the icon
  iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

export const PoisLayer = (props) => {
  const map = useMap();
  const [mapBounds, setMapBounds] = useState(createPolygonFromBounds(map.getBounds(), map).toGeoJSON());
  const [pois, setPois] = useState(null);
  const [raster, setRaster] = useState();
  const [layer, setLayer] = useState<any>();
  const mapRequestContext = useContext(MapRequestContext);
  const { setCurrentRecords } = mapRequestContext;
  const layerRef = React.useRef(null);
  const dataAccess = useDataAccess();

  useEffect(() => {
    fetch(iappLean)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        parseGeoraster(arrayBuffer).then((georaster) => {
          setRaster(georaster);
        });
      });
  }, [iappLean]);

  useEffect(() => {
    if (raster) {
      setLayer(
        new GeoRasterLayer({
          zIndex: props.zIndex,
          opacity: props.opacity,
          georaster: raster,
          pixelValuesToColorFn: (values) => (values[1] === 128 ? 'green' : 'transparent'),
          resolution: 64,
          debugLevel: 0
        })
      );
    }
  }, [raster]);

  useEffect(() => {
    if (layer) {
      layerRef.current = layer;
      if (map.getZoom() < 9) {
        layer.addTo(map);
      }
    }
  }, [layer]);

  useEffect(() => {
    if (map.getZoom() > 8) {
      fetchData();
      if (layerRef.current) map.removeLayer(layerRef.current);
    }
  }, [mapBounds]);

  const settingBounds = () => {
    if (map.getZoom() > 8) {
      setMapBounds(createPolygonFromBounds(map.getBounds(), map).toGeoJSON());
    } else setPois([]);
  };

  useMapEvent('moveend', settingBounds);

  useMapEvent('zoomend', () => {
    settingBounds();
    if (map.getZoom() < 9 && layerRef.current) {
      layerRef.current.addTo(map);
    }
  });

  const fetchData = async () => {
    const poisData = await dataAccess.getPointsOfInterestLean({
      search_feature: mapBounds,
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
      return { ...prev, pois: [poiArr] };
    });
  };

  return (
    <>
      {map.getZoom() > 8 && map.getZoom() < 15 && (
        <MarkerClusterGroup chunkedLoading>
          {pois?.features?.map((feature) => {
            const coords = feature.geometry.coordinates;
            return <Marker position={[coords[1], coords[0]]} icon={IAPPSite}></Marker>;
          })}
        </MarkerClusterGroup>
      )}
      {map.getZoom() > 14 && (
        <>
          {pois?.features?.map((feature) => {
            const coords = feature.geometry.coordinates;
            return (
              <Marker icon={IAPPSite} position={[coords[1], coords[0]]}>
                <Tooltip direction="top">{feature.properties.species_on_site.toString()}</Tooltip>
              </Marker>
            );
          })}
        </>
      )}
    </>
  );
};
