import { Button, IconButton } from '@mui/material';
import TileCache from 'state/actions/cache/TileCache';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';
import { RepositoryStatistics, TileCacheService } from 'utils/tile-cache';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { Delete } from '@mui/icons-material';
import Prompt from 'state/actions/prompts/Prompt';
import CacheFileSize from './CacheFileSize';

const TileCacheListRow = ({ metadata }) => {
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
      <td>{metadata.id}</td>
      <td>{metadata.status}</td>
      <td>{stats?.tileCount}</td>
      <td>{stats && <CacheFileSize downloadSizeInBytes={stats.sizeInBytes} />}</td>
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
  const dispatch = useDispatch();
  console.log(repositories);
  if (!repositories || repositories.length === 0) {
    return (
      <section>
        <p>You don't have any map tiles saved on your device right now.</p>
      </section>
    );
  }
  return (
    <section>
      <table>
        <thead>
          <th>Cache ID</th>
          <th>Status</th>
          <th>Tile Count</th>
          <th>Cache Size</th>
          <th>Delete</th>
        </thead>
        <tbody>
          {repositories.map((r) => (
            <TileCacheListRow key={r.id} metadata={r} />
          ))}
        </tbody>
      </table>
      <div className="control">
        <Button variant={'contained'} onClick={() => dispatch(TileCache.repositoryList())}>
          Refresh Table
        </Button>
      </div>
    </section>
  );
};

export { TileCacheList };
