// import DrawModeDisplay from './DrawModeDisplay';
import { useContext, useEffect } from 'react';
import useDrawInstance from './hooks/useDrawInstance';
import useDrawMode from './hooks/useDrawMode';
import useManualDrawing from './hooks/useManualDrawing';
import { IControl } from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export const DrawControls = () => {
  // const map = useContext(MapContext);
  const draw = useDrawInstance();
  // const mode = useDrawMode();

  useManualDrawing(draw);
  // useGeoTracking(draw,mode);

  return null;
};
