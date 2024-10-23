import { convertBytesToReadableString } from 'utils/tile-cache/helpers';
import { useEffect, useState } from 'react';

type PropTypes = {
  downloadSizeInBytes: number;
};
/**
 * The general use case is for displaying file sizes given bytes, and programmatically assigning a class to add colour coding.
 */
const CacheFileSize = ({ downloadSizeInBytes }: PropTypes) => {
  const readable = convertBytesToReadableString(downloadSizeInBytes);

  const [className, setClassName] = useState('green');
  const [tooLargeWarning, setTooLargeWarning] = useState(false);

  enum thresholds {
    GREEN = 400 * 1024 * 1024, // 400 MiB
    ORANGE = 1536 * 1024 * 1024, // 1.5 GiB
    RED = 5120 * 1024 * 1024 // 5 GiB
  }

  useEffect(() => {
    if (downloadSizeInBytes < thresholds.GREEN) {
      setClassName('green');
      setTooLargeWarning(false);
    } else if (downloadSizeInBytes < thresholds.ORANGE) {
      setClassName('orange');
      setTooLargeWarning(false);
    } else if (downloadSizeInBytes < thresholds.RED) {
      setClassName('red');
      setTooLargeWarning(false);
    } else {
      setClassName('deep-red');
      setTooLargeWarning(true);
    }
  }, [downloadSizeInBytes]);

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
