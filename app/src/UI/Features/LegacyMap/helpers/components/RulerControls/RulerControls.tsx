import RulerControl from '@mapbox-controls/ruler';
import * as maplibregl from 'maplibre-gl/dist/maplibre-gl-dev';
import './rulerControls.css';
import { MapContext } from '../MapContext';
import { useContext, useEffect, useRef, useState } from 'react';
import { Straighten } from '@mui/icons-material';
import rulerConfig from './rulerControls.config';

const RulerControls = () => {
  const map = useContext(MapContext) as maplibregl.Map;

  const rulerRef = useRef<RulerControl | undefined>(undefined);
  const [toggle, setToggle] = useState<boolean>(false);

  const handleClick = () => {
    if (!map || !rulerRef.current) return;
    setToggle((prev) => {
      const nextToggle = !prev;
      if (nextToggle) {
        rulerRef.current?.activate();
        map.doubleClickZoom.disable();
      } else {
        rulerRef.current?.deactivate();
        map.doubleClickZoom.enable();
      }
      return nextToggle;
    });
  };

  useEffect(() => {
    if (!map) return;
    const ruler = new RulerControl(rulerConfig);
    rulerRef.current = ruler;
    (map as unknown as mapboxgl.Map).addControl(ruler, 'top-left');

    // Cleanup
    return () => {
      (map as unknown as mapboxgl.Map).removeControl(ruler);
      rulerRef.current = null;
    };
  }, [map]);
  useEffect(() => {
    if (!map || !toggle) return;

    /**
     * Prevent Maplibre from treating touches (during draw) as drag/pan taps
     */
    const handleTouchEnd = (e: maplibregl.MapTouchEvent) => {
      const canvas = map.getCanvas();
      const mouseClick = new MouseEvent('click', {
        clientX: e.point.x + canvas.getBoundingClientRect().left,
        clientY: e.point.y + canvas.getBoundingClientRect().top,
        bubbles: true,
        cancelable: true
      });
      canvas.dispatchEvent(mouseClick);
    };

    map.on('touchend', handleTouchEnd);

    return () => {
      map.off('touchend', handleTouchEnd);
    };
  }, [map, toggle]);

  return (
    <button onClick={handleClick} className={`ruler-control ${toggle ? 'active' : ''}`}>
      <Straighten color="action" /> <span>Measure Distance</span>
    </button>
  );
};

export default RulerControls;
