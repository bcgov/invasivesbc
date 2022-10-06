import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useState } from 'react';
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
      color: '#00000',
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity - 0.2,
      weight: 5
    }
  });

  const getSldStylesFromLocalFile = async () => {
    const sldParser = new SLDParser();
    const style = await sldParser.readStyle(RisoSLD); //NOSONAR
    return style;
  };

  useMapEvent('moveend', () => {
    getSldStylesFromLocalFile().then((res) => {
      setOptions((prevOptions) => ({ ...prevOptions, layerStyles: res }));
      fetchData();
    });
  });

  const fetchData = async () => {
    const risosData = await dataAccess.getRISOs({ search_feature: mapBounds });
    let risosFeatureArray = [];
    risosData?.forEach((row) => {
      risosFeatureArray.push(row.geojson ? row.geojson : row);
    });
    setRISO({ type: 'FeatureCollection', features: risosFeatureArray });
  };

  return (
    <>
      {
        riso && <GeoJSONVtLayer zIndex={props.zIndex} geoJSON={riso} options={options} /> //NOSONAR
      }
    </>
  );
};
