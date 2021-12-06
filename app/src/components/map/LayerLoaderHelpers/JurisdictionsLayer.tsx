import { DatabaseContext } from 'contexts/DatabaseContext';
import SLDParser from 'geostyler-sld-parser';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useEffect, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { JurisdictionSLD } from '../SldStyles/jurisdiction_sld';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const JurisdictionsLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [jurisdictions, setJurisdictions] = useState(null);
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
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
    console.log('styles', styles);
    return styles;
  };

  useMapEvent('moveend', () => {
    getSldStylesFromLocalFile().then((res) => {
      setOptions((prevOptions) => ({ ...prevOptions, layerStyles: res }));
      fetchData();
    });
  });

  const fetchData = async () => {
    const jurisdictionsData = await dataAccess.getJurisdictions({ search_feature: mapBounds }, databaseContext);
    let jurisdictionsFeatureArray = [];
    jurisdictionsData?.rows.forEach((row) => {
      jurisdictionsFeatureArray.push(row.geojson ? row.geojson : row);
    });

    setJurisdictions({ type: 'FeatureCollection', features: jurisdictionsFeatureArray });
  };

  useEffect(() => {
    if (jurisdictions) {
      console.log('jurisdictions', jurisdictions);
    }
  }, [jurisdictions]);

  return (
    <>
      {
        jurisdictions && <GeoJSONVtLayer zIndex={props.zIndex} geoJSON={jurisdictions} options={options} /> //NOSONAR
      }
    </>
  );
};
