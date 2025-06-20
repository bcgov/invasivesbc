import { useEffect, useRef } from 'react';
import { useSelector } from 'utils/use_selector';
import { TargetMode } from 'UI/Features/LegacyMap/helpers/components/DrawControls/constants';

export default function useDrawMode(): { mode: TargetMode; prevMode: TargetMode } {
  const whatsHereOn = useSelector((state) => state.Map.whatsHere.toggle);
  const tileCacheOn = useSelector((state) => state.Map.tileCacheMode);
  const customeLayerOn = useSelector((state) => state.Map.drawingCustomLayer);

  const appURL = useSelector((state) => state.AppMode.url);

  const { isTracking, drawingShape } = useSelector((state) => state.Map.track_me_draw_geo);
  let mode = TargetMode.DISABLED;

  if (whatsHereOn) mode = TargetMode.WHATS_HERE;
  else if (tileCacheOn) mode = TargetMode.TILE_CACHE;
  else if (customeLayerOn) mode = TargetMode.CUSTOM_LAYER;
  else if (appURL?.includes('Activity')) {
    mode = isTracking || drawingShape ? TargetMode.GEO_TRACK : TargetMode.ACTIVITY;
  }
  const prevModeRef = useRef<TargetMode>(TargetMode.DISABLED);
  const prevMode = prevModeRef.current;

  useEffect(() => {
    prevModeRef.current = mode;
  }, [mode]);
  return { mode, prevMode };
}
