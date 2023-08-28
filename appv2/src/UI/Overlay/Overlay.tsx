import React from 'react';
import { useSelector } from 'react-redux';
import './Overlay.css';

const Overlay = (props) => {
  const panelOpen = useSelector((state: any) => state.AppMode.panelOpen);
  const fullScreen = useSelector((state: any) => state.AppMode?.panelFullScreen);
  return (
    <div
    id='overlaydiv'
      className={`map__overlay ${panelOpen && !fullScreen ? 'map__overlay--show' : ''} ${
        panelOpen && fullScreen ? 'map__overlay--show-fullscreen' : ''
      }`}>
        <div className={`mapOverlayContents `}> {props.children}</div>
    </div>
  );
};

export default Overlay;
