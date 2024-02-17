import 'leaflet/dist/leaflet.css';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import './Map.css';
import * as L from 'leaflet';
import OfflineLayers from './OfflineLayers';
import { useSelector } from 'util/use_selector';
import { RecordSetLayersRenderer } from './RecordSetLayersRenderer';
import { VectorOverviewLayer } from './VectorOverviewLayer';
import { RENDER_DEBUG } from 'UI/App';

const MapUnmounter = (props) => {
  const map = useMap();
  useEffect(() => {
    return () => {
      try {

      map.clearAllEventListeners();
      map.remove();
      }
      catch(e)
      {
        console.log(e);
      }
    };
  }, []);
  return <></>;
};

const Map = (props: any) => {
  let ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%cMap.tsx render' + ref.current.toString(), 'color: yellow');

  return (
    <div className="map">
      {true ? (
        <MapContainer
          zoomAnimation={true}
          zoomAnimationThreshold={5}
          zoomSnap={1}
          zoomDelta={1}
          fadeAnimation={true}
          id="themap"
          center={[51, -128]}
          zoom={5}
          className="map__leaflet">
          <RecordSetLayersRenderer />
          <MapUnmounter />
          {props.children}
          <OfflineLayers />
          <VectorOverviewLayer />
        </MapContainer>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Map;
