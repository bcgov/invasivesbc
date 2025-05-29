import { useEffect } from 'react';
import { useDispatch } from 'utils/use_selector';
import TileCache from 'state/actions/cache/TileCache';
import { TileCacheCreationPanel } from 'UI/Features/TileCache/TileCacheCreationPanel';
import { TileCacheList } from 'UI/Features/TileCache/TileCacheList';
import { TileCacheDownloadProgress } from 'UI/Features/TileCache/TileCacheDownloadProgress';
import 'UI/Features/TileCache/tileCache.css';

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
    <div id={`offline-map-overlay`}>
      <h2>Offline Maps</h2>
      <p className="subheader">Manage your map data for offline access</p>
      <h3>Create Cached Maps</h3>
      <TileCacheCreationPanel />
      <h3>Download Progress</h3>
      <p className="subheader">Check the status of caches being downloaded for offline access.</p>
      <TileCacheDownloadProgress />
      <h3>Downloaded Maps</h3>
      <p className="subheader">These caches are currently saved on your device</p>
      <TileCacheList />
    </div>
  );
};

export default TileCachePanel;
