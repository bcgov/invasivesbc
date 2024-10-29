import { IconButton } from '@mui/material';
import TileCache from 'state/actions/cache/TileCache';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';
import { RepositoryStatistics, TileCacheService } from 'utils/tile-cache';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import Prompt from 'state/actions/prompts/Prompt';
import { convertBytesToReadableString } from 'utils/tile-cache/helpers';
import MapActions from 'state/actions/map';

const TileCacheListRow = ({ metadata, visible }) => {
  const handleToggleVisibility = (id: string) => dispatch(MapActions.toggleOverlay(id));
  const handleDelete = (id: string) => {
    const callback = (confirmation: boolean) => {
      if (confirmation) {
        dispatch(TileCache.deleteRepository(id));
      }
    };
    dispatch(
      Prompt.confirmation({
        title: 'Delete Cached Map tiles?',
        prompt: ['Do you want to delete this set of map tiles?', 'They will no longer be available for offline use.'],
        callback
      })
    );
  };
  const dispatch = useDispatch();
  const serviceRef = useRef<TileCacheService | null>(null);
  const [stats, setStats] = useState<RepositoryStatistics | null>(null);

  useEffect(() => {
    if (!serviceRef.current) {
      return;
    }
    serviceRef.current.getRepositoryStatistics(metadata.id).then((value) => {
      setStats(value);
    });
  }, [metadata.id, serviceRef.current]);

  useEffect(() => {
    TileCacheServiceFactory.getPlatformInstance().then((value) => {
      serviceRef.current = value;
    });
  }, []);

  return (
    <tr>
      <td>
        {metadata.status === 'READY' && (
          <button className="visibility-button" onClick={handleToggleVisibility.bind(this, metadata.id)}>
            {visible ? <Visibility /> : <VisibilityOff />}
          </button>
        )}
      </td>
      <td>{metadata.description || metadata.id}</td>
      <td>{metadata.status}</td>
      <td>{stats?.tileCount}</td>
      <td>{stats && convertBytesToReadableString(stats.sizeInBytes)}</td>
      <td>
        <IconButton color={'error'} onClick={() => handleDelete(metadata.id)}>
          <Delete />
        </IconButton>
      </td>
    </tr>
  );
};

const TileCacheList = () => {
  const repositories = useSelector((state) => state.TileCache?.repositories);
  const visibleLayers = useSelector((state) => state.Map.enabledOverlayLayers) ?? [];
  const dispatch = useDispatch();
  if (!repositories || repositories.length === 0) {
    return (
      <section>
        <p>You don't have any map areas saved on your device right now.</p>
      </section>
    );
  }
  return (
    <section>
      <table>
        <thead>
          <th></th>
          <th>Name</th>
          <th>Status</th>
          <th>Tile Count</th>
          <th>Cache Size</th>
          <th>Delete</th>
        </thead>
        <tbody>
          {repositories.map((r) => (
            <TileCacheListRow key={r.id} metadata={r} visible={visibleLayers.includes(r?.id)} />
          ))}
        </tbody>
      </table>
      <p>
        You can toggle the visibility of cached map tiles here, or from the <b>Layer Picker</b>
      </p>
      <div className="control">
        <button onClick={() => dispatch(TileCache.repositoryList())}>Refresh Table</button>
      </div>
    </section>
  );
};

export { TileCacheList };
