import { IconButton, LinearProgress } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import { shallowEqual, useDispatch } from 'react-redux';
import { StopCircleOutlined } from '@mui/icons-material';
import TileCache from 'state/actions/cache/TileCache';

const TileCacheDownloadProgress = () => {
  const handleStopDownload = (repository: string) => {
    // @ts-ignore
    dispatch(TileCache.deleteRepository(repository));
  };
  const dispatch = useDispatch();
  const downloadProgress = useSelector((state) => state.TileCache?.downloadProgress, shallowEqual);
  const activeDownloads = Object.keys(downloadProgress ?? {}).length > 0;

  if (!downloadProgress || !activeDownloads) {
    return (
      <section>
        <p className="Emphasis">There are currently no downloads in progress</p>
      </section>
    );
  }

  return (
    <section>
      <table>
        <thead>
          <th>Cache Name</th>
          <th>Download Status</th>
          <th>Progress</th>
          <th>Cancel</th>
        </thead>
        <tbody>
          {Object.keys(downloadProgress).map((k) => (
            <tr key={k}>
              <td>{downloadProgress[k].repository}</td>
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
        </tbody>
      </table>
    </section>
  );
};

export { TileCacheDownloadProgress };
