import 'leaflet/dist/leaflet.css';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import './Map.css';
import * as L from 'leaflet';
import OfflineLayers from './OfflineLayers';
import { useSelector } from 'util/use_selector';
import { RecordSetLayersRenderer } from './RecordSetLayersRenderer';
import { VectorOverviewLayer } from './VectorOverviewLayer';

const RecordSetLayers = (props: any) => {
  const { IAPPGeoJSON } = useSelector((state: any) => state.Map);
  const [shouldDisplay, setShouldDisplay] = useState(false);
  
  useLayoutEffect(() => {
    if (IAPPGeoJSON?.features.length && !shouldDisplay) {
      setShouldDisplay(true);
    }
  }, [JSON.stringify(IAPPGeoJSON?.features.length)]);
  
  return shouldDisplay ? <RecordSetLayersRenderer /> : null;
};

const Map = (props: any) => {
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);
  let ref = useRef(0);
  ref.current += 1;
  console.log('%cMap.tsx render' + ref.current.toString(), 'color: yellow');
  return (
    <div className="map">
      <MapContainer
        zoomAnimation={true}
        zoomAnimationThreshold={5}
        zoomSnap={1}
        zoomDelta={1}
        fadeAnimation={true}
        id="themap"
        center={[50.5, 30.5]}
        zoom={13}
        className="map__leaflet">
        <RecordSetLayers />
        {props.children}
        <OfflineLayers />
        {/*!isAuth && <VectorOverviewLayer />*/}
      </MapContainer>
    </div>
  );
};

export default Map;
