import React, { useEffect } from 'react';
import { useDispatch } from 'utils/use_selector';
import TileCache from 'state/actions/cache/TileCache';
import { OverlayHeader } from 'UI/Overlay/OverlayHeader';
import { TileCacheCreationPanel } from 'UI/Overlay/TileCache/TileCacheCreationPanel';
import { TileCacheList } from 'UI/Overlay/TileCache/TileCacheList';
import { TileCacheDownloadProgress } from 'UI/Overlay/TileCache/TileCacheDownloadProgress';

const TileCachePanel = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(TileCache.setMapTileCacheMode(true));
    return () => {
      dispatch(TileCache.setMapTileCacheMode(false));
    };
  }, []);

  useEffect(() => {
    dispatch(TileCache.repositoryList());
  }, []);

  return (
    <>
      <OverlayHeader />
      <div id={`offline-map-overlay`}>
        <h2>Offline Map</h2>

        <TileCacheCreationPanel />
        <TileCacheDownloadProgress />
        <TileCacheList />
      </div>
    </>
  );
};

export default TileCachePanel;
