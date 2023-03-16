import React from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MAIN_MAP_MOVE } from 'state/actions';
import { selectMap } from 'state/reducers/map';

export const ExtentListener = (props) => {
  const dispatch = useDispatch();
  const mapState = useSelector(selectMap);
  const map = useMapEvent('moveend', (e) => {
    const zoom = map.getZoom();
    const center = map.getCenter();
    if (mapState.activityPageMapExtentToggle === false) {
      dispatch({ type: MAIN_MAP_MOVE, payload: { zoom: zoom, center: center } });
    }
  });
  return <></>;
};
