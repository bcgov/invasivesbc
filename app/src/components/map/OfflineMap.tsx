import Spinner from 'components/spinner/Spinner';
import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { MobileOnly } from '../common/MobileOnly';

// Style the image inside the download button
const iconStyle = {
  transform: 'scale(0.7)',
  opacity: '0.7',
  width: 32,
  height: 32
};

const storeLayersStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  backgroundColor: 'white',
  color: '#464646',
  width: '2.7rem',
  height: '2.7rem',
  border: '2px solid rgba(0,0,0,0.2)',
  backgroundClip: 'padding-box',
  top: '10px',
  left: '10px',
  zIndex: 1000,
  borderRadius: '4px',
  cursor: 'pointer'
} as React.CSSProperties;

const OfflineMap = (props) => {
  const [mapMaxZoom] = useState<number>(30);
  const [offlineLayer, setOfflineLayer] = useState(null);

  const mapOffline = useMap();
  useEffect(() => {
    const aOfflineLayer = (L.tileLayer as any).offline(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      // local_storage,
      {
        attribution: '&copy; <a href="http://www.esri.com/copyright">ESRI</a>',
        subdomains: 'abc',
        maxZoom: mapMaxZoom,
        zIndex: 3000,
        maxNativeZoom: props.maxNativeZoom,
        crossOrigin: true
      }
    );
    aOfflineLayer.addTo(mapOffline);
    setOfflineLayer(aOfflineLayer);
  }, []);

  useEffect(() => {
    const cacheMapTiles = async () => {
      // commented for now:
      // await storeLayers();
      console.log('removed caching map tiles for now');
    };

    if (props.cacheMapTilesFlag?.flag && props.cacheMapTilesFlag?.flag !== 0) {
      cacheMapTiles();
    }
  }, [props.cacheMapTilesFlag]);

  const [offlineing, setOfflineing] = useState(false);

  const saveBasemapControl = (L.control as any).savetiles(offlineLayer, {
    zoomlevels: [13, 14, 15, 16, 17],
    confirm(_: any, successCallback: any) {
      successCallback(true);
    }
  });

  saveBasemapControl._map = mapOffline;

  // pass this to save button on layer picker?
  const storeLayers = async () => {
    setOfflineing(true);
    await saveBasemapControl._saveTiles();
    // XXX: This is firing to quickly
    setOfflineing(false);
  };

  return (
    <>
      {/* TODO:
          1. Toggle between spinner and image depending on 'offlineing' status
          2. Swap image style based on zoom level
        */}
      <MobileOnly>
        <div id="offline-layers-button" title="Offline layers" onClick={storeLayers} style={storeLayersStyle}>
          {offlineing ? (
            <Spinner></Spinner>
          ) : (
            <img alt="offlineing_status" src="/assets/icon/download.svg" style={iconStyle}></img>
          )}
        </div>
      </MobileOnly>
    </>
  );
};

export default OfflineMap;
