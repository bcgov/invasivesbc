import { Snackbar } from '@mui/material';
import { Alert } from '@mui/lab';
import { DatabaseContext } from 'contexts/DatabaseContext';
import SLDParser from 'geostyler-sld-parser';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
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
  const [openZoomWarning, setOpenZoomWarning] = React.useState(false);

  const getSldStylesFromLocalFile = async () => {
    const sldParser = new SLDParser();
    let styles = await sldParser.readStyle(JurisdictionSLD);
    return styles;
  };

  const getJurisdictionFeatures = () => {
    if (map.getZoom() > 10) {
      setOpenZoomWarning(false);
      getSldStylesFromLocalFile().then((res) => {
        setOptions((prevOptions) => ({ ...prevOptions, layerStyles: res }));
        fetchData();
      });
    } else {
      setOpenZoomWarning(true);
    }
  };

  useMapEvents({
    moveend: () => {
      getJurisdictionFeatures();
    },
    zoomend: () => {
      getJurisdictionFeatures();
    },
    dragend: () => {
      getJurisdictionFeatures();
    }
  });

  useEffect(() => {
    getJurisdictionFeatures();
  }, []);

  const fetchData = async () => {
    const jurisdictionsData = await dataAccess.getJurisdictions({ search_feature: mapBounds }, databaseContext);
    let jurisdictionsFeatureArray = [];
    jurisdictionsData?.result?.forEach((row) => {
      jurisdictionsFeatureArray.push(row.geojson ? row.geojson : row);
    });
    setJurisdictions({ type: 'FeatureCollection', features: jurisdictionsFeatureArray });
  };

  return (
    <>
      {
        jurisdictions && <GeoJSONVtLayer geoJSON={jurisdictions} zIndex={props.zIndex} options={options} /> //NOSONAR
      }
      <Snackbar open={openZoomWarning} autoHideDuration={6000}>
        <Alert severity="warning" style={{ width: '100%' }}>
          Zoom in to render Jurisdictions layer.
        </Alert>
      </Snackbar>
    </>
  );
};
