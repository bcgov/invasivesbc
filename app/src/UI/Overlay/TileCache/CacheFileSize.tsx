import { convertBytesToReadableString } from 'utils/tile-cache/helpers';
import { useEffect, useState } from 'react';
import { thresholds, useTileSizeThresholds } from './tileSizeHook';

type PropTypes = {
  downloadSizeInBytes: number;
};
/**
 * The general use case is for displaying file sizes given bytes, and programmatically assigning a class to add colour coding.
 */
const CacheFileSize = ({ downloadSizeInBytes }: PropTypes) => {
  const readable = convertBytesToReadableString(downloadSizeInBytes);

  const [className, setClassName] = useState('green');

  const { thresholdRange, tooLargeWarning } = useTileSizeThresholds(downloadSizeInBytes);

  useEffect(() => {
    switch (thresholdRange) {
      case null:
      case thresholds.GREEN:
        setClassName('green');
        break;
      case thresholds.ORANGE:
        setClassName('orange');
        break;
      case thresholds.RED:
        setClassName('red');
        break;
      case thresholds.DEEP_RED:
        setClassName('deep-red');
        break;
    }
  }, [thresholdRange]);

  return (
    <>
      <span className={className}>{readable}</span>
      {tooLargeWarning && (
        <span className={'too-large-warning'}> Chosen size is likely to exceed device limitations.</span>
      )}
    </>
  );
};

export default CacheFileSize;
