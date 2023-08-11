import React, { useState } from "react";
import "./Overlay.css";
import { appModeEnum } from "../../state/reducers/appMode";

const Overlay = (props) => {
  return (
    <div className={`map__overlay ${props.showOverlay && !props.fullScreen? "map__overlay--show" : ""} ${props.showOverlay && props.fullScreen ? "map__overlay--show-fullscreen": "" }`}>
      {props.children}
    </div>
  );
};

export default Overlay