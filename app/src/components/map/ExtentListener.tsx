import React, { useEffect } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MAIN_MAP_MOVE } from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { selectTabs } from 'state/reducers/tabs';

export const ExtentListener = (props) => {
  const dispatch = useDispatch();
  const mapState = useSelector(selectMap);
  const tabstate = useSelector(selectTabs);
  const tab = tabstate.tabConfig[tabstate.activeTab]
  const map = useMapEvent('moveend', (e) => {
    const zoom = map.getZoom();
    const center = map.getCenter();
    if(zoom && center && tab?.label)
    {
      dispatch({ type: MAIN_MAP_MOVE, payload: { zoom: zoom, center: center, tab: tab?.label } });
    }
  });

  useEffect(()=> {
    const zoom = map.getZoom();
    const center = map.getCenter();
    if(zoom && center && tab?.label)
    {
      dispatch({ type: MAIN_MAP_MOVE, payload: { zoom: zoom, center: center, tab: tab?.label } });
    }

  },[])

  return <></>;
};
