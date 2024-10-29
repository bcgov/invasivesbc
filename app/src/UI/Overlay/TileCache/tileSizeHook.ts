import { useEffect, useState } from 'react';
import { DOWNLOAD_LIMIT } from './constants';

export enum thresholds {
  GREEN = 400 * 1024 * 1024, // 400 MiB
  ORANGE = 1536 * 1024 * 1024, // 1.5 GiB
  RED = 5120 * 1024 * 1024, // 5 GiB
  DEEP_RED = RED + 1
}

export const useTileSizeThresholds = (size: number | null) => {
  const [tooLargeWarning, setTooLargeWarning] = useState(false);
  const [thresholdRange, setThresholdRange] = useState<thresholds | null>(null);
  const [overDownloadLimit, setOverDownloadLimit] = useState<boolean>(false);

  useEffect(() => {
    if (size == null) {
      setThresholdRange(null);
      setTooLargeWarning(false);
    } else if (size < thresholds.GREEN) {
      setThresholdRange(thresholds.GREEN);
      setTooLargeWarning(false);
    } else if (size < thresholds.ORANGE) {
      setThresholdRange(thresholds.ORANGE);
      setTooLargeWarning(false);
    } else if (size < thresholds.RED) {
      setThresholdRange(thresholds.RED);
      setTooLargeWarning(false);
    } else {
      setThresholdRange(thresholds.DEEP_RED);
      setTooLargeWarning(true);
    }

    if (size !== null) {
      setOverDownloadLimit(size > DOWNLOAD_LIMIT);
    }
  }, [size]);

  return {
    thresholdRange,
    tooLargeWarning,
    overDownloadLimit
  };
};
