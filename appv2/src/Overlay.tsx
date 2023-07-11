import React, { useState } from "react";
import "./Map.css";
import { appModeEnum } from "./state/reducers/appMode";

const Overlay = (props: {showOverlay: boolean, mode: appModeEnum, children: React.FC[]}) => {
  return (
    <div className={`map__overlay ${props.showOverlay ? "map__overlay--show" : ""}`}>
      {props.children}
    </div>
  );
};

export default Overlay