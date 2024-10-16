import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';
import Spinner from 'UI/Spinner/Spinner';
import TileCache from 'state/actions/cache/TileCache';
import { Button, LinearProgress } from '@mui/material';
import { shallowEqual } from 'react-redux';

const TileCachePanel = () => {
  const dispatch = useDispatch();
  const repositories = useSelector((state) => state.TileCache?.repositories);
  const downloadProgress = useSelector((state) => state.TileCache?.downloadProgress, shallowEqual);
  const loading = useSelector((state) => state.TileCache?.loading);

  useEffect(() => {
    dispatch(TileCache.repositoryList());
  }, []);

  if (!repositories || !downloadProgress) {
    return <Spinner />;
  }

  return (
    <div>
      <h2>Tile Cache Status</h2>
      {loading && <p>Operation in progress...</p>}
      <table>
        <thead></thead>
        <tbody>
          {repositories.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.status}</td>
              <td>
                <Button
                  variant={'contained'}
                  color={'warning'}
                  onClick={() => dispatch(TileCache.deleteRepository(r.id))}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul>
        {Object.keys(downloadProgress).map((k) => (
          <li key={k}>
            <p>{downloadProgress[k].message}</p>
            <LinearProgress variant={'determinate'} value={downloadProgress[k].normalizedProgress * 100} />
          </li>
        ))}
      </ul>

      <Button variant={'contained'} onClick={() => dispatch(TileCache.repositoryList())}>
        Update
      </Button>

      <Button variant={'contained'} onClick={() => dispatch(TileCache.requestCaching())}>
        Request New
      </Button>
    </div>
  );
};

export default TileCachePanel;
