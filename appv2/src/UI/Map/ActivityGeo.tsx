import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GeoJSON, useMap, useMapEvent } from 'react-leaflet';
import { selectActivity } from 'state/reducers/activity';
import { GeoEditTools } from './GeoEditTools';
//import L from 'leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { ACTIVITY_UPDATE_GEO_REQUEST } from 'state/actions';
//L.PM.setOptIn(true);

export const ActivityGeo = (props) => {
  const activityState = useSelector(selectActivity);

  const map = useMap();
  const dispatch = useDispatch();


  
  const [lastLayer, setLastLayer] = useState(null)

  /*  useMapEvent('pm:drawend', (e) => {
    //e.layer.options.pmIgnore = false;
    e.layer.options.pmIgnore = false;
    L.PM.reInitLayer(e.layer);
   // (L as any).PM.reInitLayer(e.layer);
    dispatch({type: 'drawend', payload: {event: e}})
  })*/
  useMapEvent('pm:create', (e) => {
    e.layer.options.pmIgnore = false;
    L.PM.reInitLayer(e.layer);
    const { layer } = e
    if(lastLayer)
    {
      map.removeLayer(lastLayer)
    }
    setLastLayer(layer)

    layer.on('pm:update',  (e) => {
      dispatch({type: 'update', payload: { event: e}})
      dispatch({type: ACTIVITY_UPDATE_GEO_REQUEST, payload: {geometry: [layer.toGeoJSON()] }})
    })
    dispatch({ type: 'create', payload: { event: e } });
  });
  useMapEvent('pm:globaldrawmodetoggled', (e) => {
    //    e.layer.options.pmIgnore = false;
    //    L.PM.reInitLayer(e.layer);
    dispatch({ type: 'globaldrawmodetoggled', payload: { event: e } });
  });
  useMapEvent('pm:globaleditmodetoggled', (e) => {
    //    e.layer.options.pmIgnore = false;
    //    L.PM.reInitLayer(e.layer);
    dispatch({ type: 'globaleditmodetoggled', payload: { event: e } });
  });
  /*map.on('pm:create', (e) => {
    dispatch({type: 'banana', payload: {event: e}})
  })*/

  let mode = 'EDIT';

  switch (mode) {
    case 'READ':
      return <>{activityState?.activity?.geometry ? <GeoJSON data={activityState?.activity?.geometry} /> : <></>}</>;
    case 'EDIT':
      return <><GeoEditTools /> <GeoJSON data={activityState?.activity?.geometry} /></> ;
    default:
      return <></>;
  }
};
