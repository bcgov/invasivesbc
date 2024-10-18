import { LinearProgress } from '@mui/material';
import React from 'react';
import { useSelector } from 'utils/use_selector';
import { shallowEqual } from 'react-redux';

const TileCacheDownloadProgress = () => {
  const downloadProgress = useSelector((state) => state.TileCache?.downloadProgress, shallowEqual);

  if (!downloadProgress) {
    return null;
  }
  
  return (
    <ul>
      {Object.keys(downloadProgress).map((k) => (
        <li key={k}>
          <p>{downloadProgress[k].message}</p>
          <LinearProgress variant={'determinate'} value={downloadProgress[k].normalizedProgress * 100} />
        </li>
      ))}
    </ul>
  );
};

export { TileCacheDownloadProgress };
