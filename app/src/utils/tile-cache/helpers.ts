function base64toBuffer(s: string) {
  const binaryString = atob(s);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function long2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

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

type Bounds = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

function boundsToPolygon(b: Bounds) {
  const { minLatitude: minLat, maxLatitude: maxLat, minLongitude: minLng, maxLongitude: maxLng } = b;

  //basic sanity
  if (minLat > maxLat) throw new Error('minLat > maxLat');
  const wrap = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180;
  const wMin = wrap(minLng);
  const wMax = wrap(maxLng);

  if (wMax < wMin) {
    return {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [wMin, minLat],
            [180, minLat],
            [180, maxLat],
            [wMin, maxLat],
            [wMin, minLat]
          ]
        ],
        [
          [
            [-180, minLat],
            [wMax, minLat],
            [wMax, maxLat],
            [-180, maxLat],
            [-180, minLat]
          ]
        ]
      ]
    } as const;
  }

  return {
    type: 'Polygon',
    coordinates: [
      [
        [wMin, minLat],
        [wMax, minLat],
        [wMax, maxLat],
        [wMin, maxLat],
        [wMin, minLat]
      ]
    ]
  } as const;
}

export { base64toBuffer, lat2tile, long2tile, convertBytesToReadableString, boundsToPolygon };
