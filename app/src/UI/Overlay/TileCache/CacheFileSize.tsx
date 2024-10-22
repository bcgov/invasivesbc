import DataSizeUnits from 'constants/dataSizeUnits';
import { convertBytesToReadableString } from 'utils/tile-cache/helpers';

type PropTypes = {
  downloadSizeInBytes: number;
};
/**
 * The general use case is for displaying file sizes given bytes, and programmatically assigning a class to add colour coding
 * It takes advantage of fall-through statements to avoid having to create multiple if-else statements that return the same colour value.
 * Given this is a sliding scale, the switch works appropriately.
 */
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
