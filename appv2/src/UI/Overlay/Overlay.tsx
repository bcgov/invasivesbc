import React, { useState } from "react";
import "./Overlay.css";
import { appModeEnum } from "../../state/reducers/appMode";

const Overlay = (props) => {
  return (
    <div className={`map__overlay ${props.showOverlay ? "map__overlay--show" : ""}`}>
      {props.children}
    </div>
  );
};

export default Overlay