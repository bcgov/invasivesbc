import { Button, IconButton, Paper, Popover } from '@mui/material';
import { LayersControlProvider } from 'components/map/LayerPicker/layerControlContext';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON, useMapEvent } from 'react-leaflet';

const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right'
};
const interactiveGeometryStyle = () => {
  return {
    color: '#3388ff',
    weight: 5,
    opacity: 0.5,
    stroke: true,
    clickable: true,
    fill: false
  };
};

export const MobilePolylineDrawButton = ({ convertLineStringToPoly, setGeometry, context }) => {
  const positionClass = POSITION_CLASSES.topleft;
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [locArray, setLocArray] = useState([]);
  const divRef = useRef();
  const open = Boolean(anchorEl);
  const id = open ? 'polylineDraw' : undefined;

  const [geoToConvert, setGeoToConvert] = useState(null);

  useEffect(() => {
    if (locArray.length > 1) {
      setGeoToConvert({
        type: 'Feature',
        geometry: {
          coordinates: locArray,
          type: 'LineString'
        },
        properties: {}
      });
    }
  }, [locArray]);

  useEffect(() => {
    if (divRef?.current) L.DomEvent.disableClickPropagation(divRef?.current);
  }, []);

  useMapEvent('click', (e) => {
    const loc = e.latlng;
    if (drawMode) {
      setLocArray([...locArray, [loc.lng, loc.lat]]);
    }
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const deleteLastPoint = () => {
    if (locArray.length > 1) {
      const tempArr = [];
      for (var i = 0; i < locArray.length - 1; i++) {
        tempArr.push(locArray[i]);
      }
      setLocArray(tempArr);
    }
    if (locArray.length === 1) {
      setLocArray([]);
    }
  };

  const drawModeChange = () => {
    setDrawMode(!drawMode);
    handleClose();
    if (drawMode) {
      const poly = convertLineStringToPoly(geoToConvert);
      setGeometry([poly]);
      setGeoToConvert(null);
      setLocArray([]);
    }
    if (!drawMode) {
      context.clearLayers();
      setGeoToConvert(null);
    }
  };

  return (
    <LayersControlProvider value={null}>
      <div ref={divRef} className={positionClass}>
        <Paper>
          <IconButton
            className="leaflet-control leaflet-bar"
            style={{
              borderRadius: 5,
              height: 46,
              width: 46,
              position: 'absolute',
              marginTop: 76
            }}
            onClick={handleClick}></IconButton>
        </Paper>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          disableEnforceFocus={true}
          disableRestoreFocus={true}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}>
          <div style={{ display: 'flex', flexFlow: 'row nowrap', backgroundColor: '#a0a098', borderRadius: 5 }}>
            <Button onClick={drawModeChange}>{drawMode ? <>Finish</> : <>Start</>}</Button>
            <Button onClick={deleteLastPoint}>Delete last point</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </div>
        </Popover>
      </div>
      {
        geoToConvert && <GeoJSON key={Math.random()} data={geoToConvert} style={interactiveGeometryStyle} /> //NOSONAR
      }
    </LayersControlProvider>
  );
};
