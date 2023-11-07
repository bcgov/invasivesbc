import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import 'leaflet-editable';
import 'leaflet.offline';
import React, { useEffect, useRef } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { CUSTOM_LAYER_DRAWN } from 'state/actions';

//temporary fix to type is undefined error
(window as any).type = undefined;

export const DrawCustomLayer = (props) => {
  const map = useMap();
  const dispatch = useDispatch();
  const ref = useRef();

  //refactor stuff for topo button
  const drawingCustomLayer = useSelector((state: any) => state.Map.drawingCustomLayer);

  useEffect(() => {
    if (drawingCustomLayer == true) {
      ref.current = new (L as any).Draw.Polygon(map);
      ref.current.enable();
    }

    return () => {
      if (ref.current) ref.current.disable();
    };
  }, [drawingCustomLayer]);

  useMapEvent('draw:created' as any, (e) => {
    if (drawingCustomLayer)
      dispatch({ type: CUSTOM_LAYER_DRAWN, payload: { feature: e.layer.toGeoJSON() } });
    }
  );

  return <></>;
};
