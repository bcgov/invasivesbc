import { useEffect } from 'react';
import { useDispatch } from 'utils/use_selector';
import TileCache from 'state/actions/cache/TileCache';
import { TileCacheCreationPanel } from 'UI/Features/TileCache/TileCacheCreationPanel';
import { TileCacheList } from 'UI/Features/TileCache/TileCacheList';
import { TileCacheDownloadProgress } from 'UI/Features/TileCache/TileCacheDownloadProgress';
import 'UI/Features/TileCache/tileCache.css';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { Create, Downloading, SdStorage } from '@mui/icons-material';

const TileCachePanel = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(TileCache.clearTileCacheShape());
  }, []);

  return (
    <div id={`offline-map-overlay`}>
      <h2>Offline Maps</h2>
      <p className="subheader">Manage your map data for offline access</p>
      <div className="content">
        <Accordion title="Create Cached Maps" icon={<Create />}>
          <h3>Create Cached Maps</h3>
          <TileCacheCreationPanel />
        </Accordion>
        <Accordion title="Download Progress" icon={<Downloading />}>
          <h3>Download Progress</h3>
          <p className="subheader">Check the status of caches being downloaded for offline access.</p>
          <TileCacheDownloadProgress />
        </Accordion>
        <Accordion title="Downloaded Maps" icon={<SdStorage />}>
          <h3>Downloaded Maps</h3>
          <p className="subheader">These caches are currently saved on your device</p>
          <TileCacheList />
        </Accordion>
      </div>
    </div>
  );
};

export default TileCachePanel;
