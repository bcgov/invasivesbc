import { Capacitor } from '@capacitor/core';
import { Slider } from '@mui/material';
import React from 'react';

const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right'
};

export const ZoomBar = (props) => {
  const zoomFunction = (zoom) => {
    props?.map.setZoom(zoom + 5);
  };

  return (
    <div
      className={POSITION_CLASSES.bottomleft}
      onTouchStart={() => {
        props?.map.dragging.disable();
        props?.map.doubleClickZoom.disable();
      }}
      onTouchMove={() => {
        props?.map.dragging.disable();
        props?.map.doubleClickZoom.disable();
      }}
      onTouchEnd={() => {
        props?.map.dragging.enable();
        props?.map.doubleClickZoom.enable();
      }}
      onMouseOver={() => {
        if (Capacitor.getPlatform() == 'web') {
          props?.map.dragging.disable();
          props?.map.doubleClickZoom.disable();
        }
      }}
      onMouseOut={() => {
        if (Capacitor.getPlatform() == 'web') {
          props?.map.dragging.enable();
          props?.map.doubleClickZoom.enable();
        }
      }}>
      <div
        className="leaflet-control"
        style={{
          zIndex: 1000,
          width: 300,
          borderRadius: 5,
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 50,
          marginBottom: 10
        }}>
        <Slider
          value={props?.mapZoom}
          style={{
            zIndex: 1000,
            width: 270
          }}
          step={1}
          marks
          min={1}
          max={15}
          onChange={(event: any, newZoom: number) => {
            zoomFunction(newZoom);
          }}
        />
      </div>
    </div>
  );
};
