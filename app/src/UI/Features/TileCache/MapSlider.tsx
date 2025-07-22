import { useEffect, useRef, useState } from 'react';
import { APPROX_SIZE_PER_TILE, AVAILABLE_ZOOMS } from './constants';
import { Slider } from '@mui/material';
import CacheFileSize from './CacheFileSize';
import { useTileSizeThresholds } from './tileSizeHook';
import { GeoJSON } from 'geojson';
import { RepositoryBoundingBoxSpec, TileCacheService } from 'utils/tile-cache';
import bbox from '@turf/bbox';

type PropTypes = {
  handleDownload: (zoom: number, shape: RepositoryBoundingBoxSpec) => void;
  drawnShape: GeoJSON;
};
const MapSlider = ({ handleDownload, drawnShape }: PropTypes) => {
  const [zoom, setZoom] = useState<number>(AVAILABLE_ZOOMS[0].value);
  const [scale, setScale] = useState<string>(AVAILABLE_ZOOMS[0].scale);
  const boundary = useRef<RepositoryBoundingBoxSpec>(
    (() => {
      const [minX, minY, maxX, maxY] = bbox(drawnShape);
      return {
        minLatitude: minY,
        maxLatitude: maxY,
        minLongitude: minX,
        maxLongitude: maxX
      };
    })()
  );
  const [tileCount, setTileCount] = useState<number | null>(null);
  const [approximateDownloadSize, setApproximateDownloadSize] = useState<number | null>(null);
  const [downloadDisabled, setDownloadDisabled] = useState<boolean>(false);
  const { overDownloadLimit } = useTileSizeThresholds(approximateDownloadSize);

  useEffect(() => {
    if (!boundary.current || approximateDownloadSize == null) {
      setDownloadDisabled(true);
      return;
    }

    setDownloadDisabled(overDownloadLimit);
  }, [boundary, approximateDownloadSize, overDownloadLimit]);

  useEffect(() => {
    if (!boundary.current) {
      setTileCount(null);
      setApproximateDownloadSize(null);
      return;
    }
    const updatedCount = TileCacheService.computeTileCount(boundary.current, zoom);
    setTileCount(updatedCount);
    setApproximateDownloadSize(updatedCount * APPROX_SIZE_PER_TILE);
  }, [zoom]);

  return (
    <div>
      Select Zoom Level:
      <Slider
        value={zoom}
        step={null}
        aria-label={'Zoom Level'}
        marks={AVAILABLE_ZOOMS.map((item) => {
          // don't display label for odd entries.
          if (item.value % 2 === 1) {
            item.label = '';
          }
          return item;
        })}
        sx={{ width: '80%' }}
        min={AVAILABLE_ZOOMS[0].value}
        max={AVAILABLE_ZOOMS[AVAILABLE_ZOOMS.length - 1].value}
        onChange={(e, value) => {
          if (typeof value === 'number') {
            setZoom(value);
            setScale(AVAILABLE_ZOOMS.find((item) => item.value === value)?.scale ?? '');
          }
        }}
      />
      <div className="shapeDetails">
        <p>
          <b>Scale:</b> {scale}, <b>Map Tiles:</b> {tileCount?.toLocaleString()}
          {approximateDownloadSize && (
            <>
              {' '}
              (approx. <CacheFileSize downloadSizeInBytes={approximateDownloadSize} />)
            </>
          )}
        </p>
      </div>
      <button onClick={() => handleDownload(zoom, boundary.current)} disabled={downloadDisabled}>
        Download Offline Maps
      </button>
    </div>
  );
};

export default MapSlider;
