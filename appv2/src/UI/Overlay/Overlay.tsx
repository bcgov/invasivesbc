import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import './Overlay.css';

const Overlay = (props) => {
  const panelOpen = useSelector((state: any) => state.AppMode.panelOpen);
  const fullScreen = useSelector((state: any) => state.AppMode?.panelFullScreen);

  useEffect(() => {
    if (!fullScreen) {
      const buttonContainer = document.getElementById('map-btn-container');
      if(!panelOpen) {
        if (buttonContainer) buttonContainer.style.marginBottom = 0 + 'vh';
      } else {
        const overlayDiv = document.getElementById('overlaydiv');
        if (overlayDiv) buttonContainer.style.marginBottom = overlayDiv.style.height;
      }
    }
  }, [panelOpen, fullScreen]);

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
