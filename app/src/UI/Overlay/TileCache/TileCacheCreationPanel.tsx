import { TileCacheService } from 'utils/tile-cache';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'utils/use_selector';
import { Button, Slider } from '@mui/material';
import TileCache from 'state/actions/cache/TileCache';
import { convertBytesToReadableString } from 'utils/tile-cache/helpers';

// seems to be about right for this dataset
const APPROX_SIZE_PER_TILE = 15 * 1024;

const TileCacheCreationPanel = () => {
  const drawnShape = useSelector((state) => state.TileCache?.drawnShapeBounds);

  const dispatch = useDispatch();

  const availableZooms = [
    {
      value: 12,
      label: 'Zoom 12, approximately 1:150,000'
    },
    {
      value: 14,
      label: 'Zoom 14, approximately 1:35,000'
    },
    {
      value: 16,
      label: 'Zoom 16, approximately 1:8,000'
    },
    {
      value: 18,
      label: 'Zoom 18, approximately 1:2,000'
    },
    {
      value: 20,
      label: 'Zoom 20, approximately 1:500'
    }
  ];
  const [zoom, setZoom] = useState<number>(availableZooms[0].value);

  const [tileCount, setTileCount] = useState<number | null>(null);
  const [approximateDownloadSize, setApproximateDownloadSize] = useState<number | null>(null);

  useEffect(() => {
    if (!drawnShape) {
      setTileCount(null);
      return;
    }

    const updatedCount = TileCacheService.computeTileCount(drawnShape, zoom);

    setTileCount(updatedCount);
    setApproximateDownloadSize(updatedCount * APPROX_SIZE_PER_TILE);
  }, [drawnShape, zoom]);

  if (!drawnShape) {
    return <>No area defined</>;
  }

  return (
    <>
      <p>
        {drawnShape.minLatitude}° , {drawnShape.maxLatitude}°
      </p>
      <p>
        {drawnShape.minLongitude}° , {drawnShape.maxLongitude}°
      </p>

      <Slider
        value={zoom}
        step={null}
        aria-label={'Zoom Level'}
        marks={availableZooms}
        min={availableZooms[0].value}
        max={availableZooms[availableZooms.length - 1].value}
        onChange={(e, value) => {
          if (typeof value !== 'number') {
            return;
          }
          setZoom(value);
        }}
      />

      <p>
        {tileCount} tiles
        {approximateDownloadSize && `(approximately ${convertBytesToReadableString(approximateDownloadSize)})`}
      </p>

      <Button
        variant={'contained'}
        onClick={() => {
          if (!drawnShape) {
            return;
          }
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
    </>
  );
};

export { TileCacheCreationPanel };
