import { IconButton, LinearProgress } from '@mui/material';
import { useDispatch, useSelector } from 'utils/use_selector';
import { shallowEqual } from 'react-redux';
import { Delete, Refresh, StopCircleOutlined } from '@mui/icons-material';
import TileCache from 'state/actions/cache/TileCache';
import { RepositoryStatus } from 'utils/tile-cache';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';

const TileCacheDownloadProgress = () => {
  const handleStopDownload = (repository: string) => {
    dispatch(TileCache.deleteRepository(repository));
  };

  const handleRestartDownload = ({ description, id, bounds, maxZoom }) => {
    dispatch(TileCache.requestCaching({ description, id, bounds, maxZoom }));
  };

  const handleDeleteDownload = (repository: string) => {
    dispatch(PlanMyTrip.delete(repository));
  };

  const dispatch = useDispatch();
  const downloadProgress = useSelector((state) => state.TileCache?.downloadProgress, shallowEqual);
  const failedDownloads = useSelector((state) => state.TileCache?.repositories ?? []).filter(
    (r) => [RepositoryStatus.FAILED].includes(r.status) && !downloadProgress?.[r.id]
  );

  const activeDownloads = Object.keys(downloadProgress ?? {}).length + failedDownloads.length > 0;

  if (!downloadProgress || !activeDownloads) {
    return (
      <section>
        <p className="Emphasis">There are currently no downloads in progress</p>
      </section>
    );
  }
  return (
    <section>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Cache Name</th>
              <th>Download Status</th>
              <th>Progress</th>
              <th>Restart/Cancel</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(downloadProgress).map((k) => (
              <tr key={k}>
                <td>{downloadProgress[k].description ?? downloadProgress[k].repository}</td>
                <td>{downloadProgress[k].message}</td>
                <td>
                  <LinearProgress variant={'determinate'} value={downloadProgress[k].normalizedProgress * 100} />
                </td>
                <td>
                  <IconButton color="error" onClick={() => handleStopDownload(downloadProgress[k].repository)}>
                    <StopCircleOutlined />
                  </IconButton>
                </td>
              </tr>
            ))}
            {failedDownloads.map((r) => (
              <tr key={r.id}>
                <td>{r.description || r.id}</td>
                <td className="deep-red">{r.status}</td>
                <td></td>
                <td>
                  <IconButton onClick={() => handleRestartDownload(r)}>
                    <Refresh />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteDownload(r.id)}>
                    <Delete color={'error'} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export { TileCacheDownloadProgress };
