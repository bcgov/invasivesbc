import React from 'react';
import { useSelector } from 'react-redux';
import './Overlay.css';

const Overlay = (props) => {
  const panelOpen = useSelector((state: any) => state.AppMode.panelOpen);
  const fullScreen = useSelector((state: any) => state.AppMode?.panelFullScreen);
  return (
    <div
      className={`map__overlay ${panelOpen && !fullScreen ? 'map__overlay--show' : ''} ${
        panelOpen && fullScreen ? 'map__overlay--show-fullscreen' : ''
      }`}>
      <div className={`mapOverlayContentsWrapperWithResize `}>
        <div className={`mapOverlayContents `}> {props.children}</div>
      </div>
    </div>
  );
};

export default Overlay;
