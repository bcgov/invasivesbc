import DataSizeUnits from 'constants/DataSizeUnit';
import { convertBytesToReadableString } from 'utils/tile-cache/helpers';

type PropTypes = {
  downloadSizeInBytes: number;
};
const CacheFileSize = ({ downloadSizeInBytes }: PropTypes) => {
  const [size, unit] = convertBytesToReadableString(downloadSizeInBytes).split(' ');
  const parsedSize = parseFloat(size) ?? 0;
  const className = (() => {
    switch (true) {
      case unit === DataSizeUnits.Bytes:
      case unit === DataSizeUnits.Kibibytes:
      case unit === DataSizeUnits.Mebibytes && parsedSize < 100:
        return 'green';
      case unit === DataSizeUnits.Mebibytes:
      case unit === DataSizeUnits.Gibibytes && parsedSize <= 2:
        return 'orange';
      case unit === DataSizeUnits.Gibibytes && parsedSize <= 10:
        return 'red';
      case unit === DataSizeUnits.Gibibytes:
      case unit === DataSizeUnits.Tebibytes:
      case unit === DataSizeUnits.Pebibytes:
        return 'deep-red';
      default:
        return '';
    }
  })();
  return (
    <span className={className}>
      {size} {unit}
    </span>
  );
};

export default CacheFileSize;
