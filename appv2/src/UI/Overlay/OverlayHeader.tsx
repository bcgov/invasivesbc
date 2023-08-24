import { Button } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

import "./OverlayHeader.css";
import { OVERLAY_MENU_TOGGLE } from "state/actions";
export const OverlayHeader = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const AppMode = useSelector((state: any) => state.AppMode)


  const onClickClose = (e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_PANEL' });
    history.push('/');
  };
  
  return(
    <div className="overlay-header">
      <div className="overlay-header-close-button">
        <Button variant="contained" onClick={props.closeCallback ? props.closeCallback : onClickClose}>
          Close or back
        </Button>
      </div>
        <Button variant="contained" onClick={()=>  {dispatch({type: OVERLAY_MENU_TOGGLE })}}>MENU </Button>
      </div>
  );
}