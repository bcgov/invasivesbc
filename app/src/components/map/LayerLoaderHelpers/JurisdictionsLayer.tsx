import React, { useEffect, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import SLDParser from 'geostyler-sld-parser';
import { JurisdictionSLD } from '../SldStyles/jurisdiction_sld';

export const JurisdictionsLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [jurisdictions, setJurisdictions] = useState(null);
  const invasivesApi = useInvasivesApi();
  const [options, setOptions] = useState({
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    layerStyles: {},
    style: {
      fillColor: '#00000',
      color: '#00000',
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity - 0.2,
      weight: 5
    }
  });

  const getSldStylesFromLocalFile = async () => {
    const sldParser = new SLDParser();
    let styles = await sldParser.readStyle(JurisdictionSLD);
    return styles;
  };

  useEffect(() => {
    getSldStylesFromLocalFile().then((res) => {
      setOptions((prevOptions) => ({ ...prevOptions, layerStyles: res }));
    });
  }, []);

  useMapEvent('moveend', () => {
    fetchData();
  });

  const fetchData = async () => {
    const jurisdictionsData = await invasivesApi.getJurisdictions({ search_feature: mapBounds });
    const jurisdictionsFeatureArray = [];
    jurisdictionsData.rows.forEach((row) => {
      jurisdictionsFeatureArray.push({
        type: 'Feature',
        properties: { type: row.jurisdictn, layer: 'jurisdiction' },
        geometry: row.geom
      });
    });

    console.log(options);
    console.log(jurisdictionsFeatureArray);
    setJurisdictions({ type: 'FeatureCollection', features: jurisdictionsFeatureArray });
  };

  return (
    <>
      {
        jurisdictions && <GeoJSONVtLayer geoJSON={jurisdictions} options={options} /> //NOSONAR
      }
    </>
  );
};
