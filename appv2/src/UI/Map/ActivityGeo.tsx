import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectActivity } from 'state/reducers/activity';
import { ACTIVITY_UPDATE_GEO_REQUEST } from 'state/actions';
import { GeoJSON, useMap, useMapEvent } from 'react-leaflet';
import type { LayerGroup } from 'leaflet';

import * as L from 'leaflet';
import { useLeafletContext } from '@react-leaflet/core';

export const GeoEditTools = (props) => {
  const { map, layerContainer } = useLeafletContext();
  const container = (layerContainer as LayerGroup) || map;

  if (!container) {
    console.warn('[GEOMAN-CONTROLS] No map or container instance found');
    return null;
  }

  const initTools = async () => {
    L.PM.setOptIn(true);
    map.pm.addControls({
      position: 'topleft',
      drawCircle: false,

    });
  };

  useEffect(() => {
    initTools();
    return () => {
      map?.pm?.removeControls();
    };
  }, []);
  return null;
};

export const ActivityGeo = (props) => {
  const activityState = useSelector(selectActivity);

  const map = useMap();
  const dispatch = useDispatch();

  const [lastLayer, setLastLayer] = useState(null);

  /*  useMapEvent('pm:drawend', (e) => {
    //e.layer.options.pmIgnore = false;
    e.layer.options.pmIgnore = false;
    L.PM.reInitLayer(e.layer);
   // (L as any).PM.reInitLayer(e.layer);
    dispatch({type: 'drawend', payload: {event: e}})
  })*/
  useMapEvent('pm:create', (e) => {
    e.layer.options.pmIgnore = false;
    (L as any).PM.reInitLayer(e.layer);
    const { layer } = e;
    if (lastLayer) {
      map.removeLayer(lastLayer);
    }
    setLastLayer(layer);

    layer.on('pm:update', (e) => {
      dispatch({ type: 'update', payload: { event: e } });
      dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [layer.toGeoJSON()] } });
    });
    dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [layer.toGeoJSON()] } });
  });
  /*layer.on('pm:markerdragend',  (e) => {
      dispatch({type: 'update', payload: { event: e}})
      dispatch({type: ACTIVITY_UPDATE_GEO_REQUEST, payload: {geometry: [layer.toGeoJSON()] }})
    })
    */
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

  let mode = 'EDIT'; // check user access

  switch (mode) {
    case 'READ':
      return <>{activityState?.activity?.geometry ? <GeoJSON data={activityState?.activity?.geometry} /> : <></>}</>;
    case 'EDIT':
      if (map?.pm)
        return (
          <>
            <GeoEditTools />
            <GeoJSON
              onEachFeature={(feature, layer) => {
                (L as any).PM.reInitLayer(layer);
                layer.on('pm:update', (e) => {
                  console.log('we got there')
                  dispatch({ type: 'update', payload: { event: e } });
                  dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [layer.toGeoJSON()] } });
                });
                return layer
              }}
              pointToLayer={(point, ltlng) => {
                const newLayer = new L.Marker(ltlng, { pmIgnore: false });
                (L as any).PM.reInitLayer(newLayer);
                newLayer.on('pm:update', (e) => {
                  console.log('we got there')
                  dispatch({ type: 'update', payload: { event: e } });
                  dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [layer.toGeoJSON()] } });
                });
                return newLayer;
              }}
              
              pmIgnore={false}
              key={Math.random()}
              data={activityState?.activity?.geometry}
            />
          </>
        );
      else return null;
    default:
      return <></>;
  }
};
