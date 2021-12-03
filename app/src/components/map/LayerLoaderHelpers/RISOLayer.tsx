import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useEffect, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import SLDParser from 'geostyler-sld-parser';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { RisoSLD } from '../SldStyles/riso_sld';

export const RISOLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [riso, setRISO] = useState(null);
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
    let styles = await sldParser.readStyle(RisoSLD);
    return styles;
  };

  useMapEvent('moveend', () => {
    getSldStylesFromLocalFile().then((res) => {
      setOptions((prevOptions) => ({ ...prevOptions, layerStyles: res }));
      fetchData();
    });
  });

  const fetchData = async () => {
    console.log('risoData await');
    const risosData = await dataAccess.getRISOs({ search_feature: mapBounds }, databaseContext);
    let risosFeatureArray = [];
    console.log('risoData rows', risosData);
    risosData?.rows.forEach((row) => {
      risosFeatureArray.push(row.geojson ? row.geojson : row);
    });

    console.log('risoData set');
    setRISO({ type: 'FeatureCollection', features: risosFeatureArray });
  };

  useEffect(() => {
    console.log('riso', riso);
  }, [riso]);

  return (
    <>
      {
        riso && <GeoJSONVtLayer zIndex={props.zIndex} geoJSON={riso} options={options} /> //NOSONAR
      }
    </>
  );
};
