import { useEffect, useState } from 'react';

export enum thresholds {
  GREEN = 400 * 1024 * 1024, // 400 MiB
  ORANGE = 1536 * 1024 * 1024, // 1.5 GiB
  RED = 5120 * 1024 * 1024, // 5 GiB
  DEEP_RED = RED + 1
}

export const useTileSizeThresholds = (size: number | null) => {
  const [thresholdRange, setThresholdRange] = useState<thresholds | null>(null);

  useEffect(() => {
    if (size == null) {
      setThresholdRange(null);
    } else if (size < thresholds.GREEN) {
      setThresholdRange(thresholds.GREEN);
    } else if (size < thresholds.ORANGE) {
      setThresholdRange(thresholds.ORANGE);
    } else if (size < thresholds.RED) {
      setThresholdRange(thresholds.RED);
    } else {
      setThresholdRange(thresholds.DEEP_RED);
    }
  }, [size]);

  return {
    thresholdRange
  };
};
