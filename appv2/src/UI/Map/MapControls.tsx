import React, { useState } from "react";
import "./Map.css";
import { appModeEnum } from "../../state/reducers/appMode";
import { useHistory, useLocation } from "react-router";
import { current } from "@reduxjs/toolkit";

const MapControls = (props: {
  className: string;
  showOverlay: boolean;
  toggleShowOverlay: () => void;
}) => {
  const location = useLocation();
  const history = useHistory();


  // for the temporary mode cycle 
  function getEnumKeyByEnumValue(myEnum, enumValue) {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}
  return (
    <>
      <button
        className="overlay_toggle"
        onClick={() => props.toggleShowOverlay()}
      >
        {props.showOverlay ? "Hide" : "Show"} Overlay
      </button>
      <button
        className="cycle_mode"
        onClick={() => {
         const currentMode =  getEnumKeyByEnumValue(appModeEnum, location.pathname.replace('/',''))
         
         const modes = Object.keys(appModeEnum).filter(
            (v) => !isNaN(Number(v))
          ) as unknown as appModeEnum[];

          const now = modes.indexOf(currentMode as unknown as appModeEnum);
          const next = now === modes.length - 1 ? modes[0] : modes[now + 1];
          const nextURL = `/${appModeEnum[next]}`;
          history.push(nextURL);

        }}
      >
        Mode: {location.pathname.replace('/','')}
      </button>
    </>
  );
};

export default MapControls;
