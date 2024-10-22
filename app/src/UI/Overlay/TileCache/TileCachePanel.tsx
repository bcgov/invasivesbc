import { useEffect } from 'react';
import { useDispatch } from 'utils/use_selector';
import TileCache from 'state/actions/cache/TileCache';
import { OverlayHeader } from 'UI/Overlay/OverlayHeader';
import { TileCacheCreationPanel } from 'UI/Overlay/TileCache/TileCacheCreationPanel';
import { TileCacheList } from 'UI/Overlay/TileCache/TileCacheList';
import { TileCacheDownloadProgress } from 'UI/Overlay/TileCache/TileCacheDownloadProgress';
import './tileCache.css';

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
    dispatch(TileCache.clearTileCacheShape());
  }, []);

  return (
    <>
      <OverlayHeader />
      <div id={`offline-map-overlay`}>
        <h2>Offline Maps</h2>
        <p className="subheader">Manage your map data for offline access</p>
        <h3>Create Cached Maps</h3>
        <TileCacheCreationPanel />
        <h3>Download Progress</h3>
        <p className="subheader">Monitor caches currently being downloaded for use offline.</p>
        <TileCacheDownloadProgress />
        <h3>Downloaded Maps</h3>
        <p className="subheader">These caches are currently stored on your device</p>
        <TileCacheList />
      </div>
    </>
  );
};

export default TileCachePanel;
