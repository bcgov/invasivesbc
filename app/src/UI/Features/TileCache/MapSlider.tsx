import { useEffect, useRef, useState } from 'react';
import { APPROX_SIZE_PER_TILE, AVAILABLE_ZOOMS } from './constants';
import { Slider } from '@mui/material';
import CacheFileSize from './CacheFileSize';
import { useTileSizeThresholds } from './tileSizeHook';
import { GeoJSON } from 'geojson';
import { RepositoryBoundingBoxSpec, TileCacheService } from 'utils/tile-cache';
import bbox from '@turf/bbox';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';

type PropTypes = {
  drawnShape: GeoJSON;
  zoom: number;
  setZoom: (newVal: number) => void;
  setOversizedTileDownload?: (bool: boolean) => void;
};
const MapSlider = ({ drawnShape, setZoom, zoom, setOversizedTileDownload }: PropTypes) => {
  const TOOLTIP_TEXT = 'Zoom level controls how close or far the map appears. Higher zoom shows more detail.';
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
  const { overDownloadLimit } = useTileSizeThresholds(approximateDownloadSize);

  useEffect(() => {
    setOversizedTileDownload?.(overDownloadLimit);
  }, [overDownloadLimit]);

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
      <p>
        Select Zoom Level:
        <TooltipWithIcon tooltipText={TOOLTIP_TEXT} />
      </p>
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
        onChange={(_e, value) => {
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
    </div>
  );
};

export default MapSlider;
