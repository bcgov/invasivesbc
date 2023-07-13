import React, { useState } from "react";
import "./Map.css";
import { appModeEnum } from "../../state/reducers/appMode";

const MapControls = (props: {
  className: string;
  showOverlay: boolean;
  toggleShowOverlay: () => void;
  mode: appModeEnum;
  modeSetter: (newMode: appModeEnum) => void;
}) => {
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
          const modes = Object.keys(appModeEnum).filter(
            (v) => !isNaN(Number(v))
          ) as unknown as appModeEnum[];
          const now = modes.indexOf(props.mode);
          const next = now === modes.length - 1 ? modes[0] : modes[now + 1];
          props.modeSetter(next);
        }}
      >
        Mode: {appModeEnum[props.mode]}
      </button>
    </>
  );
};

export default MapControls;
