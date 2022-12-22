import React from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { TOGGLE_BASIC_PICKER_LAYER } from 'state/actions';

export const LayerSniffer = (props) => {
  const map = useMap();
  const dispatch = useDispatch();

  useMapEvent('overlayadd', (e) => {
    dispatch({ type: TOGGLE_BASIC_PICKER_LAYER, payload: { [e.name]: true } });
  });
  useMapEvent('overlayremove', (e) => {
    dispatch({ type: TOGGLE_BASIC_PICKER_LAYER, payload: { [e.name]: false } });
  });

  return <></>;
};
