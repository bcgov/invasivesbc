function convertBytesToReadableString(bytes: number) {
  if (bytes < 0) {
    throw new Error('negative input size');
  }

  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  let i = 0;

  do {
    bytes /= 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);

  return `${bytes.toFixed(1)} ${units[i]}`;
}

export { convertBytesToReadableString };
