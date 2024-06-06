import React, { useRef } from 'react';
import './Overlay.css';
import { RENDER_DEBUG } from 'UI/App';
import { useSelector } from 'utils/use_selector';

const Overlay = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%cOverlay render:' + ref.current.toString(), 'color: yellow');

  const panelOpen = useSelector((state) => state.AppMode.panelOpen);
  const fullScreen = useSelector((state) => state.AppMode.panelFullScreen);

  return (
    <div
      id="overlaydiv"
      className={`map__overlay ${panelOpen && !fullScreen ? 'map__overlay--show' : ''} ${
        panelOpen && fullScreen ? 'map__overlay--show-fullscreen' : ''
      }`}
    >
      <div className={`mapOverlayContents `}>{props.children}</div>
    </div>
  );
};

export default Overlay;
