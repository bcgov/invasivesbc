import useDrawInstance from './hooks/useDrawInstance';

import useManualDrawing from './hooks/useManualDrawing';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export const DrawControls = () => {
  // const map = useContext(MapContext);
  const draw = useDrawInstance();
  // const mode = useDrawMode();

  useManualDrawing(draw);
  // useGeoTracking(draw,mode);

  return null;
};
