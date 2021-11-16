import { Capacitor } from '@capacitor/core';
import { Slider } from '@material-ui/core';
import L from 'leaflet';
import React, { useEffect } from 'react';

const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right'
};

export const ZoomBar = (props) => {
  const zoomFunction = (zoom) => {
    props?.map.setZoom(zoom);
  };

  return (
    <div
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
      }}
      style={{
        zIndex: 1000,
        width: 300,
        borderRadius: 5,
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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
        max={30}
        onChange={(event: any, newZoom: number) => {
          zoomFunction(newZoom);
        }}
      />
    </div>
  );
};
