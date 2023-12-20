import { useLeafletContext } from '@react-leaflet/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS, ACTIVITY_UPDATE_GEO_REQUEST } from 'state/actions';
import { GeoJSON, useMap, useMapEvent } from 'react-leaflet';
import type { LayerGroup } from 'leaflet';

export const GeoEditTools = (props) => {
  const { map, layerContainer } = useLeafletContext();
  const container = (layerContainer as LayerGroup) || map;
  const dispatch = useDispatch();

  if (!container) {
    console.warn('[GEOMAN-CONTROLS] No map or container instance found');
    return null;
  }

  const initTools = async () => {
    L.PM.setOptIn(true);
    map.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false
    });

    // Set up remove button listener workaround
   /* const removeButton = document.getElementsByClassName("leaflet-pm-icon-delete")[0];
    removeButton.addEventListener("click", () => {
     // map?.pm?.toggleGlobalRemovalMode();
      dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [] } });
      dispatch({
        type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
        payload: {
          notification: {
            visible: true,
            message: 'Geometry Removed',
            severity: 'success'
          }
        }
      });
    });
    */
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
  const geo = useSelector((state: any) => state.ActivityPage?.activity?.geometry);
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
      map.removeLayer(e.layer);
    if (lastLayer) {
      map.removeLayer(lastLayer);
    }
    setLastLayer(layer);

    dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [layer.toGeoJSON()] } });


    layer.on('pm:update', (e) => {
      dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [layer.toGeoJSON()] } });
    });
    layer.on('pm:remove', (e) => {
      dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [] } });
    });

    map.pm.disableGlobalEditMode()	
  });


  useMapEvent('pm:globalremovalmodetoggled', (e) => {
    console.dir(e)
    if(e.enabled) {
    dispatch({
      type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
      payload: {
        notification: {
          visible: true,
          message: 'Click geometry to delete',
          severity: 'warning'
        }
      }
    });
  }
  else
  {
    dispatch({
      type: ACTIVITY_TOGGLE_NOTIFICATION_SUCCESS,
      payload: {
        notification: {
          visible: false,
          message: 'Click finish to delete geometry from map',
          severity: 'warning'
        }
      }
    });
  }
  });


  let mode = 'EDIT'; // check user access
  console.dir(geo);

  switch (mode) {
    case 'READ':
      return <>{geo ? <GeoJSON data={geo} /> : <></>}</>;
    case 'EDIT':
      if (map?.pm)
        return (
          <>
            <GeoEditTools />
            <GeoJSON
              onEachFeature={(feature, layer) => {
                (L as any).PM.reInitLayer(layer);
                //setLastLayer(layer);
                layer.on('pm:update', (e) => {
                  console.log('we got there');
                  dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [layer.toGeoJSON()] } });
                });
                layer.on('pm:remove', (e) => {
                  console.log('we really got there');
                  //(L as any).PM?.removeLayer(e.layer)
                  dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [] } });
                });
                return layer;
              }}
              pointToLayer={(point, ltlng) => {
                const newLayer = new L.Marker(ltlng, { pmIgnore: false });
                (L as any).PM.reInitLayer(newLayer);
                // setLastLayer(newLayer);
                newLayer.on('pm:update', (e) => {
                  console.log('we got there');
                  dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [newLayer.toGeoJSON()] } });
                });
                return newLayer;
              }}
              pmIgnore={false}
              key={Math.random()}
              data={geo}
            />
          </>
        );
      else return null;
    default:
      return <></>;
  }
};
