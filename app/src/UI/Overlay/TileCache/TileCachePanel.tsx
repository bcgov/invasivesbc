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
        <h2>Offline Map</h2>
        <p className="subheader">Manage your map data for offline access</p>
        <h3>Create Cached Maps</h3>
        <TileCacheCreationPanel />
        <p>
          <i>TileCacheDownloadProgress</i>
        </p>
        <TileCacheDownloadProgress />
        <p>
          <i>TileCacheList</i>
        </p>
        <TileCacheList />
      </div>
    </>
  );
};

export default TileCachePanel;
