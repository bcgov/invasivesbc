import { Button } from '@mui/material';
import TileCache from 'state/actions/cache/TileCache';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';
import { RepositoryStatistics, TileCacheService } from 'utils/tile-cache';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { convertBytesToReadableString } from 'utils/tile-cache/helpers';

const TileCacheListRow = ({ metadata }) => {
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
      <td>
        <Button
          variant={'contained'}
          color={'warning'}
          onClick={() => dispatch(TileCache.deleteRepository(metadata.id))}
        >
          Delete
        </Button>
      </td>
      <td>f</td>
      <td>{stats?.tileCount}</td>
      <td>{stats && convertBytesToReadableString(stats.sizeInBytes)}</td>
    </tr>
  );
};

const TileCacheList = () => {
  const repositories = useSelector((state) => state.TileCache?.repositories);
  const loading = useSelector((state) => state.TileCache?.loading);

  const dispatch = useDispatch();

  if (!repositories) {
    return null;
  }

  return (
    <>
      <table>
        <thead></thead>
        <tbody>
          {repositories.map((r) => (
            <TileCacheListRow key={r.id} metadata={r} />
          ))}
        </tbody>
      </table>
      <Button variant={'contained'} onClick={() => dispatch(TileCache.repositoryList())}>
        Update
      </Button>
    </>
  );
};

export { TileCacheList };
