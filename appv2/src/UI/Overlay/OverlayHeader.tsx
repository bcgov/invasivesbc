import { Button } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";

import "./OverlayHeader.css";
export const OverlayHeader = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const onClickClose = (e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_PANEL' });
    history.push('/');
  };
  
  return(
    <div className="overlay-header">
      <div className="overlay-header-close-button">
        <Button variant="contained" onClick={props.closeCallback ? props.closeCallback : onClickClose}>
          Close
        </Button>
      </div>
      {props.children}
    </div>
  );
}