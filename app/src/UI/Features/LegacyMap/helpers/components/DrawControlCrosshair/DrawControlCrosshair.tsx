import MapboxDraw from '@mapbox/mapbox-gl-draw';
import './drawControlCrosshair.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { MapContext } from '../MapContext';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import { AddCircle, CheckCircle } from '@mui/icons-material';
import { useSelector } from 'utils/use_selector';

interface PropTypes {
  drawControls?: MapboxDraw;
}

interface XYCoord {
  clientX: number;
  clientY: number;
}
const DrawControlCrosshair = ({ drawControls }: PropTypes) => {
  /**
   * Listen to modechange events from draw tools to determine rendering or not
   */
  const checkIfShouldRender = (e) => {
    setShouldRender(e.mode !== 'direct_select' && e.mode !== 'simple_select');
  };

  /** Creates a mouse event at target screen coordinates */
  const createMouseEvent = (type: string, x, y) =>
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });

  /**
   * @desc Get X/Y Coordinates for the center of the crosshair
   */
  const getCrosshairXY = (): XYCoord => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const clientX = rect.x + rect.width / 2;
      const clientY = rect.y + rect.height / 2;
      return { clientX, clientY };
    }
    return { clientX: 0, clientY: 0 };
  };
  /**
    @desc Simulate a mouse click to add a feature to the map
   */
  const handleAdd = () => mockCrosshairClick();

  /**
   * Equivalent to closing off a shape with a double click, or clicking the same point as first
   * Calling changeMode does not emit events, so set 'shouldRender' state.
   */
  const handleSubmit = () => {
    drawControls?.changeMode('simple_select');
    setShouldRender(false);
  };

  /**
   * @desc Simulate a click on the map at the position of the Crosshair
   */
  const mockCrosshairClick = () => {
    const { clientX, clientY } = getCrosshairXY();
    const canvas = map?.getCanvas();

    // If you don't fire all three, the draw tools will ignore it.
    ['mousedown', 'mouseup', 'click'].forEach((type) => {
      const event = createMouseEvent(type, clientX, clientY);
      canvas?.dispatchEvent(event);
    });
  };
  /**
   * @desc Trigger 'mousemove' event. Sets the draft shape line to the crosshair when drawing
   */
  const updateVirtualCursor = () => {
    const { clientX, clientY } = getCrosshairXY();
    const event = createMouseEvent('mousemove', clientX, clientY);
    map?.getCanvas().dispatchEvent(event);
  };

  const map = useContext(MapContext);
  const ref = useRef<SVGSVGElement | null>(null);
  const drawToolCrosshairEnabled = useSelector((state) => state.UserSettings.drawToolCrosshairEnabled);
  const [shouldRender, setShouldRender] = useState<boolean>(false);

  useEffect(() => {
    map?.on('moveend', updateVirtualCursor);
    map?.on('draw.modechange', checkIfShouldRender);
    return () => {
      map?.off('moveend', updateVirtualCursor);
      map?.off('draw.modechange', checkIfShouldRender);
    };
  }, [map]);

  if (!shouldRender || !drawToolCrosshairEnabled) return null;
  return (
    <div id="mobile-draw">
      <AddIcon ref={ref} className="crosshair" />
      <IconButton className="control add" onClick={handleAdd}>
        <AddCircle />
      </IconButton>
      <IconButton className="control submit" onClick={handleSubmit}>
        <CheckCircle />
      </IconButton>
    </div>
  );
};

export default DrawControlCrosshair;
