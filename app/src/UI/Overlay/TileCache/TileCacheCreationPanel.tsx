import { TileCacheService } from 'utils/tile-cache';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';
import { Button, Slider } from '@mui/material';
import TileCache from 'state/actions/cache/TileCache';
import TooltipWithIcon from 'UI/TooltipWithIcon/TooltipWithIcon';
import CacheFileSize from './CacheFileSize';

// seems to be about right for this dataset
const APPROX_SIZE_PER_TILE = 15 * 1024;
const DOWNLOAD_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GiB
const AVAILABLE_ZOOMS = [
  {
    value: 12,
    label: 'Zoom 12',
    scale: '1:150,000'
  },
  {
    value: 14,
    label: 'Zoom 14',
    scale: '1:35,000'
  },
  {
    value: 16,
    label: 'Zoom 16',
    scale: '1:8,000'
  },
  {
    value: 18,
    label: 'Zoom 18',
    scale: '1:2,000'
  },
  {
    value: 20,
    label: 'Zoom 20',
    scale: '1:500'
  }
];

const TileCacheCreationPanel = () => {
  const boundingBoxToolTipText =
    'The latitude and longitude values for a bounding box represent the corners of a rectangular area on a map. The two pairs of coordinates show the southwest and northeast corners, defining the space that contains the object or area of interest.';
  const drawnShape = useSelector((state) => state.TileCache?.drawnShapeBounds);
  const dispatch = useDispatch();

  const [zoom, setZoom] = useState<number>(AVAILABLE_ZOOMS[0].value);
  const [scale, setScale] = useState<string>(AVAILABLE_ZOOMS[0].scale);

  const [tileCount, setTileCount] = useState<number | null>(null);
  const [approximateDownloadSize, setApproximateDownloadSize] = useState<number | null>(null);

  const [downloadDisabled, setDownloadDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (!drawnShape || approximateDownloadSize == null) {
      setDownloadDisabled(true);
      return;
    }

    setDownloadDisabled(approximateDownloadSize > DOWNLOAD_LIMIT);
  }, [drawnShape, approximateDownloadSize]);

  useEffect(() => {
    if (!drawnShape) {
      setTileCount(null);
      setApproximateDownloadSize(null);
      return;
    }
    const updatedCount = TileCacheService.computeTileCount(drawnShape, zoom);
    setTileCount(updatedCount);
    setApproximateDownloadSize(updatedCount * APPROX_SIZE_PER_TILE);
  }, [drawnShape, zoom]);

  if (!drawnShape) {
    return (
      <section>
        <p className="emphasis">No area has been defined.</p>
        <p>To get started, use the drawing tools to create a shape on the map.</p>
      </section>
    );
  }

  return (
    <section>
      <p>
        Choose the zoom level you want to use for saving map tiles. A higher zoom level allows you to see more detail
        when you zoom in, but it will also take up more space on your device.
      </p>
      <p className="shapeDetails">
        <b>Southwest:</b> {drawnShape.minLatitude.toFixed(5)}°, {drawnShape.minLongitude.toFixed(5)}° &nbsp;&nbsp;
        <b>Northeast:</b> {drawnShape.maxLatitude.toFixed(5)}°, {drawnShape.maxLongitude.toFixed(5)}°{' '}
        <TooltipWithIcon tooltipText={boundingBoxToolTipText} />
      </p>

      <Slider
        value={zoom}
        step={null}
        aria-label={'Zoom Level'}
        marks={AVAILABLE_ZOOMS}
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
          <b>Scale:</b> {scale}, <b>Map Tiles:</b> {tileCount?.toLocaleString()}{' '}
          {approximateDownloadSize && (
            <>
              (approx. <CacheFileSize downloadSizeInBytes={approximateDownloadSize} />)
            </>
          )}
        </p>
      </div>
      <div className="control">
        <Button
          variant={'contained'}
          disabled={downloadDisabled}
          onClick={() => {
            dispatch(
              TileCache.requestCaching({
                description: '',
                bounds: drawnShape,
                maxZoom: zoom
              })
            );
          }}
        >
          Start Download
        </Button>
      </div>
    </section>
  );
};

export { TileCacheCreationPanel };
