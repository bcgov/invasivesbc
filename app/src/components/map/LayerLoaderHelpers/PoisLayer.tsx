import { MapRequestContext } from 'contexts/MapRequestsContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useState } from 'react';
import { Marker, Tooltip, useMap, useMapEvent } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import marker from '../Icons/POImarker.png';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { GeneratePopup } from '../Tools/ToolTypes/Data/InfoAreaDescription';
import { polygon } from '@turf/helpers';
import iappLean from '../GeoTIFFs/zoom9.tiff'; // NOSONAR

var parseGeoraster = require('georaster');
var GeoRasterLayer = require('georaster-layer-for-leaflet');

const IAPPSite = L.icon({
  iconUrl: marker,
  iconSize: [20, 20] // size of the icon
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
    // to match the feature collection spatial filtering
    const newBounds = {
      type: 'FeatureCollection',
      features: [mapBounds]
    };
    const poisData = await dataAccess.getPointsOfInterestLean({
      search_feature: newBounds,
      isIAPP: true,
      point_of_interest_type: props.poi_type
    });

    const poisToSet = poisData.filter((row) => {
      return row?.geometry?.coordinates !== undefined;
    });

    setPois({ type: 'FeatureCollection', features: poisToSet });
    const poiArr = poisData?.rows?.map((row) => {
      return {
        id: row.properties.site_id,
        type: row.point_of_interest_type || null,
        subtype: row.point_of_interest_subtype || null,
        species_positive: row.properties.species_on_site
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
            const position = feature?.geometry?.coordinates;
            return <Marker position={[position[1], position[0]]} icon={IAPPSite} />;
          })}
        </MarkerClusterGroup>
      )}
      {map.getZoom() > 14 && (
        <>
          {pois?.features?.map((feature) => {
            const position = feature.geometry.coordinates;
            const val = 0.003;
            const bufferedGeo = {
              type: 'FeatureCollection',
              features: [
                polygon([
                  [
                    [position[0] + val, position[1] - val / 2],
                    [position[0] + val, position[1] + val / 2],
                    [position[0] - val, position[1] + val / 2],
                    [position[0] - val, position[1] - val / 2],
                    [position[0] + val, position[1] - val / 2]
                  ]
                ])
              ]
            };
            return (
              <Marker icon={IAPPSite} position={[position[1], position[0]]}>
                <Tooltip permanent direction="top" opacity={0.1}>
                  SiteID: {feature.properties.site_id}
                  <br />
                  {feature.properties.species_on_site.toString()}
                </Tooltip>
                <GeneratePopup bufferedGeo={bufferedGeo} />
              </Marker>
            );
          })}
        </>
      )}
    </>
  );
};
