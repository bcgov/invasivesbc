import React, { useEffect, useState, useContext } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import SLDParser from 'geostyler-sld-parser';
import { JurisdictionSLD } from '../SldStyles/jurisdiction_sld';
import { useDataAccess } from 'hooks/useDataAccess';
import { DatabaseContext2 } from 'contexts/DatabaseContext2';

export const JurisdictionsLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [jurisdictions, setJurisdictions] = useState(null);
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext2);
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

  return (
    <>
      {
        jurisdictions && <GeoJSONVtLayer geoJSON={jurisdictions} options={options} /> //NOSONAR
      }
    </>
  );
};
