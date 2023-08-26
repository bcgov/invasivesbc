import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import './Map.css';
import * as L from 'leaflet';
import OfflineLayers from './OfflineLayers';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'util/use_selector';
import { RecordSetLayersRenderer } from './RecordSetLayersRenderer';

const RecordSetLayers = (props: any) => {
  const { IAPPGeoJSON } = useSelector((state: any) => state.Map);
  const [shouldDisplay, setShouldDisplay] = useState(false);

  useEffect(() => {
    if (IAPPGeoJSON?.features.length && !shouldDisplay) {
      setShouldDisplay(true);
    }
  }, [JSON.stringify(IAPPGeoJSON?.features.length)]);

  return shouldDisplay ? <RecordSetLayersRenderer /> : null;
};

const Map = (props: any) => {
  let ref = useRef(0);
  ref.current += 1;
  console.log('%cMap.tsx render' + ref.current.toString(), 'color: yellow');
  return (
    <div className="map">
      <MapContainer
        zoomAnimation={true}
        zoomAnimationThreshold={3}
        zoomSnap={0.5}
        zoomDelta={1}
        id="themap"
        center={[50.5, 30.5]}
        zoom={13}
        className="map__leaflet">
        <RecordSetLayers />
        {props.children}
        <OfflineLayers />
      </MapContainer>
    </div>
  );
};

export default Map;
